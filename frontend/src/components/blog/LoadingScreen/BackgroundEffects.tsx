import React from 'react';
import { motion } from 'framer-motion';

export function BackgroundEffects() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
      {/* 1. Deep Obsidian Base */}
      <div className="absolute inset-0 bg-slate-950" />

      {/* 2. Cybernetic Grid Matrix */}
      <div
        className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#0ea5e915_1px,transparent_1px),linear-gradient(to_bottom,#0ea5e915_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_50%,#000_70%,transparent_100%)]"
      />

      {/* 3. Ambient Radial Glows */}
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.15, 0.25, 0.15],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute w-[650px] h-[650px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-cyan-500/15 rounded-full blur-[140px]"
      />
      <motion.div
        animate={{
          scale: [1.1, 1, 1.1],
          opacity: [0.1, 0.2, 0.1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute w-[500px] h-[500px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-emerald-500/10 rounded-full blur-[120px]"
      />

      {/* 4. Moving Light Sweep Beam */}
      <motion.div
        initial={{ x: '-100%', opacity: 0 }}
        animate={{
          x: ['-100%', '200%'],
          opacity: [0, 0.15, 0],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          repeatDelay: 2,
          ease: 'easeInOut',
        }}
        className="absolute top-0 bottom-0 w-1/3 bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent transform -skew-x-12"
      />

      {/* 5. Faint Blueprint Scanlines */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(14,165,233,0.03)_1px,transparent_1px)] bg-[size:100%_4px]" />
    </div>
  );
}
