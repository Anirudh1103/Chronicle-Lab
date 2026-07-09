import React from 'react';
import { motion } from 'framer-motion';
import { INTRO_TIMING } from '../../constants/intro';

export const AnimatedTitle: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: INTRO_TIMING.TITLE_FADE / 1000,
        delay: INTRO_TIMING.INITIAL_DELAY / 1000,
        ease: [0.16, 1, 0.3, 1], // Custom cinematic ease
      }}
      className="text-center space-y-2 z-10"
    >
      <span className="block text-sm md:text-base font-medium tracking-[0.3em] uppercase text-slate-500 opacity-80">
        Welcome to
      </span>
      <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-slate-900 dark:text-white">
        Chronicle Lab
      </h1>
    </motion.div>
  );
};

export const AnimatedSubtitle: React.FC = () => {
  return (
    <div className="flex flex-col items-center gap-4 z-10">
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: INTRO_TIMING.SUBTITLE_FADE / 1000,
          delay: (INTRO_TIMING.INITIAL_DELAY + INTRO_TIMING.TITLE_FADE + INTRO_TIMING.SUBTITLE_DELAY) / 1000,
        }}
        className="text-lg md:text-2xl font-medium text-slate-500 dark:text-slate-400 tracking-tight"
      >
        Where History Meets Technology
      </motion.p>

      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          duration: 1,
          delay: (INTRO_TIMING.INITIAL_DELAY + INTRO_TIMING.TITLE_FADE + INTRO_TIMING.SUBTITLE_DELAY + 400) / 1000,
        }}
        className="text-[10px] md:text-xs font-bold uppercase tracking-[0.4em] text-slate-400/60 dark:text-slate-500/60"
      >
        By Anirudh CM
      </motion.span>
    </div>
  );
};

export const AnimatedDivider: React.FC = () => {
  return (
    <motion.div
      initial={{ width: 0, opacity: 0 }}
      animate={{ width: 240, opacity: 1 }}
      transition={{
        duration: INTRO_TIMING.DIVIDER_EXPAND / 1000,
        delay: (INTRO_TIMING.INITIAL_DELAY + INTRO_TIMING.TITLE_FADE + INTRO_TIMING.SUBTITLE_DELAY + 200) / 1000,
      }}
      className="h-[1px] bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-700 to-transparent my-6 z-10"
    />
  );
};
