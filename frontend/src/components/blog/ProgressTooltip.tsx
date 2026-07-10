import React from 'react';
import { motion } from 'framer-motion';
import { Clock, CheckCircle2 } from 'lucide-react';

interface ProgressTooltipProps {
  title: string;
  sectionNumber: number;
  totalSections: number;
  progress: number;
  isCompleted: boolean;
}

export const ProgressTooltip: React.FC<ProgressTooltipProps> = ({
  title,
  sectionNumber,
  totalSections,
  progress,
  isCompleted
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, x: 10 }}
      animate={{ opacity: 1, scale: 1, x: 0 }}
      className="absolute left-full ml-4 w-64 p-4 rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 z-[110] pointer-events-none"
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-widest text-primary">
            Section {sectionNumber} of {totalSections}
          </span>
          {isCompleted && <CheckCircle2 size={14} className="text-emerald-500" />}
        </div>

        <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
          {title}
        </h4>

        <div className="h-1 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-full bg-primary"
          />
        </div>

        <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase">
          <span className="flex items-center gap-1">
            <Clock size={10} /> {Math.max(1, Math.round((1 - progress/100) * 5))} min left
          </span>
          <span>{Math.round(progress)}% Read</span>
        </div>
      </div>

      {/* Arrow */}
      <div className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-3 h-3 bg-white dark:bg-slate-900 border-l border-b border-slate-200 dark:border-slate-800 rotate-45" />
    </motion.div>
  );
};
