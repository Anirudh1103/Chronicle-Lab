import React from 'react';
import { motion } from 'framer-motion';

interface SimpleLoadingScreenProps {
  /**
   * Optional loading message to display below the spinner.
   * Characters will be formatted with spaces to maintain the monospace design layout.
   */
  message?: string;
}

/**
 * Premium, minimal, and dark/light adaptive full-screen loading overlay.
 * Renders a circular SVG glowing ring spinner, editorial monospace spaced text,
 * and a thin horizontal laser beam progress animation.
 */
export function SimpleLoadingScreen({ message = 'Loading...' }: SimpleLoadingScreenProps) {
  return (
    <div className="fixed inset-0 z-[9999] bg-slate-50 dark:bg-[#050814] text-slate-800 dark:text-slate-100 flex flex-col items-center justify-center select-none px-6 transition-colors duration-300">
      <style>{`
        @keyframes loading-beam {
          0% { transform: translateX(-120%); }
          100% { transform: translateX(250%); }
        }
        .animate-loading-beam {
          animation: loading-beam 1.8s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
      `}</style>

      {/* Subtle Cyan/Blue Ambient Radial Backdrop Glow */}
      <div className="absolute w-[400px] h-[400px] bg-blue-400/5 dark:bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center text-center space-y-6">
        {/* SVG Circular Glowing Spinner */}
        <div className="relative w-20 h-20">
          <svg className="w-full h-full animate-spin" viewBox="0 0 50 50" style={{ animationDuration: '1.2s' }}>
            <circle
              className="stroke-slate-200/50 dark:stroke-slate-800/40"
              cx="25"
              cy="25"
              r="20"
              fill="none"
              strokeWidth="1.5"
            />
            <circle
              className="stroke-blue-500 dark:stroke-sky-400"
              cx="25"
              cy="25"
              r="20"
              fill="none"
              strokeWidth="1.5"
              strokeDasharray="32 150"
              strokeLinecap="round"
              style={{
                filter: 'drop-shadow(0px 0px 4px var(--spinner-glow, rgba(56, 189, 248, 0.7)))',
              }}
            />
          </svg>
        </div>

        {/* Monospace Editorial Text */}
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="text-[10px] sm:text-xs font-mono uppercase tracking-[0.4em] text-slate-500 dark:text-slate-400 font-semibold select-none pt-2"
        >
          {message}
        </motion.div>

        {/* Horizontal Laser Glow Beam Progress Indicator */}
        <div className="w-48 h-[1px] bg-slate-200 dark:bg-slate-800/40 relative overflow-hidden mt-6">
          <div
            className="absolute top-0 bottom-0 w-20 bg-gradient-to-r from-transparent via-blue-500 to-transparent dark:via-sky-400 animate-loading-beam"
            style={{
              filter: 'drop-shadow(0px 0px 3px var(--beam-glow, rgba(56, 189, 248, 0.6)))',
            }}
          />
        </div>
      </div>
    </div>
  );
}
