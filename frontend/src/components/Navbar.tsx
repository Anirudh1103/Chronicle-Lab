import React from 'react';
import { Link } from 'react-router-dom';
import { Sun, Moon, Search, Menu, PenTool } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/authStore';

interface NavbarProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export function Navbar({ theme, toggleTheme }: NavbarProps) {
  const { user } = useAuthStore();

  return (
    <nav className="fixed top-0 w-full z-50 glass border-b px-6 py-4 border-white/5">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-black tracking-tighter hover:opacity-80 transition-opacity">
          TECH<span className="text-primary/50">.BLOG</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link to="/" className="text-sm font-bold hover:text-primary transition-colors">Home</Link>
          <Link to="/categories" className="text-sm font-bold hover:text-primary transition-colors">Categories</Link>
          <Link to="/about" className="text-sm font-bold hover:text-primary transition-colors">About</Link>

          <div className="h-4 w-px bg-border mx-2" />

          <button className="p-2.5 hover:bg-muted rounded-xl transition-colors">
            <Search size={20} />
          </button>

          <button
            onClick={toggleTheme}
            className="p-2.5 hover:bg-muted rounded-xl transition-colors overflow-hidden relative"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={theme}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
              </motion.div>
            </AnimatePresence>
          </button>

          {user ? (
            <div className="flex items-center gap-4">
              <Link
                to="/admin/new"
                className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-xl text-sm font-black hover:bg-primary/20 transition-all"
              >
                <PenTool size={16} /> Write
              </Link>
              <Link
                to="/admin"
                className="bg-primary text-primary-foreground px-5 py-2 rounded-xl text-sm font-black hover:opacity-90 transition-all shadow-lg shadow-primary/20"
              >
                Dashboard
              </Link>
            </div>
          ) : (
            <Link
              to="/login"
              className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl text-sm font-black hover:opacity-90 transition-all shadow-lg shadow-primary/20"
            >
              Sign In
            </Link>
          )}
        </div>

        <button className="md:hidden p-2 hover:bg-muted rounded-xl">
          <Menu size={20} />
        </button>
      </div>
    </nav>
  );
}
