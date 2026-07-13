import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check,
  ArrowUp,
  Navigation,
  X
} from 'lucide-react';
import { useReadingProgress } from '../../hooks/useReadingProgress';
import { EditorBlock } from '../../types/editor';
import { cn } from '../../utils/cn';

interface ReadingNavigatorProps {
  blocks: EditorBlock[];
}

export const ReadingNavigator: React.FC<ReadingNavigatorProps> = ({ blocks }) => {
  const { tree, activeId, scrollProgress, completedIds } = useReadingProgress(blocks);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Use useMemo for dotPositions to prevent the infinite update depth error
  const dotPositions = useMemo(() => {
    return tree.map(node => {
      const el = document.getElementById(node.id);
      if (!el) return { id: node.id, pos: 0 };

      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      // Use offsetTop relative to the top of the body for accurate absolute positioning
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = el.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;

      const pos = (elementPosition / document.documentElement.scrollHeight) * 100;
      return { id: node.id, pos: Math.min(100, Math.max(0, pos)) };
    });
  }, [tree]); // Only recalculate when tree (headings) change

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
      {/* Premium Vertical Navigator - Fixed Left */}
      <aside className="fixed left-6 top-0 bottom-0 z-[100] hidden xl:flex flex-col items-center w-12 py-32 group">
        <div className="h-full w-[2px] bg-slate-100 dark:bg-white/5 relative rounded-full">
           {/* Animated Progress Fill */}
           <motion.div
            className="absolute top-0 left-0 w-full bg-primary origin-top shadow-[0_0_15px_rgba(59,130,246,0.5)] rounded-full"
            animate={{ height: `${scrollProgress}%` }}
            transition={{ type: 'spring', damping: 20, stiffness: 100 }}
           />

           {/* Chapter Dots */}
           <div className="absolute inset-0 pointer-events-none">
              {dotPositions.map((data, i) => (
                <div
                  key={data.id}
                  className="absolute w-full flex items-center justify-center transition-all duration-500"
                  style={{ top: `${data.pos}%` }}
                >
                  <button
                    onClick={() => scrollTo(data.id)}
                    className={cn(
                      "pointer-events-auto w-3 h-3 rounded-full border-2 transition-all duration-500 relative z-20 hover:scale-[1.8] bg-background",
                      activeId === data.id
                        ? "bg-primary border-primary scale-[2] shadow-[0_0_15px_rgba(59,130,246,0.8)]"
                        : completedIds.has(data.id)
                          ? "bg-primary/40 border-primary/40 scale-110"
                          : "bg-background border-slate-300 dark:border-slate-700"
                    )}
                  >
                     <span className="absolute left-8 top-1/2 -translate-y-1/2 px-4 py-2 glass rounded-xl text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap border border-white/10 pointer-events-none shadow-2xl">
                        {tree[i].text}
                     </span>
                  </button>
                </div>
              ))}
           </div>
        </div>

        {/* Scroll Top Portal */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="mt-8 p-3 rounded-2xl glass border border-white/10 text-slate-400 hover:text-primary hover:scale-110 transition-all shadow-xl active:scale-95"
          title="Return to Origin"
        >
          <ArrowUp size={20} />
        </button>
      </aside>

      {/* Mobile Menu */}
      <div className="fixed bottom-6 left-6 z-[200] xl:hidden">
         <AnimatePresence>
           {isMobileMenuOpen && (
             <motion.div
               initial={{ opacity: 0, scale: 0.9, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.9, y: 20 }}
               className="w-72 max-h-[60vh] glass rounded-[2.5rem] p-6 overflow-y-auto no-scrollbar shadow-2xl border border-white/20 mb-4"
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
                        activeId === node.id ? "text-primary translate-x-2" : "text-slate-500"
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
            <Navigation size={20} className={cn("relative z-10 transition-transform", isMobileMenuOpen && "rotate-45")} />
         </button>
      </div>
    </>
  );
};
