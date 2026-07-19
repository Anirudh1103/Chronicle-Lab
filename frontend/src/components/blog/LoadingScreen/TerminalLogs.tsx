import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

const LOG_ENTRIES = [
  { text: 'Initializing encrypted channel...', status: 'pending' },
  { text: 'Encryption established', status: 'success' },
  { text: 'Authenticating archive...', status: 'pending' },
  { text: 'Access granted', status: 'success' },
  { text: 'Verifying document integrity...', status: 'pending' },
  { text: 'SHA-256 verified', status: 'success' },
  { text: 'Loading article metadata...', status: 'pending' },
  { text: 'Complete & Ready', status: 'success' },
];

export function TerminalLogs() {
  const [visibleCount, setVisibleCount] = useState(1);

  useEffect(() => {
    const timer = setInterval(() => {
      setVisibleCount((prev) => {
        if (prev < LOG_ENTRIES.length) return prev + 1;
        clearInterval(timer);
        return prev;
      });
    }, 280);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full max-w-sm p-3.5 bg-slate-900/80 border border-cyan-500/20 rounded-2xl backdrop-blur-md font-mono text-[11px] select-none space-y-1.5 shadow-xl shadow-cyan-950/20">
      <div className="flex items-center justify-between pb-1.5 border-b border-white/5 text-[9px] uppercase tracking-wider text-slate-500 font-bold">
        <span>Security Audit Log</span>
        <span className="text-cyan-400">LIVE FEED</span>
      </div>

      <div className="space-y-1 max-h-36 overflow-hidden">
        {LOG_ENTRIES.slice(0, visibleCount).map((entry, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-2"
          >
            {entry.status === 'success' ? (
              <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <Check size={12} className="stroke-[3]" />
                <span>{entry.text}</span>
              </span>
            ) : (
              <span className="text-slate-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400/60 animate-ping" />
                <span>{entry.text}</span>
              </span>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
