import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Quote as QuoteIcon } from 'lucide-react';
import { blogApi } from '../../api/blog.api';
import { cn } from '../../utils/cn';

interface QuoteItem {
  id: string;
  text: string;
  translation?: string;
  meaning?: string;
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
          // Shuffle quotes randomly
          const shuffled = [...data].sort(() => Math.random() - 0.5);
          setQuotes(shuffled);
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
        setQuotes([{
          id: 'default',
          text: "Curiosity is where every Chronicle begins.",
          author: "Chronicle Lab",
          category: "Philosophy"
        }]);
      } finally {
        setLoading(false);
      }
    };
    fetchQuotes();
  }, []);

  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);


  useEffect(() => {
    setProgress(0);
  }, [index]);

  useEffect(() => {
    if (quotes.length <= 1) return;
    if (isPaused) return;

    const tick = 50;
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= ROTATION_TIME) {
          setIndex((idx) => (idx + 1) % quotes.length);
          return 0;
        }
        return prev + tick;
      });
    }, tick);

    return () => clearInterval(timer);
  }, [quotes, isPaused]);

  const handlePause = () => {
    setIsPaused(true);
  };

  const handleResume = () => setIsPaused(false);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.code === 'Space') {
      e.preventDefault();
      handlePause();
    }
  };

  const handleKeyUp = (e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.code === 'Space') {
      e.preventDefault();
      handleResume();
    }
  };

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
        animate={isPaused ? { y: -5 } : { y: [0, -10, 0] }}
        transition={isPaused ? { duration: 0.3, ease: "easeOut" } : { duration: 5, repeat: Infinity, ease: "easeInOut" }}
        onMouseDown={handlePause}
        onMouseUp={handleResume}
        onMouseLeave={handleResume}
        onTouchStart={handlePause}
        onTouchEnd={handleResume}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        onBlur={handleResume}
        tabIndex={0}
        role="button"
        aria-label="Inspirational quote slideshow. Press and hold to pause rotation and read at your own pace."
        className={cn(
          "relative flex aspect-[4/5] w-full flex-col justify-between overflow-hidden rounded-[2.5rem] border border-white/15 bg-white/5 p-8 shadow-2xl backdrop-blur-3xl transition-all duration-300 hover:shadow-primary/10 sm:p-10 dark:bg-slate-900/40 glass group select-none cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/40",
          isPaused && "scale-[0.98] border-primary/30 shadow-primary/5"
        )}
      >
        {/* Status Indicator */}
        <AnimatePresence>
          {isPaused && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 0.5, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute top-8 right-8 flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.25em] text-primary"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              Paused
            </motion.div>
          )}
        </AnimatePresence>

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
                "break-words font-black italic leading-[1.1] tracking-tighter transition-all duration-500",
                isPaused 
                  ? "text-slate-950 dark:text-white opacity-100" 
                  : "text-slate-700/80 dark:text-white/80",
                getFontSizeClass(currentQuote.text)
              )}>
                "{currentQuote.text}"
              </p>
              {currentQuote.translation && (
                <div className="pt-2 border-t border-black/10 dark:border-white/10">
                  <span className="text-[8px] font-black uppercase tracking-widest text-primary block mb-0.5">Translation</span>
                  <p className={cn(
                    "text-xs font-serif italic leading-normal transition-all duration-500",
                    isPaused ? "text-slate-900 dark:text-slate-100" : "text-slate-700/70 dark:text-slate-300/70"
                  )}>
                    "{currentQuote.translation}"
                  </p>
                </div>
              )}
              {currentQuote.meaning && (
                <div className="pt-2 border-t border-black/10 dark:border-white/10">
                  <span className="text-[8px] font-black uppercase tracking-widest text-primary block mb-0.5">Meaning</span>
                  <p className={cn(
                    "text-xs leading-normal font-medium transition-all duration-500",
                    isPaused ? "text-slate-600 dark:text-slate-300" : "text-slate-500/70 dark:text-slate-400/70"
                  )}>
                    "{currentQuote.meaning}"
                  </p>
                </div>
              )}
              <div className="space-y-1.5 border-l-2 border-primary/30 pl-5">
                <p className="text-xs md:text-sm font-black text-primary uppercase tracking-[0.2em]">— {currentQuote.author}</p>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] opacity-60">{currentQuote.category}</p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Progress Bar */}
        <div className="absolute bottom-0 left-0 h-1 bg-primary/10 w-full">
          <div
            className="h-full bg-primary/40 transition-[width]"
            style={{
              width: `${(progress / ROTATION_TIME) * 100}%`,
              transitionDuration: isPaused ? '0ms' : '50ms',
              transitionTimingFunction: 'linear'
            }}
          />
        </div>
      </motion.div>

      <div className={cn(
        "flex items-center justify-center gap-4 mt-4 select-none pointer-events-none text-slate-400 dark:text-slate-500/70 transition-all duration-300",
        isPaused ? "opacity-30" : "opacity-100"
      )}>
        <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-current opacity-30" />
        <span className="text-[8.5px] font-black uppercase tracking-[0.3em]">
          Hold to read
        </span>
        <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-current opacity-30" />
      </div>
    </motion.div>
  );
};
