import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Lock } from 'lucide-react';

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
    <div className="fixed inset-0 z-[9999] bg-slate-950 text-slate-100 flex flex-col items-center justify-center select-none px-6 font-mono">
      {/* Subtle Cyan Ambient Radial Glow */}
      <div className="absolute w-[350px] h-[350px] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center text-center space-y-6 max-w-sm">
        {/* Cybersecurity Shield Icon */}
        <motion.div
          animate={{ scale: [1, 1.06, 1], opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          className="w-16 h-16 rounded-2xl bg-slate-900 border border-cyan-500/30 flex items-center justify-center shadow-[0_0_30px_rgba(14,165,233,0.25)] relative"
        >
          <ShieldCheck size={32} className="text-cyan-400 drop-shadow-[0_0_10px_rgba(56,189,248,0.8)]" />
          <div className="absolute -top-1 -right-1 p-1 bg-slate-950 rounded-full border border-emerald-500/40 text-emerald-400">
            <Lock size={10} />
          </div>
        </motion.div>

        {/* Monospace Cybersecurity LOADING... Text */}
        <div className="flex items-center gap-1.5 font-mono text-2xl sm:text-3xl font-black text-cyan-400 tracking-[0.2em]">
          {letters.map((char, index) => (
            <motion.span
              key={index}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                duration: 0.25,
                delay: index * 0.06,
                ease: 'easeOut',
              }}
            >
              {char}
            </motion.span>
          ))}

          {/* Sequential Blinking Dots */}
          <span className="inline-flex ml-1 text-cyan-300 tracking-widest">
            <motion.span animate={{ opacity: activeDots >= 1 ? 1 : 0.2 }} transition={{ duration: 0.2 }}>
              .
            </motion.span>
            <motion.span animate={{ opacity: activeDots >= 2 ? 1 : 0.2 }} transition={{ duration: 0.2 }}>
              .
            </motion.span>
            <motion.span animate={{ opacity: activeDots >= 3 ? 1 : 0.2 }} transition={{ duration: 0.2 }}>
              .
            </motion.span>
          </span>
        </div>

        {/* Cyber Progress Pulse Bar */}
        <div className="w-32 h-[2px] bg-slate-900 border border-cyan-500/20 rounded-full overflow-hidden relative">
          <motion.div
            className="h-full bg-gradient-to-r from-cyan-400 via-sky-400 to-emerald-400 rounded-full shadow-[0_0_10px_rgba(56,189,248,0.8)]"
            animate={{
              x: ['-100%', '100%'],
            }}
            transition={{
              duration: 1.3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </div>
      </div>
    </div>
  );
}
