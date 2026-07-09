import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sun, Moon, Search, Menu, PenTool, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/authStore';

interface NavbarProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export function Navbar({ theme, toggleTheme }: NavbarProps) {
  const { user } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <nav className="fixed top-0 w-full z-50 glass border-b px-6 py-4 border-white/5">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-black tracking-tighter hover:opacity-80 transition-opacity">
          CHRONICLE<span className="text-primary/50">.LAB</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          <Link to="/" className="text-sm font-bold hover:text-primary transition-colors">Home</Link>
          <Link to="/about" className="text-sm font-bold hover:text-primary transition-colors">About</Link>
          <Link to="/feedback" className="text-sm font-bold hover:text-primary transition-colors">Feedback</Link>

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
              {user.role === 'ADMIN' && (
                <Link
                  to="/admin/editor"
                  className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-xl text-sm font-black hover:bg-primary/20 transition-all"
                >
                  <PenTool size={16} /> Write
                </Link>
              )}
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
              className="bg-primary/10 text-primary border border-primary/20 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-primary/20 transition-all"
            >
              Admin Access
            </Link>
          )}
        </div>

        {/* Mobile Buttons */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={toggleTheme}
            className="p-2 hover:bg-muted rounded-xl"
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
          <button
            onClick={toggleMobileMenu}
            className="p-2 hover:bg-muted rounded-xl"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden pt-4 pb-6 space-y-4 border-t border-white/5 mt-4"
          >
            <Link
              to="/"
              onClick={toggleMobileMenu}
              className="block text-lg font-bold hover:text-primary transition-colors"
            >
              Home
            </Link>
            <Link
              to="/categories"
              onClick={toggleMobileMenu}
              className="block text-lg font-bold hover:text-primary transition-colors"
            >
              Categories
            </Link>
            <Link
              to="/about"
              onClick={toggleMobileMenu}
              className="block text-lg font-bold hover:text-primary transition-colors"
            >
              About
            </Link>
            <Link
              to="/feedback"
              onClick={toggleMobileMenu}
              className="block text-lg font-bold hover:text-primary transition-colors"
            >
              Feedback
            </Link>
          <div className="pt-4 flex flex-col gap-4">
            {user ? (
                <>
                  {user.role === 'ADMIN' && (
                    <Link
                      to="/admin/editor"
                      onClick={toggleMobileMenu}
                      className="flex items-center justify-center gap-2 bg-primary/10 text-primary py-4 rounded-2xl font-black"
                    >
                      <PenTool size={20} /> Write Blog
                    </Link>
                  )}
                  <Link
                    to="/admin"
                    onClick={toggleMobileMenu}
                    className="bg-primary text-primary-foreground py-4 rounded-2xl font-black text-center"
                  >
                    Dashboard
                  </Link>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={toggleMobileMenu}
                  className="bg-primary/10 text-primary py-4 rounded-2xl font-black text-center text-sm uppercase tracking-widest"
                >
                  Admin Access
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
