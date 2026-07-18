import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageSquare, Calendar, Trash2, User, Mail, Search, FileText, Eye, EyeOff } from 'lucide-react';
import { blogApi } from '../api/blog.api';
import { cn } from '../utils/cn';

interface CommentItem {
  id: string;
  postId: string;
  authorName: string;
  authorEmail: string;
  content: string;
  createdAt: string;
  isHidden?: boolean;
  adminReply?: string;
  post?: {
    title: string;
  };
}

export function CommentsManager() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [replyingId, setReplyingId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const { data: comments = [], isLoading } = useQuery<CommentItem[]>({
    queryKey: ['admin-comments'],
    queryFn: blogApi.getAllComments
  });

  const deleteMutation = useMutation({
    mutationFn: blogApi.deleteComment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-comments'] });
    }
  });

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleToggleVisibility = async (id: string) => {
    try {
      await blogApi.toggleCommentVisibility(id);
      queryClient.invalidateQueries({ queryKey: ['admin-comments'] });
    } catch (err) {
      alert('Failed to update comment visibility.');
    }
  };

  const handleSaveReply = async (id: string) => {
    if (!replyText.trim()) return;
    try {
      await blogApi.replyToComment(id, replyText);
      setReplyingId(null);
      setReplyText('');
      queryClient.invalidateQueries({ queryKey: ['admin-comments'] });
    } catch (err) {
      alert('Failed to save reply.');
    }
  };

  const filteredComments = comments.filter(c => 
    c.authorName.toLowerCase().includes(search.toLowerCase()) ||
    c.authorEmail.toLowerCase().includes(search.toLowerCase()) ||
    c.content.toLowerCase().includes(search.toLowerCase()) ||
    (c.post?.title || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-12 text-slate-800 dark:text-slate-100">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
            <MessageSquare className="text-primary" size={36} /> Reader Comments
          </h1>
          <p className="text-muted-foreground mt-2">
            Audit, view, and delete reader discussion comments posted on chronicles.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search comments..."
            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl outline-none focus:border-primary/50 text-slate-800 dark:text-white font-medium text-xs shadow-sm"
          />
        </div>
      </div>

      <div className="glass rounded-[3rem] overflow-hidden border border-slate-200 dark:border-white/5 shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950/60 text-slate-550 dark:text-slate-450 border-b border-slate-200 dark:border-white/5">
                <th className="p-6 font-black uppercase tracking-wider">Author</th>
                <th className="p-6 font-black uppercase tracking-wider">Chronicle Article</th>
                <th className="p-6 font-black uppercase tracking-wider">Comment Text</th>
                <th className="p-6 font-black uppercase tracking-wider">Submitted</th>
                <th className="p-6 font-black uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                [1, 2, 3].map(i => (
                  <tr key={i} className="animate-pulse border-b border-slate-100 dark:border-white/5 last:border-0">
                    <td colSpan={5} className="p-8 h-16 bg-slate-50/20 dark:bg-slate-900/10" />
                  </tr>
                ))
              ) : filteredComments.length > 0 ? (
                filteredComments.map((item) => (
                  <tr
                    key={item.id}
                    className={cn(
                      "border-b border-slate-100 dark:border-white/5 last:border-0 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors",
                      item.isHidden && "bg-red-500/5 dark:bg-red-950/10"
                    )}
                  >
                    <td className="p-6 font-bold flex items-center gap-2 text-slate-900 dark:text-slate-100">
                      <User size={14} className="text-slate-400 dark:text-slate-500" />
                      {item.authorName}
                    </td>
                    <td className="p-6 font-bold text-slate-700 dark:text-slate-300 max-w-xs truncate">
                      <span className="flex items-center gap-1.5">
                        <FileText size={14} className="text-slate-400 dark:text-slate-500" />
                        {item.post?.title || 'Unknown Post'}
                      </span>
                    </td>
                    <td className="p-6 text-slate-700 dark:text-slate-350 max-w-lg leading-relaxed whitespace-pre-wrap">
                      <div>{item.content}</div>

                      {/* Inline Admin Response display */}
                      {item.adminReply && replyingId !== item.id && (
                        <div className="border-l-2 border-primary/30 pl-3 py-1.5 mt-2 bg-primary/5 rounded-r-xl space-y-1">
                          <p className="text-[8px] uppercase tracking-widest font-black text-primary">Admin Response</p>
                          <p className="italic font-medium text-slate-700 dark:text-slate-300">"{item.adminReply}"</p>
                          <button
                            onClick={() => {
                              setReplyingId(item.id);
                              setReplyText(item.adminReply || '');
                            }}
                            className="text-[9px] text-slate-400 hover:text-primary font-bold mt-1 inline-block"
                          >
                            Edit Response
                          </button>
                        </div>
                      )}

                      {!item.adminReply && replyingId !== item.id && (
                        <button
                          onClick={() => {
                            setReplyingId(item.id);
                            setReplyText('');
                          }}
                          className="text-[9px] text-slate-400 hover:text-primary font-bold flex items-center gap-1 mt-1.5"
                        >
                          <MessageSquare size={10} /> Reply
                        </button>
                      )}

                      {replyingId === item.id && (
                        <div className="space-y-2 mt-2 pt-2 border-t border-slate-100 dark:border-white/5">
                          <textarea
                             value={replyText}
                             onChange={(e) => setReplyText(e.target.value)}
                             className="w-full bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-white/10 rounded-xl p-2.5 text-[11px] leading-normal outline-none focus:ring-1 focus:ring-primary/20 text-slate-800 dark:text-white resize-none font-medium"
                             rows={2}
                             placeholder="Type absolute professional response..."
                          />
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => setReplyingId(null)}
                              className="px-2.5 py-1 rounded bg-slate-100 dark:bg-white/5 text-slate-400 hover:text-slate-900 dark:hover:text-white text-[9px] font-black uppercase tracking-wider"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleSaveReply(item.id)}
                              className="px-2.5 py-1 rounded bg-primary text-white hover:bg-primary/95 text-[9px] font-black uppercase tracking-wider shadow"
                            >
                              Save Reply
                            </button>
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="p-6 text-slate-550 dark:text-slate-400 font-medium whitespace-nowrap">
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        {new Date(item.createdAt).toLocaleString()}
                      </span>
                    </td>
                    <td className="p-6 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleToggleVisibility(item.id)}
                        className={cn(
                          "p-3 rounded-xl transition-all mr-2",
                          item.isHidden
                            ? "bg-red-500/10 text-red-500 hover:bg-red-500/20"
                            : "bg-slate-100 dark:bg-white/5 text-slate-400 hover:text-primary hover:bg-primary/10"
                        )}
                        title={item.isHidden ? "Show Comment" : "Hide Comment"}
                      >
                        {item.isHidden ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-3 bg-slate-100 dark:bg-white/5 hover:bg-red-500/10 hover:text-red-500 dark:hover:text-red-500 rounded-xl text-slate-400 transition-all"
                        title="Delete Comment"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-muted-foreground italic font-medium">
                    No comments found matching search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
