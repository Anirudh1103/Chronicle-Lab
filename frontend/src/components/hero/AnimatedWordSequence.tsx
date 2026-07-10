import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const WORDS = ["Questions.", "Research.", "Understanding."];

interface AnimatedWordSequenceProps {
  onComplete: () => void;
}

export const AnimatedWordSequence: React.FC<AnimatedWordSequenceProps> = ({ onComplete }) => {
  const [index, setIndex] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    if (index < WORDS.length - 1) {
      const timer = setTimeout(() => {
        setIndex((prev) => prev + 1);
      }, 1200); // More deliberate cycle
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        setIsFinished(true);
        onComplete();
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [index, onComplete]);

  return (
    <div className="flex flex-col items-start gap-4">
      {/* Small cycling status */}
      <div className="h-8 overflow-hidden">
        <AnimatePresence mode="wait">
          {!isFinished && (
            <motion.span
              key={WORDS[index]}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="text-xs md:text-sm font-black uppercase tracking-[0.4em] text-primary block"
            >
              {WORDS[index]}
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Main Brand Title */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter text-slate-900 dark:text-white leading-none whitespace-nowrap"
      >
        Chronicle Lab.
      </motion.h1>
    </div>
  );
};
