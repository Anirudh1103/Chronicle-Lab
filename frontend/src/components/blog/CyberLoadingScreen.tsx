import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Lock, Terminal, Cpu, Zap, Sparkles } from 'lucide-react';

interface CyberLoadingScreenProps {
  title?: string;
}

export function CyberLoadingScreen({ title }: CyberLoadingScreenProps) {
  const [progress, setProgress] = useState(15);
  const [terminalLine, setTerminalLine] = useState('[SEC_SYS] INITIALIZING CRYPTOGRAPHIC HANDSHAKE...');

  useEffect(() => {
    const lines = [
      '[SEC_SYS] INITIALIZING CRYPTOGRAPHIC HANDSHAKE...',
      '[INTEGRITY] SCANNING ARCHIVE BITCODE...',
      '[ENCRYPTION] 256-BIT QUANTUM SHIELD VERIFIED...',
      '[CHRONICLE] DECRYPTING NEURAL MATRIX...',
      '[READY] MOUNTING ARTICLE CANVAS...',
    ];

    let current = 0;
    const interval = setInterval(() => {
      current++;
      if (current < lines.length) {
        setTerminalLine(lines[current]);
        setProgress((prev) => Math.min(98, prev + 22));
      } else {
        setProgress(100);
      }
    }, 280);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center relative overflow-hidden select-none font-mono">
      {/* Background Cybernetic Grid & Radial Glow */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />
      <div className="absolute w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-lg w-full px-6 flex flex-col items-center text-center space-y-8">
        {/* Animated Cyber Shield Radar */}
        <div className="relative">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
            className="w-32 h-32 rounded-full border border-dashed border-cyan-500/30 flex items-center justify-center p-2"
          />

          <motion.div
            animate={{ scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute inset-0 m-auto w-24 h-24 rounded-full bg-gradient-to-tr from-emerald-500/20 via-cyan-500/20 to-primary/20 backdrop-blur-md border border-cyan-400/40 flex items-center justify-center shadow-[0_0_50px_rgba(16,185,129,0.25)]"
          >
            <ShieldCheck size={42} className="text-emerald-400 drop-shadow-[0_0_12px_rgba(52,211,153,0.8)]" />
          </motion.div>

          <div className="absolute -top-2 -right-2 p-1.5 bg-slate-900 border border-emerald-500/40 rounded-full text-emerald-400">
            <Lock size={14} />
          </div>
        </div>

        {/* Header & Title */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[10px] font-black tracking-widest text-emerald-400 uppercase">
            <Zap size={12} /> Secure Archive Decryption
          </div>

          <h2 className="text-xl md:text-2xl font-black text-white tracking-tight font-sans">
            {title ? `Decrypting "${title}"` : 'Loading Chronicle Archive...'}
          </h2>
        </div>

        {/* Cyberpunk Progress Bar */}
        <div className="w-full space-y-2">
          <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            <span>Cyber Shield Protection</span>
            <span className="text-emerald-400 font-extrabold">{progress}%</span>
          </div>

          <div className="w-full h-2 bg-slate-900 border border-white/10 rounded-full overflow-hidden relative">
            <motion.div
              className="h-full bg-gradient-to-r from-emerald-500 via-cyan-500 to-primary rounded-full shadow-[0_0_15px_rgba(16,185,129,0.8)]"
              initial={{ width: '0%' }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Terminal Output */}
        <div className="w-full p-4 bg-slate-900/90 border border-cyan-500/20 rounded-2xl text-left shadow-2xl space-y-1">
          <div className="flex items-center gap-2 pb-2 border-b border-white/5 text-[10px] text-slate-500 uppercase font-black">
            <Terminal size={12} className="text-cyan-400" /> Security Kernel Console
          </div>
          <p className="text-[11px] text-cyan-300 font-mono tracking-wide animate-pulse">
            {terminalLine}
          </p>
        </div>
      </div>
    </div>
  );
}
