import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Star, ScrollText } from 'lucide-react';
import { PostCard } from '../components/PostCard';
import { HeroSection } from '../components/hero/HeroSection';
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
      <HeroSection />

      {/* Section 1: Featured Chronicles */}
      {featuredPosts.length > 0 && (
        <section id="featured-chronicles" className="space-y-16 px-6 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-amber-500">
                <Star size={20} fill="currentColor" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">Editor's Choice</span>
              </div>
              <h2 className="text-5xl font-black tracking-tighter">Featured Chronicles</h2>
            </div>
            <p className="text-muted-foreground font-medium max-w-xs leading-relaxed border-l-2 border-primary/20 pl-4">
              Handpicked deep-dives into topics that define our world.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {featuredPosts.map((post, index) => (
              <PostCard key={post.id} post={post} index={index} />
            ))}
          </div>
        </section>
      )}

      {/* Section 2: All Blogs */}
      <section id="recent-chronicles" className="space-y-16 pt-20">
        <div className="px-6 max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-primary/10 text-primary rounded-[1.5rem]">
              <ScrollText size={28} />
            </div>
            <div>
              <h2 className="text-4xl font-black tracking-tighter">Recent Explorations</h2>
              <p className="text-muted-foreground font-medium uppercase tracking-[0.2em] text-[10px] mt-1">Full Library</p>
            </div>
          </div>
          <p className="text-slate-400 text-sm italic font-medium">Swipe to explore →</p>
        </div>

        <div className="relative group overflow-hidden">
          <div className="flex overflow-x-auto gap-10 px-[max(1.5rem,calc((100vw-1280px)/2))] pb-20 no-scrollbar snap-x scroll-smooth">
            {allPosts.map((post, index) => (
              <div key={post.id} className="min-w-[320px] md:min-w-[480px] snap-center">
                <PostCard post={post} index={index} />
              </div>
            ))}
            {allPosts.length === 0 && !loading && (
              <div className="w-full py-32 flex flex-col items-center justify-center text-slate-400 gap-4">
                <div className="w-16 h-[1px] bg-slate-200 dark:bg-slate-800" />
                <p className="italic font-medium">The laboratory is currently empty...</p>
                <div className="w-16 h-[1px] bg-slate-200 dark:bg-slate-800" />
              </div>
            )}
          </div>

          {/* Premium Edge Gradients */}
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background to-transparent pointer-events-none z-10 opacity-0 md:group-hover:opacity-100 transition-opacity duration-700" />
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent pointer-events-none z-10 opacity-0 md:group-hover:opacity-100 transition-opacity duration-700" />
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
