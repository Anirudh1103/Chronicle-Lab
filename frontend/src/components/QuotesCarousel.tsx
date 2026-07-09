import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Quote } from 'lucide-react';

const QUOTES = [
  { text: "The advance of technology is based on making it fit in so that you don't even notice it.", author: "Bill Gates", category: "Tech" },
  { text: "The best way to predict the future is to invent it.", author: "Alan Kay", category: "Tech" },
  { text: "Price is what you pay. Value is what you get.", author: "Warren Buffett", category: "Finance" },
  { text: "Investing in yourself is the best investment you will ever make.", author: "Anonymus", category: "Finance" },
  { text: "The only limit to our realization of tomorrow will be our doubts of today.", author: "Franklin D. Roosevelt", category: "Motivational" },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill", category: "Motivational" },
  { text: "India is the cradle of the human race, the birthplace of human speech.", author: "Mark Twain", category: "About India" },
  { text: "Where the mind is without fear and the head is held high.", author: "Rabindranath Tagore", category: "About India" },
  { text: "Either I will come back after hoisting the Tricolour, or I will come back wrapped in it.", author: "Capt. Vikram Batra", category: "Indian Army" },
  { text: "Some goals are so worthy, it’s glorious even to fail.", author: "Capt. Manoj Kumar Pandey", category: "Indian Army" },
  { text: "If a man says he is not afraid of dying, he is either lying or he is a Gorkha.", author: "Field Marshal Sam Manekshaw", category: "Indian Army" }
];

export function QuotesCarousel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % QUOTES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const quote = QUOTES[index];

  return (
    <div className="w-full max-w-4xl mx-auto py-12 px-6">
      <div className="glass rounded-[3rem] p-10 border-white/5 relative overflow-hidden text-center min-h-[250px] flex flex-col items-center justify-center">
        <Quote className="text-primary/20 absolute top-8 left-8" size={60} />

        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.1, y: -10 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest">
              {quote.category}
            </span>
            <p className="text-2xl md:text-3xl font-bold tracking-tight leading-snug max-w-2xl">
              "{quote.text}"
            </p>
            <div className="space-y-1">
              <p className="font-black text-primary">— {quote.author}</p>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-center gap-1.5 mt-8">
          {QUOTES.map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all duration-500 ${i === index ? 'w-8 bg-primary' : 'w-2 bg-primary/10'}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
