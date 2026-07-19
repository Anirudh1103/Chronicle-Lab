import React from 'react';
import { motion } from 'framer-motion';
import { Clock, User, ArrowUpRight, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getUploadUrl } from '../utils/url';

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

export function PostCard({ post, index }: PostCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group"
    >
      <Link to={`/blog/${post.slug}`} className="block space-y-5">
        <div className="relative aspect-[16/10] rounded-[2.5rem] overflow-hidden bg-muted">
          {post.coverImage ? (
            <img
              src={getUploadUrl(post.coverImage)}
              alt={post.title}
              loading="lazy"
              decoding="async"
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <span className="font-black text-4xl opacity-10 tracking-tighter uppercase">Chronicle.Lab</span>
            </div>
          )}
          <div className="absolute bottom-6 right-6 flex items-center gap-2">
            {post.categories && post.categories.length > 0 ? (
              post.categories.map((cat, idx) => (
                <span key={idx} className="glass px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-white">
                  {cat.name}
                </span>
              ))
            ) : (
              <span className="glass px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-white">
                Uncategorized
              </span>
            )}
            {post.featured && (
              <div className="bg-amber-500 text-white p-1.5 rounded-full shadow-lg">
                <Star size={10} fill="currentColor" />
              </div>
            )}
          </div>
        </div>

        <div className="space-y-3 px-2">
          <div className="flex items-center gap-4 text-[11px] font-black uppercase tracking-widest text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Clock size={12} className="text-primary" /> {post.readingTime || 5} min read
            </div>
          </div>

          <h3 className="text-3xl font-black leading-tight tracking-tighter group-hover:text-primary transition-colors">
            {post.title}
          </h3>

          {post.subtitle && (
            <p className="text-muted-foreground line-clamp-2 leading-relaxed font-medium">
              {post.subtitle}
            </p>
          )}

          <div className="pt-2 flex items-center gap-2 text-primary font-black text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all">
            Read Article <ArrowUpRight size={14} />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
