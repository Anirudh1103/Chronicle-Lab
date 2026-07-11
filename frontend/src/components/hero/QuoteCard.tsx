import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Quote as QuoteIcon } from 'lucide-react';
import { blogApi } from '../../api/blog.api';
import { cn } from '../../utils/cn';

interface QuoteItem {
  id: string;
  text: string;
  author: string;
  category: string;
}

export const QuoteCard: React.FC = () => {
  const [quotes, setQuotes] = useState<QuoteItem[]>([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const ROTATION_TIME = 6000;

  useEffect(() => {
    const fetchQuotes = async () => {
      try {
        const data = await blogApi.getQuotes();
        if (data && data.length > 0) {
          setQuotes(data);
        } else {
          // Fallback if DB is empty
          setQuotes([{
            id: 'default',
            text: "Curiosity is where every Chronicle begins.",
            author: "Chronicle Lab",
            category: "Philosophy"
          }]);
        }
      } catch (err) {
        console.error("Failed to fetch quotes:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuotes();
  }, []);

  useEffect(() => {
    if (quotes.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % quotes.length);
    }, ROTATION_TIME);
    return () => clearInterval(timer);
  }, [quotes]);

  if (loading || quotes.length === 0) {
     return (
       <div className="aspect-[4/5] w-full max-w-[416px] animate-pulse rounded-[2.5rem] border border-white/10 bg-slate-100/10 glass dark:bg-slate-800/10" />
     );
  }

  const currentQuote = quotes[index];

  const getFontSizeClass = (text: string) => {
    const length = text.length;
    if (length > 240) return 'text-sm md:text-base';
    if (length > 150) return 'text-base md:text-lg';
    if (length > 100) return 'text-lg md:text-xl';
    if (length > 60) return 'text-xl md:text-2xl';
    return 'text-2xl md:text-3xl';
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 1, delay: 1 }}
      className="relative mx-auto w-full max-w-[416px] lg:mx-0"
    >
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="relative flex aspect-[4/5] w-full flex-col justify-between overflow-hidden rounded-[2.5rem] border border-white/15 bg-white/5 p-8 shadow-2xl backdrop-blur-3xl transition-shadow hover:shadow-primary/10 sm:p-10 dark:bg-slate-900/40 glass group"
      >
        <div className="absolute -top-4 -right-4 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
          <QuoteIcon size={160} />
        </div>

        <QuoteIcon className="mb-5 flex-shrink-0 text-primary/40 transition-colors group-hover:text-primary" size={40} />

        <div className="flex min-h-0 flex-1 flex-col justify-center py-3">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${currentQuote.id}-${index}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.6 }}
              className="space-y-5"
            >
              <p className={cn(
                "break-words font-black italic leading-[1.1] tracking-tighter text-slate-900 transition-all duration-500 dark:text-white",
                getFontSizeClass(currentQuote.text)
              )}>
                "{currentQuote.text}"
              </p>
              <div className="space-y-1.5 border-l-2 border-primary/30 pl-5">
                <p className="text-xs md:text-sm font-black text-primary uppercase tracking-[0.2em]">— {currentQuote.author}</p>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] opacity-60">{currentQuote.category}</p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Progress Bar */}
        <div className="absolute bottom-0 left-0 h-1 bg-primary/10 w-full">
          <motion.div
            key={`${currentQuote.id}-${index}`}
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: ROTATION_TIME / 1000, ease: "linear" }}
            className="h-full bg-primary/40"
          />
        </div>
      </motion.div>
    </motion.div>
  );
};
