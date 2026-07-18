import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { blogApi } from '../../api/blog.api';
import { cn } from '../../utils/cn';

interface ReactionsProps {
  postId: string;
}

export const Reactions: React.FC<ReactionsProps> = ({ postId }) => {
  const [likedState, setLikedState] = useState<'liked' | 'disliked' | null>(null);

  const handleLike = async () => {
    if (likedState) return;
    setLikedState('liked');
    try {
      await blogApi.likePost(postId);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDislike = async () => {
    if (likedState) return;
    setLikedState('disliked');
    try {
      await blogApi.dislikePost(postId);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Rate Article</span>
      <div className="flex items-center bg-slate-100/80 dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-full p-1 shadow-sm shrink-0">
        <button
          disabled={!!likedState}
          onClick={handleLike}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-l-full text-[11px] font-black uppercase tracking-wider transition-all select-none",
            likedState === 'liked'
              ? "bg-primary text-white shadow-lg shadow-primary/20"
              : "text-slate-700 dark:text-slate-350 hover:bg-slate-200 dark:hover:bg-white/5 hover:text-primary dark:hover:text-primary"
          )}
        >
          <ThumbsUp size={13} className={cn(likedState === 'liked' ? "fill-white" : "")} />
          <span>Like</span>
        </button>

        <div className="w-px h-4 bg-slate-200 dark:bg-slate-800 mx-1" />

        <button
          disabled={!!likedState}
          onClick={handleDislike}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-r-full text-[11px] font-black uppercase tracking-wider transition-all select-none",
            likedState === 'disliked'
              ? "bg-red-500 text-white shadow-lg shadow-red-500/20"
              : "text-slate-700 dark:text-slate-350 hover:bg-slate-200 dark:hover:bg-white/5 hover:text-red-500 dark:hover:text-red-500"
          )}
        >
          <ThumbsDown size={13} className={cn(likedState === 'disliked' ? "fill-white" : "")} />
          <span>Dislike</span>
        </button>
      </div>
    </div>
  );
};
