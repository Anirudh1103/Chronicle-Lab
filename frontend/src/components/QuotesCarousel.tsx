import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Quote as QuoteIcon } from 'lucide-react';
import { blogApi } from '../api/blog.api';

interface QuoteItem {
  id: string;
  text: string;
  author: string;
  category: string;
}

export function QuotesCarousel() {
  const [allQuotes, setAllQuotes] = useState<QuoteItem[]>([]);
  const [categoryIndex, setCategoryIndex] = useState(0);
  const [quoteIndex, setQuoteIndex] = useState(0);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await blogApi.getQuotes();
        // Shuffle quotes randomly
        const shuffled = [...data].sort(() => Math.random() - 0.5);
        setAllQuotes(shuffled);
      } catch (err) {
        console.error(err);
      }
    };
    fetch();
  }, []);

  const categorizedQuotes = useMemo(() => {
    const groups: Record<string, QuoteItem[]> = {};
    if (allQuotes.length === 0) {
      return {
        'Chronicle Lab': [{
          id: '1',
          text: "Curiosity is where every Chronicle begins.",
          author: "Anirudh CM",
          category: "Chronicle Lab"
        }]
      };
    }
    allQuotes.forEach(q => {
      if (!groups[q.category]) groups[q.category] = [];
      groups[q.category].push(q);
    });
    return groups;
  }, [allQuotes]);

  const categories = useMemo(() => Object.keys(categorizedQuotes), [categorizedQuotes]);

  useEffect(() => {
    if (categories.length === 0) return;

    const timer = setInterval(() => {
      setCategoryIndex((prev) => (prev + 1) % categories.length);
      setQuoteIndex((prev) => {
        const currentCat = categories[categoryIndex];
        return (prev + 1) % (categorizedQuotes[currentCat]?.length || 1);
      });
    }, 6000);

    return () => clearInterval(timer);
  }, [categoryIndex, categories, categorizedQuotes]);

  const currentCategory = categories[categoryIndex] || 'General';
  const currentQuote = categorizedQuotes[currentCategory]?.[quoteIndex] || categorizedQuotes[currentCategory]?.[0];

  if (!currentQuote) return null;

  return (
    <div className="w-full max-w-4xl mx-auto py-12 px-6">
      <div className="glass rounded-[3rem] p-10 border-white/5 relative overflow-hidden text-center min-h-[350px] flex flex-col items-center justify-center">
        <QuoteIcon className="text-primary/20 absolute top-8 left-8" size={60} />

        <AnimatePresence mode="wait">
          <motion.div
            key={`${currentCategory}-${currentQuote.id}`}
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.1, y: -10 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest">
              {currentQuote.category}
            </span>
            <p className="text-2xl md:text-3xl font-bold tracking-tight leading-snug max-w-2xl">
              "{currentQuote.text}"
            </p>
            <div className="space-y-1">
              <p className="font-black text-primary">— {currentQuote.author}</p>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-center gap-1.5 mt-8">
          {categories.map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all duration-500 ${i === categoryIndex ? 'w-8 bg-primary' : 'w-2 bg-primary/10'}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
