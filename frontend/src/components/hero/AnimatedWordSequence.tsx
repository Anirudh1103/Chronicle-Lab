import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const WORDS = ["Questions.", "Research.", "Understanding."];
const FINAL_WORD = "Chronicle Lab.";

interface AnimatedWordSequenceProps {
  onComplete: () => void;
}

export const AnimatedWordSequence: React.FC<AnimatedWordSequenceProps> = ({ onComplete }) => {
  const [index, setIndex] = useState(0);
  const [showFinal, setShowFinal] = useState(false);

  useEffect(() => {
    if (index < WORDS.length) {
      const timer = setTimeout(() => {
        setIndex((prev) => prev + 1);
      }, 2000); // Duration for each word including pause
      return () => clearTimeout(timer);
    } else {
      setShowFinal(true);
      onComplete();
    }
  }, [index, onComplete]);

  return (
    <div className="h-32 md:h-40 lg:h-52 flex items-center relative">
      <AnimatePresence mode="wait">
        {!showFinal ? (
          <motion.h1
            key={WORDS[index]}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter text-slate-900 dark:text-white leading-none whitespace-nowrap"
          >
            {WORDS[index]}
          </motion.h1>
        ) : (
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter text-slate-900 dark:text-white leading-none whitespace-nowrap"
          >
            {FINAL_WORD}
          </motion.h1>
        )}
      </AnimatePresence>
    </div>
  );
};
