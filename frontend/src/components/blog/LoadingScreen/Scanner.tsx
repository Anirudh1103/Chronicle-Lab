import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Compass } from 'lucide-react';

export function Scanner() {
  return (
    <div className="relative flex items-center justify-center select-none">
      {/* 1. Outer Rotating Segmented Radar Ring */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 16, repeat: Infinity, ease: 'linear' }}
        className="w-32 h-32 md:w-36 md:h-36 rounded-full border border-dashed border-cyan-500/30 flex items-center justify-center p-2 relative"
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#38bdf8]" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-cyan-500/40" />
      </motion.div>

      {/* 2. Inner Pulse Aura & Glass Core */}
      <motion.div
        animate={{
          scale: [1, 1.04, 1],
          boxShadow: [
            '0 0 30px rgba(14,165,233,0.2)',
            '0 0 50px rgba(14,165,233,0.4)',
            '0 0 30px rgba(14,165,233,0.2)',
          ],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute w-24 h-24 md:w-28 md:h-28 rounded-full bg-gradient-to-tr from-slate-900/90 via-slate-900/60 to-cyan-950/40 border border-cyan-400/40 backdrop-blur-md flex items-center justify-center"
      >
        {/* 3. Chronicle Lab Logo Shield with Subtle 2-3 Degree Oscillation */}
        <motion.div
          animate={{ rotate: [-2.5, 2.5, -2.5] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="flex items-center justify-center"
        >
          <ShieldCheck size={44} className="text-cyan-400 drop-shadow-[0_0_12px_rgba(56,189,248,0.8)]" />
        </motion.div>
      </motion.div>
    </div>
  );
}
