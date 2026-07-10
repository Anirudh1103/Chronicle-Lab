import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Quote } from 'lucide-react';

interface QuoteItem {
  text: string;
  author: string;
  category: string;
}

const QUOTES_DATA: QuoteItem[] = [
  // Tech
  { text: "The advance of technology is based on making it fit in so that you don't even notice it.", author: "Bill Gates", category: "Tech" },
  { text: "The best way to predict the future is to invent it.", author: "Alan Kay", category: "Tech" },
  { text: "Technology is best when it brings people together.", author: "Matt Mullenweg", category: "Tech" },

  // Finance
  { text: "Price is what you pay. Value is what you get.", author: "Warren Buffett", category: "Finance" },
  { text: "Investing in yourself is the best investment you will ever make.", author: "Anonymus", category: "Finance" },
  { text: "Beware of little expenses; a small leak will sink a great ship.", author: "Benjamin Franklin", category: "Finance" },

  // Motivational
  { text: "The only limit to our realization of tomorrow will be our doubts of today.", author: "Franklin D. Roosevelt", category: "Motivational" },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill", category: "Motivational" },
  { text: "It always seems impossible until it's done.", author: "Nelson Mandela", category: "Motivational" },

  // About India
  { text: "India is the cradle of the human race, the birthplace of human speech.", author: "Mark Twain", category: "About India" },
  { text: "Where the mind is without fear and the head is held high.", author: "Rabindranath Tagore", category: "About India" },
  { text: "India has no place for anything less than excellence.", author: "Narendra Modi", category: "About India" },

  // Indian Army
  { text: "Either I will come back after hoisting the Tricolour, or I will come back wrapped in it.", author: "Capt. Vikram Batra", category: "Indian Army" },
  { text: "Some goals are so worthy, it’s glorious even to fail.", author: "Capt. Manoj Kumar Pandey", category: "Indian Army" },
  { text: "If a man says he is not afraid of dying, he is either lying or he is a Gorkha.", author: "Field Marshal Sam Manekshaw", category: "Indian Army" },
  { text: "Professional knowledge and professional competence are the main attributes of leadership.", author: "Field Marshal Sam Manekshaw", category: "Indian Army" },
  { text: "A 'Yes man' is a dangerous man. He is a menace... he can never become a leader nor can he ever be respected.", author: "Field Marshal Sam Manekshaw", category: "Indian Army" },
  { text: "Give me a Man or a Woman with Common Sense and who is not afraid of Hard Work and I will make a Leader out of him/her.", author: "Field Marshal Sam Manekshaw", category: "Indian Army" },
  { text: "I wonder whether those of our political masters can distinguish a gun from a howitzer... although a great many resemble the latter.", author: "Field Marshal Sam Manekshaw", category: "Indian Army" },
  { text: "I shall not withdraw an inch but will fight to our last man and our last round.", author: "Major Somnath Sharma", category: "Indian Army" },
  { text: "You have never lived until you have almost died, and for those who choose to fight, Life has a special flavor.", author: "Capt. R. Subramanian", category: "Indian Army" },
  { text: "The safety, honour and welfare of your country come first, always and every time.", author: "Chetwode Motto", category: "Indian Army" },
  { text: "We fight to win and win with a knock out because there are no runners up in war.", author: "General J.J. Singh", category: "Indian Army" }
];

export function QuotesCarousel() {
  // Organize quotes by category
  const categorizedQuotes = useMemo(() => {
    const groups: Record<string, QuoteItem[]> = {};
    QUOTES_DATA.forEach(q => {
      if (!groups[q.category]) groups[q.category] = [];
      groups[q.category].push(q);
    });
    return groups;
  }, []);

  // Unique categories in a specific order
  const categories = useMemo(() => ["Tech", "Finance", "Motivational", "About India", "Indian Army"], []);

  const [categoryIndex, setCategoryIndex] = useState(0);
  // Track which quote index we are on for each category to rotate through them
  const [quoteIndices, setQuoteIndices] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    categories.forEach(cat => initial[cat] = 0);
    return initial;
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCategoryIndex((prev) => (prev + 1) % categories.length);

      // Also increment the quote index for the current category so next time we see it, it's different
      setQuoteIndices(prev => {
        const currentCat = categories[categoryIndex];
        const nextIdx = (prev[currentCat] + 1) % categorizedQuotes[currentCat].length;
        return { ...prev, [currentCat]: nextIdx };
      });
    }, 6000);
    return () => clearInterval(timer);
  }, [categoryIndex, categories, categorizedQuotes]);

  const currentCategory = categories[categoryIndex];
  const currentQuote = categorizedQuotes[currentCategory][quoteIndices[currentCategory]];

  return (
    <div className="w-full max-w-4xl mx-auto py-12 px-6">
      <div className="glass rounded-[3rem] p-10 border-white/5 relative overflow-hidden text-center min-h-[300px] flex flex-col items-center justify-center">
        <Quote className="text-primary/20 absolute top-8 left-8" size={60} />

        <AnimatePresence mode="wait">
          <motion.div
            key={`${currentCategory}-${quoteIndices[currentCategory]}`}
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
