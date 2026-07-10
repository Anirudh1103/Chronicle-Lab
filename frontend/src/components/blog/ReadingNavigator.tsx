import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight,
  Maximize2,
  Minimize2,
  Check,
  ArrowUp,
  Share2,
  Trophy
} from 'lucide-react';
import { HeadingNode } from '../../types/navigator';
import { useReadingProgress } from '../../hooks/useReadingProgress';
import { EditorBlock } from '../../types/editor';
import { cn } from '../../utils/cn';
import { ProgressTooltip } from './ProgressTooltip';

interface ReadingNavigatorProps {
  blocks: EditorBlock[];
}

export const ReadingNavigator: React.FC<ReadingNavigatorProps> = ({ blocks }) => {
  const { tree, activeId, scrollProgress, completedIds, totalHeadings } = useReadingProgress(blocks);
  const [isExpanded, setIsExpanded] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const toggleSection = (id: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      window.scrollTo({
        top: el.getBoundingClientRect().top + window.pageYOffset - 100,
        behavior: 'smooth'
      });
    }
  };

  if (tree.length === 0) return null;

  return (
    <>
      {/* Desktop Navigator */}
      <aside
        className={cn(
          "fixed left-8 top-1/2 -translate-y-1/2 z-[100] transition-all duration-500 hidden xl:block",
          isExpanded ? "w-80" : "w-12"
        )}
      >
        <div className="relative p-2 rounded-[2rem] bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
          {/* Progress Rail Background */}
          <div className="absolute left-6 top-12 bottom-12 w-[1px] bg-slate-200 dark:bg-slate-800" />

          {/* Animated Progress Fill */}
          <motion.div
            className="absolute left-6 top-12 w-[2px] bg-primary origin-top shadow-[0_0_15px_rgba(59,130,246,0.5)]"
            initial={{ height: 0 }}
            animate={{ height: `calc(${scrollProgress}% - 48px)` }}
            style={{ maxHeight: 'calc(100% - 96px)' }}
          />

          <div className="relative z-10 py-4 px-1">
            {/* Header / Mode Toggle */}
            <div className="flex items-center justify-between mb-8 px-2">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-primary transition-colors"
              >
                {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </button>
              {isExpanded && (
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Navigator</span>
              )}
            </div>

            {/* Nodes Tree */}
            <div className="space-y-6 max-h-[60vh] overflow-y-auto no-scrollbar py-2">
              {tree.map(node => (
                <div key={node.id} className="space-y-4">
                  <div className="flex items-center gap-3 group relative">
                    <NodeCircle
                      node={node}
                      activeId={activeId}
                      completedIds={completedIds}
                      onHover={setHoveredId}
                      onClick={() => scrollTo(node.id)}
                    />

                    {isExpanded && (
                      <button
                        onClick={() => scrollTo(node.id)}
                        className={cn(
                          "text-sm font-bold transition-all text-left truncate flex-1",
                          activeId === node.id ? "text-primary" : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                        )}
                      >
                        {node.text}
                      </button>
                    )}

                    {node.children.length > 0 && isExpanded && (
                      <button
                        onClick={() => toggleSection(node.id)}
                        className="p-1 text-slate-300 hover:text-primary transition-colors"
                      >
                        <ChevronRight
                          size={14}
                          className={cn("transition-transform", expandedSections.has(node.id) && "rotate-90")}
                        />
                      </button>
                    )}

                    {hoveredId === node.id && (
                      <ProgressTooltip
                        title={node.text}
                        sectionNumber={node.index + 1}
                        totalSections={totalHeadings}
                        progress={scrollProgress}
                        isCompleted={completedIds.has(node.id)}
                      />
                    )}
                  </div>

                  {/* Children (H3) */}
                  <AnimatePresence>
                    {(expandedSections.has(node.id) || !isExpanded) && node.children.length > 0 && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="pl-6 space-y-4 relative"
                      >
                        {/* Branch line */}
                        <div className="absolute left-[3px] top-0 bottom-4 w-[1px] bg-slate-100 dark:bg-slate-800" />

                        {node.children.map(child => (
                          <div key={child.id} className="flex items-center gap-3 group relative">
                            <NodeCircle
                              node={child}
                              activeId={activeId}
                              completedIds={completedIds}
                              onHover={setHoveredId}
                              onClick={() => scrollTo(child.id)}
                            />
                            {isExpanded && (
                              <button
                                onClick={() => scrollTo(child.id)}
                                className={cn(
                                  "text-xs font-semibold transition-all text-left truncate flex-1",
                                  activeId === child.id ? "text-primary" : "text-slate-400 hover:text-slate-900 dark:hover:text-white"
                                )}
                              >
                                {child.text}
                              </button>
                            )}

                            {hoveredId === child.id && (
                              <ProgressTooltip
                                title={child.text}
                                sectionNumber={child.index + 1}
                                totalSections={totalHeadings}
                                progress={scrollProgress}
                                isCompleted={completedIds.has(child.id)}
                              />
                            )}
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>

            {/* Footer / Scroll Top */}
            <div className="mt-8 px-2 flex justify-center">
               <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-primary transition-all hover:scale-110"
               >
                 <ArrowUp size={16} />
               </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Completion Celebration (Bottom Right) */}
      <AnimatePresence>
        {scrollProgress > 98 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-8 right-8 z-[110] p-6 glass rounded-[2.5rem] border border-emerald-500/30 shadow-[0_20px_50px_rgba(16,185,129,0.2)] flex flex-col items-center gap-4 text-center max-w-xs"
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
              <p className="text-xs text-slate-500 font-medium">You've successfully explored this library entry.</p>
            </div>
            <div className="flex gap-2 w-full">
               <button className="flex-1 py-2 rounded-xl bg-primary text-white text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-opacity">Share</button>
               <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="flex-1 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-colors"
               >
                 Top
               </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Floating Button */}
      <div className="fixed bottom-6 left-6 z-[100] xl:hidden">
         <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-12 h-12 rounded-full bg-primary text-white shadow-xl flex items-center justify-center relative overflow-hidden"
         >
            <div className="absolute inset-0 bg-white/20" style={{ transform: `translateY(${100 - scrollProgress}%)` }} />
            <span className="relative z-10 text-[10px] font-black">{Math.round(scrollProgress)}%</span>
         </button>
      </div>
    </>
  );
};

const NodeCircle: React.FC<{
  node: HeadingNode;
  activeId: string | null;
  completedIds: Set<string>;
  onHover: (id: string | null) => void;
  onClick: () => void;
}> = ({ node, activeId, completedIds, onHover, onClick }) => {
  const isActive = activeId === node.id;
  const isCompleted = completedIds.has(node.id);
  const size = node.level === 2 ? (isActive ? 16 : 10) : (isActive ? 12 : 6);

  return (
    <div
      className="relative flex items-center justify-center w-8 h-8 cursor-pointer"
      onMouseEnter={() => onHover(node.id)}
      onMouseLeave={() => onHover(null)}
      onClick={onClick}
    >
      <motion.div
        layout
        animate={{
          scale: isActive ? 1.2 : 1,
          backgroundColor: isActive ? '#3b82f6' : (isCompleted ? '#3b82f6' : 'transparent'),
          borderColor: isActive ? '#3b82f6' : (isCompleted ? '#3b82f6' : 'rgba(148, 163, 184, 0.5)')
        }}
        style={{
          width: size,
          height: size,
          borderWidth: isCompleted || isActive ? 0 : 2
        }}
        className={cn(
          "rounded-full transition-all duration-300",
          isActive && "shadow-[0_0_15px_rgba(59,130,246,0.8)]",
          isCompleted && !isActive && "opacity-60"
        )}
      />
      {isActive && node.level === 2 && (
        <motion.div
          animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute w-6 h-6 rounded-full border border-primary/30"
        />
      )}
      {isCompleted && !isActive && (
        <Check size={8} className="absolute text-white" />
      )}
    </div>
  );
};
