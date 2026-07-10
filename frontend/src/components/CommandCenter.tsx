import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Home,
  User,
  FileText,
  Moon,
  Sun,
  MessageSquare,
  ArrowRight,
  Command,
  X,
  History
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { blogApi } from '../api/blog.api';
import { cn } from '../utils/cn';

interface CommandCenterProps {
  isOpen: boolean;
  onClose: () => void;
  toggleTheme: () => void;
  theme: 'light' | 'dark';
}

export const CommandCenter: React.FC<CommandCenterProps> = ({ isOpen, onClose, toggleTheme, theme }) => {
  const [query, setQuery] = useState('');
  const [results, setFeaturedResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setFeaturedResults([]);
      return;
    }
    setLoading(true);
    try {
      const data = await blogApi.searchPosts(q);
      setFeaturedResults(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      handleSearch(query);
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [query, handleSearch]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        isOpen ? onClose() : onClose(); // This logic will be handled by the parent
      }
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const quickActions = [
    { icon: <Home size={18} />, label: 'Go to Home', action: () => navigate('/') },
    { icon: <User size={18} />, label: 'About the Story', action: () => navigate('/about') },
    { icon: <MessageSquare size={18} />, label: 'Give Feedback', action: () => navigate('/feedback') },
    { icon: theme === 'light' ? <Moon size={18} /> : <Sun size={18} />, label: `Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`, action: toggleTheme },
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh] px-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden"
        >
          <div className="flex items-center px-6 py-4 border-b border-slate-100 dark:border-white/5">
            <Search size={22} className="text-slate-400 mr-4" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search chronicles, technology, history..."
              className="flex-1 bg-transparent border-none outline-none text-lg text-slate-900 dark:text-white placeholder:text-slate-400"
            />
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-[10px] font-black text-slate-500 uppercase tracking-widest">ESC</span>
            </div>
          </div>

          <div className="max-h-[60vh] overflow-y-auto p-4 space-y-6 scrollbar-none">
            {/* Quick Actions */}
            {!query && (
              <div className="space-y-2">
                <p className="px-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Quick Actions</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {quickActions.map((action, i) => (
                    <button
                      key={i}
                      onClick={() => { action.action(); onClose(); }}
                      className="flex items-center gap-3 p-3 rounded-2xl hover:bg-primary/5 text-slate-600 dark:text-slate-300 hover:text-primary transition-all text-sm font-bold group"
                    >
                      <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl group-hover:bg-primary/10 transition-colors">
                        {action.icon}
                      </div>
                      {action.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Search Results */}
            {query && (
              <div className="space-y-4">
                <p className="px-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                  {loading ? 'Searching...' : `Search Results (${results.length})`}
                </p>
                <div className="space-y-2">
                  {results.map((post) => (
                    <button
                      key={post.id}
                      onClick={() => { navigate(`/blog/${post.slug}`); onClose(); }}
                      className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all border border-transparent hover:border-slate-100 dark:hover:border-white/5 group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden flex-shrink-0">
                          {post.coverImage ? (
                            <img src={post.coverImage} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px] font-black text-slate-400">CL</div>
                          )}
                        </div>
                        <div className="text-left">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">{post.title}</h4>
                          <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">{post.category?.name}</p>
                        </div>
                      </div>
                      <ArrowRight size={16} className="text-slate-300 group-hover:text-primary transition-all -translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0" />
                    </button>
                  ))}
                  {!loading && results.length === 0 && (
                    <div className="py-12 text-center space-y-4">
                      <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto">
                        <Search size={20} className="text-slate-400" />
                      </div>
                      <p className="text-sm text-slate-500 font-medium italic">No matches found for "{query}"</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="px-6 py-4 bg-slate-50 dark:bg-slate-950/50 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
              <span className="flex items-center gap-1"><Command size={12} /> K to open</span>
              <span className="flex items-center gap-1">↑↓ to navigate</span>
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-primary">Chronicle Lab Command Center</p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
