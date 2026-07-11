import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight,
  Maximize2,
  Minimize2,
  Check,
  ArrowUp,
  Share2,
  Trophy,
  X,
  Navigation
} from 'lucide-react';
import { HeadingNode } from '../../types/navigator';
import { useReadingProgress } from '../../hooks/useReadingProgress';
import { EditorBlock } from '../../types/editor';
import { cn } from '../../utils/cn';

interface ReadingNavigatorProps {
  blocks: EditorBlock[];
}

export const ReadingNavigator: React.FC<ReadingNavigatorProps> = ({ blocks }) => {
  const { tree, activeId, scrollProgress, completedIds } = useReadingProgress(blocks);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const offset = 100;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = el.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  if (tree.length === 0) return null;

  return (
    <>
      {/* Desktop Full-Length Navigator */}
      <aside className="fixed right-8 top-0 bottom-0 z-[100] w-1 hidden xl:flex flex-col items-center justify-center py-20 group hover:w-48 transition-all duration-500">
        <div className="h-full w-[2px] bg-slate-100 dark:bg-white/5 relative rounded-full">
           {/* Progress Fill */}
           <motion.div
            className="absolute top-0 w-full bg-primary origin-top shadow-[0_0_15px_rgba(59,130,246,0.5)] rounded-full"
            style={{ height: `${scrollProgress}%` }}
           />

           {/* Chapter Dots */}
           <div className="absolute inset-0 pointer-events-none">
              {tree.map((node) => {
                const el = document.getElementById(node.id);
                const pos = el ? (el.offsetTop / document.documentElement.scrollHeight) * 100 : 0;

                return (
                  <div
                    key={node.id}
                    className="absolute w-full flex items-center justify-center transition-all duration-500"
                    style={{ top: el ? `${pos}%` : '0' }}
                  >
                    <button
                      onClick={() => scrollTo(node.id)}
                      className={cn(
                        "pointer-events-auto w-3 h-3 rounded-full border-2 transition-all duration-500 relative z-20 hover:scale-150 shadow-sm",
                        activeId === node.id
                          ? "bg-primary border-primary scale-125 shadow-[0_0_10px_rgba(59,130,246,0.8)]"
                          : completedIds.has(node.id)
                            ? "bg-primary/40 border-primary/40"
                            : "bg-background border-slate-300 dark:border-slate-700"
                      )}
                    >
                       <span className="absolute right-6 top-1/2 -translate-y-1/2 px-3 py-1.5 glass rounded-lg text-[10px] font-black uppercase tracking-widest opacity-0 hover:opacity-100 transition-opacity whitespace-nowrap border border-white/10 pointer-events-none">
                          {node.text}
                       </span>
                    </button>
                  </div>
                );
              })}
           </div>
        </div>

        {/* Scroll to Top Button */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="mt-8 p-3 rounded-full glass border border-white/10 text-slate-400 hover:text-primary hover:scale-110 transition-all shadow-xl"
        >
          <ArrowUp size={16} />
        </button>
      </aside>

      {/* Completion Celebration */}
      <AnimatePresence>
        {scrollProgress > 98 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-8 right-24 z-[110] p-6 glass rounded-[2.5rem] border border-emerald-500/30 shadow-[0_20px_50px_rgba(16,185,129,0.2)] flex flex-col items-center gap-4 text-center max-w-xs"
          >
            <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl relative">
               <Trophy size={32} />
               <motion.div
                 animate={{ scale: [1, 1.5, 1], opacity: [0, 1, 0] }}
                 transition={{ duration: 2, repeat: Infinity }}
                 className="absolute inset-0 bg-emerald-500/20 rounded-2xl"
               />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight">Chronicle Completed</h3>
              <p className="text-xs text-slate-500 font-medium">Knowledge archived successfully.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu */}
      <div className="fixed bottom-6 left-6 z-[200] xl:hidden">
         <AnimatePresence>
           {isMobileMenuOpen && (
             <motion.div
               initial={{ opacity: 0, scale: 0.9, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.9, y: 20 }}
               className="w-72 max-h-[60vh] glass rounded-3xl p-6 overflow-y-auto no-scrollbar shadow-2xl border border-white/20 mb-4"
             >
                <div className="flex items-center justify-between mb-6 pb-2 border-b border-white/10">
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-50">Map</span>
                  <button onClick={() => setIsMobileMenuOpen(false)} className="text-slate-400"><X size={16} /></button>
                </div>
                <div className="space-y-4">
                  {tree.map(node => (
                    <button
                      key={node.id}
                      onClick={() => { scrollTo(node.id); setIsMobileMenuOpen(false); }}
                      className={cn(
                        "text-xs font-bold text-left block w-full truncate transition-all",
                        activeId === node.id ? "text-primary translate-x-2" : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                      )}
                    >
                      {node.text}
                    </button>
                  ))}
                </div>
             </motion.div>
           )}
         </AnimatePresence>

         <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="w-14 h-14 rounded-2xl bg-slate-900/90 backdrop-blur-md text-white shadow-2xl flex items-center justify-center relative overflow-hidden border border-white/10"
         >
            <div className="absolute bottom-0 left-0 right-0 bg-primary/30 transition-all duration-500" style={{ height: `${scrollProgress}%` }} />
            <Navigation size={18} className={cn("relative z-10 transition-transform", isMobileMenuOpen && "rotate-45")} />
         </button>
      </div>
    </>
  );
};
