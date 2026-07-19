import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export function SimpleLoadingScreen() {
  const letters = ['L', 'O', 'A', 'D', 'I', 'N', 'G'];
  const [activeDots, setActiveDots] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveDots((prev) => (prev % 3) + 1);
    }, 400);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] bg-background text-foreground flex items-center justify-center select-none px-6">
      <div className="flex items-center gap-1 font-editorial italic font-black text-4xl sm:text-5xl md:text-6xl text-slate-900 dark:text-white tracking-wider">
        {letters.map((char, index) => (
          <motion.span
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              duration: 0.25,
              delay: index * 0.07,
              ease: 'easeOut',
            }}
          >
            {char}
          </motion.span>
        ))}

        {/* Blinking Dots at the end */}
        <span className="inline-flex ml-1 text-primary font-sans font-black tracking-widest">
          <motion.span
            animate={{ opacity: activeDots >= 1 ? 1 : 0.2 }}
            transition={{ duration: 0.2 }}
          >
            .
          </motion.span>
          <motion.span
            animate={{ opacity: activeDots >= 2 ? 1 : 0.2 }}
            transition={{ duration: 0.2 }}
          >
            .
          </motion.span>
          <motion.span
            animate={{ opacity: activeDots >= 3 ? 1 : 0.2 }}
            transition={{ duration: 0.2 }}
          >
            .
          </motion.span>
        </span>
      </div>
    </div>
  );
}
