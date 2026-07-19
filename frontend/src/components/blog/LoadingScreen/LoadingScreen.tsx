import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BackgroundEffects } from './BackgroundEffects';
import { HUD } from './HUD';
import { Scanner } from './Scanner';
import { StatusMessages } from './StatusMessages';
import { TerminalLogs } from './TerminalLogs';
import { ProgressBar } from './ProgressBar';

interface LoadingScreenProps {
  isLoading: boolean;
  onComplete: () => void;
}

export function LoadingScreen({ isLoading, onComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(10);
  const [phase, setPhase] = useState<'loading' | 'holding' | 'scanning' | 'done'>('loading');

  useEffect(() => {
    // Smooth progress progression from 10% to 95% while isLoading is true
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (!isLoading && prev >= 90) {
          clearInterval(timer);
          return 100;
        }
        if (prev < 90) return prev + Math.random() * 12 + 6;
        return prev;
      });
    }, 180);

    return () => clearInterval(timer);
  }, [isLoading]);

  // When isLoading becomes false and progress reaches 100%, trigger Phase 4 & 5 timeline
  useEffect(() => {
    if (!isLoading && progress >= 100 && phase === 'loading') {
      setPhase('holding');

      // Hold for 300ms
      const holdTimer = setTimeout(() => {
        setPhase('scanning');

        // Vertical Laser Scanline Sweep for 600ms
        const scanTimer = setTimeout(() => {
          setPhase('done');
          onComplete();
        }, 650);

        return () => clearTimeout(scanTimer);
      }, 300);

      return () => clearTimeout(holdTimer);
    }
  }, [isLoading, progress, phase, onComplete]);

  if (phase === 'done') return null;

  return (
    <AnimatePresence>
      <motion.div
        key="classified-loading-screen"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="fixed inset-0 z-[9999] bg-slate-950 flex flex-col items-center justify-between py-12 px-6 overflow-hidden select-none"
      >
        {/* Background Grid & Particles */}
        <BackgroundEffects />

        {/* Top-Right Glassmorphic HUD Metrics */}
        <HUD />

        {/* Central Core Content Container */}
        <div className="relative z-10 my-auto flex flex-col items-center text-center space-y-8 w-full max-w-md">
          {/* Scanner & Rotating Logo Ring */}
          <Scanner />

          {/* Dynamic Status Message */}
          <StatusMessages progress={progress} />

          {/* Progress Bar & Percentage Counter */}
          <ProgressBar progress={progress} />

          {/* Security Audit Terminal Stream */}
          <TerminalLogs />
        </div>

        {/* Phase 5: Vertical Laser Scanline Sweep Beam */}
        {phase === 'scanning' && (
          <motion.div
            initial={{ y: '-100%' }}
            animate={{ y: '200%' }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
            className="absolute inset-x-0 h-24 bg-gradient-to-b from-transparent via-cyan-400/50 to-transparent border-b-2 border-cyan-300 shadow-[0_0_40px_rgba(56,189,248,0.8)] pointer-events-none z-50"
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
}
