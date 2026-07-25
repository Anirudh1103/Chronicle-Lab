import React from 'react';
import { motion } from 'framer-motion';
import { Clock, ArrowUpRight, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getUploadUrl } from '../utils/url';
import { cn } from '../utils/cn';

interface PostCardProps {
  post: {
    id: string;
    title: string;
    subtitle?: string;
    slug: string;
    coverImage?: string;
    author: { name: string };
    categories?: Array<{ id: string; name: string }>;
    readingTime?: number;
    createdAt: string;
    featured?: boolean;
  };
  index: number;
}

/**
 * Maps category names dynamically to premium theme colors.
 * Light mode gets a soft pastel pill background.
 * Dark mode gets a transparent pill background with a subtle border.
 */
const getCategoryStyle = (name: string) => {
  const clean = name.trim().toLowerCase();
  
  if (clean.includes('history')) {
    return {
      dot: 'bg-amber-500 dark:bg-amber-400',
      pill: 'bg-amber-500/10 dark:bg-transparent dark:border dark:border-amber-500/30 text-amber-800 dark:text-amber-400'
    };
  }
  
  if (clean.includes('military') || clean.includes('war') || clean.includes('defense') || clean.includes('army')) {
    return {
      dot: 'bg-emerald-500 dark:bg-emerald-400',
      pill: 'bg-emerald-500/10 dark:bg-transparent dark:border dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-400'
    };
  }
  
  if (clean.includes('tech') || clean.includes('science') || clean.includes('dev') || clean.includes('digital')) {
    return {
      dot: 'bg-blue-500 dark:bg-blue-400',
      pill: 'bg-blue-500/10 dark:bg-transparent dark:border dark:border-blue-500/30 text-blue-800 dark:text-blue-400'
    };
  }

  // Soft color hashing fallback for any user-created tags/categories
  const colors = [
    {
      dot: 'bg-blue-500 dark:bg-blue-400',
      pill: 'bg-blue-500/10 dark:bg-transparent dark:border dark:border-blue-500/30 text-blue-800 dark:text-blue-400'
    },
    {
      dot: 'bg-amber-500 dark:bg-amber-400',
      pill: 'bg-amber-500/10 dark:bg-transparent dark:border dark:border-amber-500/30 text-amber-800 dark:text-amber-400'
    },
    {
      dot: 'bg-emerald-500 dark:bg-emerald-400',
      pill: 'bg-emerald-500/10 dark:bg-transparent dark:border dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-400'
    },
    {
      dot: 'bg-purple-500 dark:bg-purple-400',
      pill: 'bg-purple-500/10 dark:bg-transparent dark:border dark:border-purple-500/30 text-purple-800 dark:text-purple-400'
    },
    {
      dot: 'bg-rose-500 dark:bg-rose-400',
      pill: 'bg-rose-500/10 dark:bg-transparent dark:border dark:border-rose-500/30 text-rose-800 dark:text-rose-400'
    },
  ];

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const idx = Math.abs(hash) % colors.length;
  return colors[idx];
};

/**
 * PostCard component representing a single blog post item on the main feed and library pages.
 * Displays cover image, read time, category tags, title, and excerpt.
 */
export function PostCard({ post, index }: PostCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group select-none"
    >
      <Link to={`/blog/${post.slug}`} className="block space-y-4">
        {/* Cover Image Container (Clean, no overlays) */}
        <div className="relative aspect-[16/10] rounded-[2rem] overflow-hidden bg-muted transition-shadow duration-300 group-hover:shadow-[0_10px_30px_rgba(0,0,0,0.15)] dark:group-hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
          {post.coverImage ? (
            <img
              src={getUploadUrl(post.coverImage)}
              alt={post.title}
              loading="lazy"
              decoding="async"
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700 ease-out"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-slate-100 dark:bg-slate-900">
              <span className="font-black text-4xl opacity-10 tracking-tighter uppercase font-mono">Chronicle.Lab</span>
            </div>
          )}
        </div>

        {/* Content Section below the cover image */}
        <div className="space-y-3 px-1 text-left">
          {/* Read Time & Featured Star row */}
          <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-widest text-slate-450 dark:text-slate-500">
            <div className="flex items-center gap-1.5">
              <Clock size={12} className="text-blue-500 dark:text-sky-400" />
              <span>{post.readingTime || 5} min read</span>
            </div>
            {post.featured && (
              <Star size={14} className="text-slate-400 dark:text-slate-500" />
            )}
          </div>

          {/* Tags (Categories) Row */}
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {post.categories && post.categories.length > 0 ? (
              post.categories.map((cat, idx) => {
                const styles = getCategoryStyle(cat.name);
                return (
                  <span
                    key={idx}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider transition-colors duration-200",
                      styles.pill
                    )}
                  >
                    <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", styles.dot)} />
                    {cat.name}
                  </span>
                );
              })
            ) : (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-600 shrink-0" />
                Uncategorized
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="text-2xl sm:text-3xl font-black leading-tight tracking-tighter text-slate-800 dark:text-slate-100 group-hover:text-blue-500 dark:group-hover:text-sky-400 transition-colors duration-300">
            {post.title}
          </h3>

          {/* Subtitle / Excerpt */}
          {post.subtitle && (
            <p className="text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed text-sm font-medium">
              {post.subtitle}
            </p>
          )}

          {/* Read Article Slide-in Link */}
          <div className="pt-1 flex items-center gap-1.5 text-blue-500 dark:text-sky-400 font-black text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300">
            Read Article <ArrowUpRight size={14} />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
