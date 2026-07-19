import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';

interface CyberLoadingScreenProps {
  title?: string;
}

export function CyberLoadingScreen({ title }: CyberLoadingScreenProps) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center relative overflow-hidden select-none">
      {/* Subtle Ambient Radial Glow */}
      <div className="absolute w-[350px] h-[350px] bg-emerald-500/10 rounded-full blur-[90px] pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center text-center space-y-6 max-w-sm px-6">
        {/* Minimal Glowing Cyber Shield */}
        <div className="relative flex items-center justify-center">
          <motion.div
            animate={{ scale: [1, 1.08, 1], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-primary/20 border border-emerald-400/30 flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.2)]"
          >
            <ShieldCheck size={32} className="text-emerald-400" />
          </motion.div>
        </div>

        {/* Minimal Clean Text & Progress Bar */}
        <div className="space-y-3">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400">
            Secure Decryption
          </p>
          {title && (
            <h3 className="text-sm font-bold text-slate-300 line-clamp-1">
              {title}
            </h3>
          )}

          {/* Sleek Minimal Loading Line */}
          <div className="w-36 h-0.5 bg-slate-850 rounded-full overflow-hidden mx-auto relative mt-2">
            <motion.div
              className="h-full bg-gradient-to-r from-emerald-400 to-primary rounded-full shadow-[0_0_10px_rgba(16,185,129,0.8)]"
              animate={{
                x: ['-100%', '100%'],
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
