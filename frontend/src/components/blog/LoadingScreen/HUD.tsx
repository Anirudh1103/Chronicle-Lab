import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Cpu, Wifi, Lock } from 'lucide-react';

export function HUD() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="absolute top-6 right-6 z-20 flex items-center gap-3 font-mono text-[10px] select-none"
    >
      <div className="hidden sm:flex items-center gap-4 px-4 py-2 bg-slate-900/80 border border-cyan-500/20 rounded-xl backdrop-blur-md shadow-lg shadow-cyan-950/30 text-slate-400">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-slate-500 uppercase">Connection</span>
          <span className="text-cyan-400 font-bold">Secure</span>
        </div>

        <div className="w-px h-3 bg-white/10" />

        <div className="flex items-center gap-1.5">
          <Lock size={11} className="text-cyan-400" />
          <span className="text-slate-500 uppercase">Cipher</span>
          <span className="text-slate-200 font-bold">AES-256</span>
        </div>

        <div className="w-px h-3 bg-white/10" />

        <div className="flex items-center gap-1.5">
          <Wifi size={11} className="text-emerald-400" />
          <span className="text-slate-500 uppercase">Ping</span>
          <span className="text-emerald-400 font-bold">12ms</span>
        </div>

        <div className="w-px h-3 bg-white/10" />

        <div className="flex items-center gap-1.5">
          <ShieldCheck size={11} className="text-cyan-400" />
          <span className="text-slate-500 uppercase">Archive</span>
          <span className="text-cyan-300 font-bold">Verified</span>
        </div>
      </div>

      {/* Compact Mobile HUD */}
      <div className="flex sm:hidden items-center gap-2 px-3 py-1.5 bg-slate-900/90 border border-cyan-500/20 rounded-xl backdrop-blur-md text-cyan-400 font-bold">
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
        <span>SECURE // AES-256</span>
      </div>
    </motion.div>
  );
}
