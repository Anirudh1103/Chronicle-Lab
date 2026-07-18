import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageSquare, Send, User, Mail, Calendar, Trash2 } from 'lucide-react';
import { blogApi } from '../../api/blog.api';
import { useAuth } from '../../hooks/useAuth';
import { cn } from '../../utils/cn';

interface Comment {
  id: string;
  authorName: string;
  authorEmail: string;
  content: string;
  createdAt: string;
}

interface CommentSectionProps {
  postId: string;
}

export const CommentSection: React.FC<CommentSectionProps> = ({ postId }) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState<string | null>(null);

  const isAdmin = user && user.role === 'ADMIN';

  const { data: comments = [], isLoading } = useQuery<Comment[]>({
    queryKey: ['comments', postId],
    queryFn: () => blogApi.getComments(postId)
  });

  const commentMutation = useMutation({
    mutationFn: (payload: { authorName: string; authorEmail: string; content: string }) => 
      blogApi.addComment(postId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
      setContent('');
      setStatus('Comment submitted successfully!');
      setTimeout(() => setStatus(null), 3000);
    },
    onError: () => {
      setStatus('Failed to submit comment. Please try again.');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (commentId: string) => blogApi.deleteComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
    },
    onError: (err) => {
      console.error(err);
      alert('Failed to delete comment.');
    }
  });

  const handleDeleteComment = (commentId: string) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      deleteMutation.mutate(commentId);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !content.trim()) {
      setStatus('All fields are required.');
      return;
    }
    commentMutation.mutate({
      authorName: name.trim(),
      authorEmail: email.trim(),
      content: content.trim()
    });
  };

  return (
    <div className="space-y-6 text-slate-900 dark:text-slate-100">
      <div className="flex items-center gap-2 border-b border-slate-150 dark:border-white/5 pb-3">
        <MessageSquare className="text-primary" size={16} />
        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-900 dark:text-slate-200">Comments ({comments.length})</h3>
      </div>

      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-3">
          <div className="relative">
            <User size={13} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your Name"
              className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-2xl outline-none focus:border-primary/50 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 font-bold text-xs"
            />
          </div>
          <div className="relative">
            <Mail size={13} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your Email"
              className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-2xl outline-none focus:border-primary/50 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 font-bold text-xs"
            />
          </div>
        </div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Share your thoughts on this chronicle..."
          rows={3}
          className="w-full p-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-2xl outline-none focus:border-primary/50 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 font-semibold text-xs leading-relaxed resize-none"
        />
        <div className="flex justify-between items-center gap-4">
          {status && (
            <span className={cn(
              "text-[9px] font-black uppercase tracking-widest",
              status.includes('successfully') ? "text-emerald-500" : "text-amber-500"
            )}>
              {status}
            </span>
          )}
          <button
            type="submit"
            disabled={commentMutation.isPending}
            className="flex items-center gap-1.5 bg-primary text-white py-3 px-6 rounded-full font-black text-[9px] uppercase tracking-widest hover:opacity-90 transition-all shadow-md shrink-0 ml-auto select-none"
          >
            <Send size={10} />
            <span>{commentMutation.isPending ? 'Sending...' : 'Post Comment'}</span>
          </button>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1 no-scrollbar border-t border-slate-150 dark:border-white/5 pt-4">
        {isLoading ? (
          <div className="animate-pulse space-y-3">
            <div className="h-16 bg-slate-100 dark:bg-slate-900 rounded-2xl" />
            <div className="h-16 bg-slate-100 dark:bg-slate-900 rounded-2xl" />
          </div>
        ) : comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.id} className="p-4 rounded-[1.25rem] bg-slate-50 dark:bg-slate-900/30 border border-slate-100 dark:border-white/5 space-y-2">
              <div className="flex justify-between items-start gap-4">
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider truncate">{comment.authorName}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold flex items-center gap-1">
                    <Calendar size={10} />
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </span>
                  {isAdmin && (
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      className="text-red-500 hover:text-red-600 transition-colors p-1.5 hover:bg-red-500/10 rounded-xl"
                      title="Delete comment"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              </div>
              <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-semibold whitespace-pre-wrap break-words">{comment.content}</p>
            </div>
          ))
        ) : (
          <p className="italic text-slate-400 dark:text-slate-500 text-[10px] text-center py-4">No comments yet. Be the first to share your thoughts!</p>
        )}
      </div>
    </div>
  );
};
