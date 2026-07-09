import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ParticleBackground } from './ParticleBackground';
import { AnimatedTitle, AnimatedSubtitle, AnimatedDivider } from './IntroTypography';
import { INTRO_TIMING, INTRO_COLORS } from '../../constants/intro';

interface IntroScreenProps {
  onComplete: () => void;
  theme: 'light' | 'dark';
}

export const IntroScreen: React.FC<IntroScreenProps> = ({ onComplete, theme }) => {
  const isDark = theme === 'dark';
  const colors = isDark ? INTRO_COLORS.DARK : INTRO_COLORS.LIGHT;
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const totalDuration =
      INTRO_TIMING.INITIAL_DELAY +
      INTRO_TIMING.TITLE_FADE +
      INTRO_TIMING.SUBTITLE_DELAY +
      INTRO_TIMING.SUBTITLE_FADE +
      INTRO_TIMING.HOLD_BEFORE_EXIT;

    const timer = setTimeout(() => {
      setIsExiting(true);
      // Wait for exit animation to finish before calling onComplete
      setTimeout(onComplete, INTRO_TIMING.EXIT_DURATION);
    }, totalDuration);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            y: -20,
            transition: { duration: INTRO_TIMING.EXIT_DURATION / 1000, ease: 'easeInOut' }
          }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
          style={{ backgroundColor: colors.bg }}
        >
          {/* Subtle Ambient Radial Glow */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 2,
              delay: 0.5,
              repeat: Infinity,
              repeatType: 'reverse'
            }}
            className="absolute w-[600px] h-[600px] rounded-full pointer-events-none blur-[120px] z-0"
            style={{ backgroundColor: colors.accent }}
          />

          <ParticleBackground isDark={isDark} />

          <div className="flex flex-col items-center">
            <AnimatedTitle />
            <AnimatedDivider />
            <AnimatedSubtitle />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
