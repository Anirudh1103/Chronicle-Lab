import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export function SimpleLoadingScreen() {
  const letters = ['L', 'O', 'A', 'D', 'I', 'N', 'G'];
  const [dotCount, setDotCount] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setDotCount((prev) => (prev % 3) + 1);
    }, 450);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center select-none px-6">
      <div className="flex items-center gap-1 font-editorial italic font-black text-4xl sm:text-5xl md:text-6xl text-slate-900 dark:text-white tracking-wider">
        {letters.map((char, index) => (
          <motion.span
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.3,
              delay: index * 0.08,
              ease: 'easeOut',
            }}
          >
            {char}
          </motion.span>
        ))}

        {/* Animated Dots at the end */}
        <span className="inline-flex ml-1 text-primary font-sans font-black tracking-normal">
          <span className={dotCount >= 1 ? 'opacity-100 animate-pulse' : 'opacity-20'}>.</span>
          <span className={dotCount >= 2 ? 'opacity-100 animate-pulse' : 'opacity-20'}>.</span>
          <span className={dotCount >= 3 ? 'opacity-100 animate-pulse' : 'opacity-20'}>.</span>
        </span>
      </div>
    </div>
  );
}
