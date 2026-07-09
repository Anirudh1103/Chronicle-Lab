import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Star, ScrollText } from 'lucide-react';
import { PostCard } from '../components/PostCard';
import { QuotesCarousel } from '../components/QuotesCarousel';
import { blogApi } from '../api/blog.api';

export function Home() {
  const [featuredPosts, setFeaturedPosts] = useState<any[]>([]);
  const [allPosts, setAllPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const posts = await blogApi.getAllPosts();
        // Section 1: Only "featured" tagged blogs
        setFeaturedPosts(posts.filter((p: any) => p.featured));
        // Section 2: All blogs
        setAllPosts(posts);
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  return (
    <div className="space-y-32 pb-32">
      {/* Premium Hero Section */}
      <section className="relative min-h-[70vh] flex flex-col items-center justify-center text-center px-4 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 10, repeat: Infinity }}
            className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px]"
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8 max-w-5xl"
        >
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full glass border-white/10 text-xs font-black uppercase tracking-[0.2em] text-primary">
            <Sparkles size={14} /> The Future of Tech Blogging
          </div>

          <h1 className="text-7xl md:text-9xl font-black tracking-tighter leading-[0.85] text-balance">
            Design. Code. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary/80 to-primary/40">
              Innovate.
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto font-medium leading-relaxed">
            A premium space for modern developers to explore software architecture,
            high-end UI design, and the evolving digital landscape.
          </p>
        </motion.div>
      </section>

      <QuotesCarousel />

      {/* Section 1: Featured Chronicles (Only if tagged featured) */}
      {featuredPosts.length > 0 && (
        <section className="space-y-16 px-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-500/10 text-amber-500 rounded-2xl">
              <Star size={24} fill="currentColor" />
            </div>
            <div>
              <h2 className="text-4xl font-black tracking-tighter">Featured Chronicles</h2>
              <p className="text-muted-foreground font-medium">Handpicked stories worth your time.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {featuredPosts.map((post, index) => (
              <PostCard key={post.id} post={post} index={index} />
            ))}
          </div>
        </section>
      )}

      {/* Section 2: Horizontal Scroll All Blogs */}
      <section className="space-y-12">
        <div className="px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 text-primary rounded-2xl">
              <ScrollText size={24} />
            </div>
            <div>
              <h2 className="text-4xl font-black tracking-tighter">Recent Explorations</h2>
              <p className="text-muted-foreground font-medium">Browse the full library.</p>
            </div>
          </div>
        </div>

        <div className="relative group">
          <div className="flex overflow-x-auto gap-8 px-6 pb-12 no-scrollbar snap-x scroll-smooth">
            {allPosts.map((post, index) => (
              <div key={post.id} className="min-w-[350px] md:min-w-[450px] snap-start">
                <PostCard post={post} index={index} />
              </div>
            ))}
            {allPosts.length === 0 && !loading && (
              <p className="text-slate-400 italic py-20 text-center w-full">No chronicles found yet...</p>
            )}
          </div>

          {/* Subtle gradient indicators for scroll */}
          <div className="absolute right-0 top-0 bottom-12 w-20 bg-gradient-to-l from-background to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="mx-6 glass rounded-[4rem] p-16 md:p-24 text-center space-y-10 border-white/5 relative overflow-hidden">
        <div className="max-w-2xl mx-auto space-y-6">
          <h2 className="text-5xl font-black tracking-tighter">Stay Ahead of the Curve</h2>
          <p className="text-xl text-muted-foreground font-medium">
            Join 10,000+ developers receiving curated insights.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 bg-muted/50 border border-white/5 rounded-2xl px-6 py-4 outline-none focus:ring-2 ring-primary/20 transition-all font-medium"
            />
            <button className="bg-primary text-primary-foreground px-8 py-4 rounded-2xl font-black hover:opacity-90 transition-all shadow-xl shadow-primary/20">
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
