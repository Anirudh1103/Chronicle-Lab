import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Quote as QuoteIcon } from 'lucide-react';

interface QuoteItem {
  text: string;
  author: string;
  category: string;
}

const QUOTES_DATA: QuoteItem[] = [
  { text: "The advance of technology is based on making it fit in so that you don't even notice it.", author: "Bill Gates", category: "Tech" },
  { text: "Professional knowledge and professional competence are the main attributes of leadership.", author: "Field Marshal Sam Manekshaw", category: "Indian Army" },
  { text: "The best way to predict the future is to invent it.", author: "Alan Kay", category: "Tech" },
  { text: "Either I will come back after hoisting the Tricolour, or I will come back wrapped in it.", author: "Capt. Vikram Batra", category: "Indian Army" },
  { text: "Price is what you pay. Value is what you get.", author: "Warren Buffett", category: "Finance" }
];

export const QuoteCard: React.FC = () => {
  const [index, setIndex] = useState(0);
  const ROTATION_TIME = 6000;

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % QUOTES_DATA.length);
    }, ROTATION_TIME);
    return () => clearInterval(timer);
  }, []);

  const currentQuote = QUOTES_DATA[index];

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 1, delay: 1 }} // Faster entry
      className="relative w-full max-w-[400px]"
    >
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="glass p-10 rounded-[3rem] border border-white/10 shadow-2xl backdrop-blur-3xl relative overflow-hidden group hover:shadow-primary/10 transition-shadow bg-white/5 dark:bg-slate-900/40 h-[450px] flex flex-col"
      >
        <div className="absolute -top-4 -right-4 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
          <QuoteIcon size={160} />
        </div>

        <QuoteIcon className="text-primary/40 mb-8 group-hover:text-primary transition-colors flex-shrink-0" size={40} />

        <div className="flex-1 flex flex-col justify-center overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <p className="text-lg md:text-xl font-bold tracking-tight leading-snug italic text-slate-800 dark:text-slate-100 line-clamp-6">
                "{currentQuote.text}"
              </p>
              <div className="space-y-1 border-l-2 border-primary/30 pl-4">
                <p className="text-xs font-black text-primary uppercase tracking-widest">— {currentQuote.author}</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest opacity-60">{currentQuote.category}</p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Progress Bar */}
        <div className="absolute bottom-0 left-0 h-1 bg-primary/10 w-full">
          <motion.div
            key={index}
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
