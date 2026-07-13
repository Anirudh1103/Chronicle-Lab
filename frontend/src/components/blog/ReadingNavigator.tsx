import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, useScroll, useSpring, useTransform } from 'framer-motion';
import {
  Check,
  ArrowUp,
  X,
  Navigation,
  Target,
  List
} from 'lucide-react';
import { useReadingProgress } from '../../hooks/useReadingProgress';
import { EditorBlock } from '../../types/editor';
import { cn } from '../../utils/cn';

interface ReadingNavigatorProps {
  blocks: EditorBlock[];
}

export const ReadingNavigator: React.FC<ReadingNavigatorProps> = ({ blocks }) => {
  const { tree, activeId, completedIds } = useReadingProgress(blocks);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { scrollYProgress } = useScroll({
    offset: ["start start", "end end"]
  });

  const scrollProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      window.scrollTo({
        top: el.offsetTop - 120,
        behavior: 'smooth'
      });
    }
  };

  if (tree.length === 0) return null;
  if (typeof document === 'undefined') return null;

  return createPortal(
    <>
      {/* Premium Viewport-Anchored Navigator */}
      <aside
        className={cn(
          "fixed left-8 top-1/2 -translate-y-1/2 z-[10000] hidden xl:flex flex-col transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]",
          isExpanded ? "w-80" : "w-16"
        )}
      >
        <div
          className="relative flex flex-col items-center bg-slate-950/60 backdrop-blur-2xl border border-white/10 rounded-[3rem] p-4 py-10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] group overflow-hidden"
          style={{ height: '70vh' }}
          onMouseEnter={() => setIsExpanded(true)}
          onMouseLeave={() => setIsExpanded(false)}
        >
          {/* Header Identity */}
          <div className="flex flex-col items-center gap-2 mb-10 shrink-0">
             <div className="w-9 h-9 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                <List size={18} />
             </div>
             {isExpanded && (
               <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400"
               >
                 Table of Contents
               </motion.span>
             )}
          </div>

          <div className="relative flex-1 w-full">
            {/* CENTRAL RAIL - Mathematically centered in the component */}
            <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-[2px] bg-white/5 rounded-full z-0" />

            {/* PROGRESS SIGNAL - Liquid flow passing EXACTLY through center of dots */}
            <motion.div
              className="absolute left-1/2 -translate-x-1/2 top-0 w-[2px] bg-gradient-to-b from-primary via-blue-400 to-primary shadow-[0_0_15px_rgba(59,130,246,0.6)] origin-top rounded-full z-10"
              style={{ height: useTransform(scrollProgress, [0, 1], ["0%", "100%"]) }}
            />

            {/* INTERACTIVE NODES */}
            <div className="relative flex flex-col justify-between h-full w-full py-2 z-20">
              {tree.map((node) => {
                const isActive = activeId === node.id;
                const isRead = completedIds.has(node.id) && !isActive;

                return (
                  <div key={node.id} className="relative flex items-center w-full group/node h-10">
                    {/* Node Dot - Centered exactly on the rail line */}
                    <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center w-10 h-10">
                        {isActive && (
                            <motion.div
                            layoutId="scanner-ring"
                            className="absolute inset-0 rounded-full border-2 border-primary/40"
                            animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            />
                        )}

                        <button
                            onClick={() => scrollTo(node.id)}
                            className={cn(
                                "w-4 h-4 rounded-full border-2 transition-all duration-500 flex items-center justify-center bg-slate-900 z-30",
                                isActive
                                ? "bg-primary border-primary scale-[1.5] shadow-[0_0_20px_rgba(59,130,246,0.8)]"
                                : isRead
                                    ? "bg-primary border-primary"
                                    : "border-white/10 group-hover/node:border-primary group-hover/node:scale-125"
                            )}
                        >
                            {isRead && <Check size={10} className="text-white" strokeWidth={4} />}
                            {isActive && <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />}
                        </button>
                    </div>

                    {/* TOC LABEL - Positioned strictly to the RIGHT of the dots */}
                    <div className="absolute left-[calc(50%+24px)] right-0 overflow-hidden">
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.button
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -10 }}
                              onClick={() => scrollTo(node.id)}
                              className={cn(
                                "text-[10px] font-black uppercase tracking-[0.2em] text-left truncate w-full transition-all duration-300 pr-4",
                                isActive
                                  ? "text-primary translate-x-2"
                                  : "text-slate-500 group-hover/node:text-white"
                              )}
                            >
                              {node.text}
                            </motion.button>
                          )}
                        </AnimatePresence>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dock Footer */}
          <div className="w-full flex justify-center mt-10 border-t border-white/5 pt-8 shrink-0">
             <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="p-3.5 rounded-[1.25rem] bg-white/5 text-slate-500 hover:text-primary hover:bg-primary/10 transition-all active:scale-90 shadow-xl"
             >
               <ArrowUp size={20} />
             </button>
          </div>
        </div>
      </aside>

      {/* Mobile Menu */}
      <div className="fixed bottom-6 left-6 z-[10000] xl:hidden">
         <AnimatePresence>
           {isMobileMenuOpen && (
             <motion.div
               initial={{ opacity: 0, scale: 0.9, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.9, y: 20 }}
               className="w-80 max-h-[60vh] glass rounded-[2.5rem] p-8 overflow-y-auto no-scrollbar shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)] border border-white/20 mb-4"
             >
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-xl text-primary"><List size={16} /></div>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">Table of Contents</span>
                  </div>
                  <button onClick={() => setIsMobileMenuOpen(false)} className="text-slate-400 p-2"><X size={20} /></button>
                </div>
                <div className="space-y-6">
                  {tree.map(node => (
                    <button
                      key={node.id}
                      onClick={() => { scrollTo(node.id); setIsMobileMenuOpen(false); }}
                      className={cn(
                        "text-[10px] font-black uppercase tracking-widest text-left flex items-center gap-4 w-full transition-all",
                        activeId === node.id ? "text-primary translate-x-2" : "text-slate-500"
                      )}
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-current" />
                      <span className="flex-1 truncate">{node.text}</span>
                    </button>
                  ))}
                </div>
             </motion.div>
           )}
         </AnimatePresence>

         <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="w-16 h-16 rounded-[2rem] bg-slate-950/90 backdrop-blur-xl text-white shadow-2xl flex items-center justify-center relative overflow-hidden border border-white/10 group active:scale-90 transition-transform"
         >
            <motion.div
              className="absolute bottom-0 left-0 right-0 bg-primary/40"
              style={{ height: useTransform(scrollYProgress, [0, 1], ["0%", "100%"]) }}
            />
            <div className="relative z-10 flex flex-col items-center gap-0.5">
               <span className="text-[9px] font-black">{Math.round(scrollYProgress.get() * 100)}%</span>
               <Navigation size={22} className={cn("transition-transform duration-500", isMobileMenuOpen && "rotate-45")} />
            </div>
         </button>
      </div>
    </>,
    document.body
  );
};
