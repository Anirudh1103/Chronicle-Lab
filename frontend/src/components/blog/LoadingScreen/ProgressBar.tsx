import React from 'react';
import { motion } from 'framer-motion';

interface ProgressBarProps {
  progress: number;
}

export function ProgressBar({ progress }: ProgressBarProps) {
  return (
    <div className="w-full max-w-sm space-y-2 select-none font-mono">
      {/* Header & Percentage Display */}
      <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-wider">
        <span className="text-slate-500">Decryption Progress</span>
        <span className="text-cyan-400 font-extrabold">{Math.round(progress)}%</span>
      </div>

      {/* Sleek 2.5px Gradient Track */}
      <div className="w-full h-[3px] bg-slate-900 border border-cyan-500/20 rounded-full overflow-hidden relative shadow-inner">
        <motion.div
          className="h-full bg-gradient-to-r from-cyan-400 via-sky-400 to-emerald-400 rounded-full shadow-[0_0_12px_rgba(56,189,248,0.9)]"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}
