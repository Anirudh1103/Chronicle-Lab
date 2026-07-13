import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { blogApi } from '../../api/blog.api';
import { cn } from '../../utils/cn';

interface ReactionsProps {
  postId: string;
  initialCounts: {
    Historic: number;
    Brilliant: number;
    Insightful: number;
  };
}

export const Reactions: React.FC<ReactionsProps> = ({ postId, initialCounts }) => {
  const [counts, setCounts] = useState(initialCounts);
  const [reacted, setReacted] = useState<string | null>(null);

  const handleReact = async (type: 'Historic' | 'Brilliant' | 'Insightful') => {
    if (reacted) return;
    setReacted(type);
    setCounts(prev => ({ ...prev, [type]: prev[type] + 1 }));
    try {
      await blogApi.reactToPost(postId, type);
    } catch (err) {
      console.error(err);
    }
  };

  const reactionTypes = [
    { type: 'Historic' as const, emoji: '🏛️', label: 'Historic' },
    { type: 'Brilliant' as const, emoji: '🧠', label: 'Brilliant' },
    { type: 'Insightful' as const, emoji: '🔍', label: 'Insightful' },
  ];

  return (
    <div className="flex flex-wrap items-center gap-4 py-12 border-y border-slate-100 dark:border-slate-800">
      <p className="text-xs font-black uppercase tracking-widest text-slate-400 mr-4">Chronicle Reflections</p>
      <div className="flex items-center gap-3">
        {reactionTypes.map((rt) => (
          <button
            key={rt.type}
            disabled={!!reacted}
            onClick={() => handleReact(rt.type)}
            className={cn(
              "group relative flex items-center gap-2 px-4 py-2 rounded-2xl transition-all border",
              reacted === rt.type
                ? "bg-primary border-primary text-white shadow-lg shadow-primary/20 scale-105"
                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-primary/50 text-slate-600 dark:text-slate-300"
            )}
          >
            <span className="text-lg">{rt.emoji}</span>
            <span className="text-xs font-bold">{counts[rt.type] || 0}</span>

            {/* Burst Animation on Click */}
            {reacted === rt.type && (
              <motion.div
                initial={{ scale: 0, opacity: 1 }}
                animate={{ scale: 2, opacity: 0 }}
                className="absolute inset-0 bg-primary/20 rounded-full pointer-events-none"
              />
            )}

            {/* Hover Tooltip */}
            {!reacted && (
              <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-white/10 pointer-events-none z-50">
                {rt.label}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
