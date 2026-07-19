import React from 'react';
import { motion } from 'framer-motion';

interface CyberLoadingScreenProps {
  title?: string;
}

export function CyberLoadingScreen({ title }: CyberLoadingScreenProps) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center relative select-none px-6">
      <div className="flex flex-col items-center text-center space-y-6 max-w-md">
        {/* Editorial Minimal Loading Header */}
        <div className="space-y-2">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">
            Chronicle Lab
          </p>
          <h2 className="text-3xl md:text-4xl font-editorial italic font-black text-slate-900 dark:text-white">
            Loading...
          </h2>
        </div>

        {/* Minimal Theme Loading Line */}
        <div className="w-32 h-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden relative">
          <motion.div
            className="h-full bg-primary rounded-full"
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
  );
}
