import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Library, Hash, Search, FilterX } from 'lucide-react';
import { PostCard } from '../components/PostCard';
import { blogApi } from '../api/blog.api';
import { cn } from '../utils/cn';

export function LibraryPage() {
  const [allPosts, setAllPosts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | 'ALL'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Library | Chronicle Lab";
    const fetchData = async () => {
      try {
        const [posts, cats] = await Promise.all([
          blogApi.getAllPosts('PUBLISHED'),
          blogApi.getCategories()
        ]);

        setAllPosts(posts);
        setCategories(cats.filter((c: any) => posts.some((p: any) => p.categoryId === c.id)));
      } catch (error) {
        console.error("Error fetching library data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredPosts = useMemo(() => {
    return allPosts.filter(post => {
      const matchesCategory = activeCategory === 'all' || post.categoryId === activeCategory;
      const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           post.subtitle?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [allPosts, activeCategory, searchQuery]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="font-black text-xs uppercase tracking-[0.3em] text-slate-400">Accessing Archive...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-40 space-y-20">
      {/* Header Section */}
      <header className="px-6 max-w-7xl mx-auto space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-slate-100 dark:border-white/5 pb-12">
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-primary">
              <Library size={24} />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">Central Archive</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter">The Library</h1>
          </div>
          <p className="text-muted-foreground font-medium max-w-md leading-relaxed border-l-2 border-primary/20 pl-6">
            Explore the complete collection of chronicles, technical investigations, and historical research.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col md:flex-row gap-6">
          <div className="relative flex-1 group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title or investigation briefing..."
              className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-white/5 pl-14 pr-6 py-5 rounded-3xl outline-none focus:ring-2 ring-primary/20 transition-all font-medium"
            />
          </div>
        </div>
      </header>

      <div className="px-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-16">
        {/* Domain Sidebar */}
        <aside className="space-y-8 lg:sticky lg:top-32 h-fit">
          <div className="space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 pl-2">Filter by Domain</h4>
            <div className="space-y-2">
              <button
                onClick={() => setActiveCategory('all')}
                className={cn(
                  "w-full flex items-center justify-between p-5 rounded-2xl transition-all duration-300 group",
                  activeCategory === 'all'
                    ? "bg-primary text-white shadow-xl shadow-primary/20 translate-x-2"
                    : "hover:bg-slate-50 dark:hover:bg-white/5 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                )}
              >
                <div className="flex items-center gap-4">
                  <Hash size={18} className={activeCategory === 'all' ? "opacity-100" : "opacity-30 group-hover:opacity-100"} />
                  <span className="font-black text-xs uppercase tracking-widest">All Collections</span>
                </div>
                <div className={cn(
                  "px-2 py-1 rounded-lg text-[10px] font-black",
                  activeCategory === 'all' ? "bg-white/20" : "bg-slate-100 dark:bg-white/5"
                )}>
                  {allPosts.length}
                </div>
              </button>

              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={cn(
                    "w-full flex items-center justify-between p-5 rounded-2xl transition-all duration-300 group",
                    activeCategory === cat.id
                      ? "bg-primary text-white shadow-xl shadow-primary/20 translate-x-2"
                      : "hover:bg-slate-50 dark:hover:bg-white/5 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <Hash size={18} className={activeCategory === cat.id ? "opacity-100" : "opacity-30 group-hover:opacity-100"} />
                    <span className="font-black text-xs uppercase tracking-widest">{cat.name}</span>
                  </div>
                  <div className={cn(
                    "px-2 py-1 rounded-lg text-[10px] font-black",
                    activeCategory === cat.id ? "bg-white/20" : "bg-slate-100 dark:bg-white/5"
                  )}>
                    {allPosts.filter(p => p.categoryId === cat.id).length}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Results Area */}
        <div className="space-y-12">
          <AnimatePresence mode="wait">
            {filteredPosts.length > 0 ? (
              <motion.div
                key={activeCategory + searchQuery}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-12"
              >
                {filteredPosts.map((post, index) => (
                  <PostCard key={post.id} post={post} index={index} />
                ))}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-40 flex flex-col items-center justify-center text-slate-400 gap-6 border-2 border-dashed border-slate-100 dark:border-white/5 rounded-[3rem]"
              >
                <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-full">
                   <FilterX size={40} className="opacity-20" />
                </div>
                <div className="text-center space-y-2">
                  <p className="font-black text-sm uppercase tracking-widest">No Matches Found</p>
                  <p className="text-xs font-medium opacity-60 italic">Your search criteria yielded no archival results.</p>
                </div>
                <button
                   onClick={() => { setActiveCategory('all'); setSearchQuery(''); }}
                   className="text-primary font-black text-[10px] uppercase tracking-widest hover:underline"
                >
                    Reset Archive Filter
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
