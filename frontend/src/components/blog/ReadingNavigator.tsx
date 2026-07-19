import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, useScroll, useSpring, useTransform, useMotionValueEvent } from 'framer-motion';
import {
  Check,
  ArrowUp,
  X,
  Navigation,
  List,
  ChevronDown,
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import { useReadingProgress } from '../../hooks/useReadingProgress';
import { EditorBlock } from '../../types/editor';
import { cn } from '../../utils/cn';

interface ReadingNavigatorProps {
  blocks: EditorBlock[];
}

interface HierarchicalNode {
  id: string;
  text: string;
  level: number;
  index: number;
  subsections: { id: string; text: string; level: number }[];
}

export const ReadingNavigator: React.FC<ReadingNavigatorProps> = ({ blocks }) => {
  const { tree, activeId, completedIds } = useReadingProgress(blocks);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [percent, setPercent] = useState(0);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Group flat headings into Hierarchical structure (H2 as Chapters, H3/H4 as Subsections)
  const hierarchicalTree = useMemo(() => {
    const result: HierarchicalNode[] = [];
    let currentChapter: HierarchicalNode | null = null;

    tree.forEach((h) => {
      if (h.level === 2 || (result.length === 0 && !currentChapter)) {
        currentChapter = {
          id: h.id,
          text: h.text,
          level: h.level,
          index: result.length + 1,
          subsections: []
        };
        result.push(currentChapter);
      } else {
        if (currentChapter) {
          currentChapter.subsections.push({
            id: h.id,
            text: h.text,
            level: h.level
          });
        }
      }
    });

    return result;
  }, [tree]);

  // Keep track of manually expanded chapters
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());

  // Automatically expand active chapter's subsections
  useEffect(() => {
    if (activeId) {
      const parentChapter = hierarchicalTree.find(ch => 
        ch.id === activeId || ch.subsections.some(sub => sub.id === activeId)
      );
      if (parentChapter) {
        setExpandedChapters(prev => {
          if (prev.has(parentChapter.id)) return prev;
          const next = new Set(prev);
          next.add(parentChapter.id);
          return next;
        });
      }
    }
  }, [activeId, hierarchicalTree]);

  // Scroll centering for active nodes
  useEffect(() => {
    if (activeId && scrollContainerRef.current) {
      const activeEl = scrollContainerRef.current.querySelector(`[data-node-id="${activeId}"]`);
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [activeId]);

  const { scrollYProgress } = useScroll();

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    setPercent(Math.round(latest * 100));
  });

  const scrollProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const scrollTo = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const el = document.getElementById(id);
    if (el) {
      const rect = el.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const targetTop = rect.top + scrollTop - 120;
      window.scrollTo({
        top: targetTop,
        behavior: 'smooth'
      });
    }
  };

  const toggleChapterExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedChapters(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(true);
  };

  const handleCollapse = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(false);
  };

  if (hierarchicalTree.length === 0) return null;
  if (typeof document === 'undefined') return null;

  const isScrollable = hierarchicalTree.length > 5;
  const showBackToTop = percent > 5;
  const currentWidth = isExpanded ? 320 : isHovered ? 260 : 70;

  const renderNode = (node: HierarchicalNode) => {
    const isActive = activeId === node.id || node.subsections.some(sub => activeId === sub.id);
    const isRead = completedIds.has(node.id) && !isActive;

    return (
      <div 
        key={node.id} 
        data-node-id={node.id}
        className="relative flex items-center w-full h-12 select-none cursor-pointer group"
        onClick={(e) => scrollTo(node.id, e)}
      >
        {/* Node Dot - Centered exactly on the rail line */}
        <div className="absolute left-[-1px] flex items-center justify-center w-10 h-10">
            {isActive && (
                <>
                  {/* Outer breathing pulse ring */}
                  <motion.div
                    layoutId="scanner-ring"
                    className="absolute w-8 h-8 rounded-full border border-amber-500/30 bg-amber-500/5 dark:bg-amber-500/10"
                    animate={{ scale: [1, 1.35, 1], opacity: [0.8, 0.2, 0.8] }}
                    transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                  />
                  {/* Rotating dashed accent ring */}
                  <motion.div
                    className="absolute w-6 h-6 rounded-full border border-dashed border-amber-500/40"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                  />
                </>
            )}

            <button
                onClick={(e) => scrollTo(node.id, e)}
                className={cn(
                    "w-3 h-3 rounded-full border-2 transition-all duration-500 flex items-center justify-center bg-white dark:bg-slate-900 z-30 outline-none focus:outline-none focus:ring-0 focus-visible:outline-none",
                    isActive
                    ? "bg-amber-500 border-amber-500 scale-125 shadow-[0_0_15px_rgba(245,158,11,0.6)]"
                    : isRead
                        ? "bg-amber-500 border-amber-500"
                        : "border-slate-300 dark:border-white/20 group-hover:border-amber-500 group-hover:scale-125"
                )}
                aria-label={`Go to chapter ${node.index}: ${node.text}`}
            >
                {isRead && (
                  <motion.div
                    initial={{ scale: 0.6, rotate: -30 }}
                    animate={{ scale: 1, rotate: 0 }}
                    className="text-white"
                  >
                    <Check size={8} className="stroke-[4]" />
                  </motion.div>
                )}
            </button>
        </div>

        {/* Text Label - Revealed dynamically when the scroll bar is hovered */}
        {!isExpanded && (
          <div 
            className={cn(
              "absolute left-[64px] flex items-center gap-3 transition-all duration-300 pointer-events-none select-none z-50",
              isHovered ? "opacity-100 translate-x-0" : "opacity-0 translate-x-2"
            )}
          >
            <span className="font-mono text-[9px] font-black text-amber-500 uppercase tracking-widest">
              {node.index.toString().padStart(2, '0')}
            </span>
            <span className={cn(
              "text-[10px] font-black uppercase tracking-wider truncate max-w-[160px]",
              isActive
                ? "text-amber-500 font-black"
                : "text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-white"
            )}>
              {node.text}
            </span>
            <ArrowRight size={10} className="text-amber-500 shrink-0 opacity-60" />
          </div>
        )}
      </div>
    );
  };

  return createPortal(
    <>
      {/* Premium Viewport-Anchored Navigator */}
      <aside
        className="fixed left-8 top-1/2 -translate-y-1/2 z-[10000] hidden xl:flex flex-col select-none"
      >
        <motion.div
          initial={{ width: 70 }}
          animate={{ width: currentWidth }}
          transition={{ type: 'spring', stiffness: 220, damping: 26 }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="relative flex flex-col items-center bg-white/80 dark:bg-slate-950/55 backdrop-blur-3xl border border-slate-200 dark:border-white/10 rounded-[3rem] p-4 py-8 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] dark:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] group overflow-hidden pointer-events-auto"
          style={{ height: '70vh' }}
        >
          {/* Header Controls */}
          <div className="w-full flex items-center justify-between mb-8 shrink-0 px-2 min-h-[36px] relative">
             {isExpanded ? (
               <>
                 <div className="flex items-center gap-2">
                   <button
                    onClick={handleCollapse}
                    className="w-7 h-7 rounded-xl bg-primary/10 hover:bg-primary/20 flex items-center justify-center text-primary shadow-inner transition-colors duration-200 outline-none focus:outline-none cursor-pointer"
                    title="Collapse outline"
                    aria-label="Collapse Table of Contents"
                   >
                      <List size={14} />
                   </button>
                   <span className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-900 dark:text-white">Outline</span>
                 </div>
                 <button 
                  onClick={handleCollapse}
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-all text-slate-400 hover:text-slate-800 dark:hover:text-white outline-none focus:outline-none focus-visible:outline-none pointer-events-auto relative z-50 cursor-pointer"
                  aria-label="Collapse Table of Contents"
                 >
                   <X size={15} />
                 </button>
               </>
             ) : (
               <div className="absolute left-[1px] top-1/2 -translate-y-1/2">
                 <button
                  onClick={handleExpand}
                  className="w-9 h-9 rounded-2xl bg-amber-500/10 hover:bg-amber-500 text-amber-500 hover:text-white flex items-center justify-center transition-all shadow-inner outline-none focus:outline-none focus-visible:outline-none active:scale-95 pointer-events-auto relative z-50 cursor-pointer"
                  title="Expand outline"
                  aria-label="Expand Table of Contents"
                 >
                   <List size={18} />
                 </button>
               </div>
             )}
          </div>

          {/* Central Progress Timeline */}
          <div 
            ref={scrollContainerRef}
            className={cn(
              "relative flex-1 w-full",
              isExpanded ? "overflow-y-auto no-scrollbar scroll-smooth px-2" : isScrollable ? "overflow-y-auto no-scrollbar scroll-smooth" : "overflow-hidden"
            )}
          >
            {isExpanded ? (
              // EXPANDED TOC MODE
              <div className="space-y-4 py-2 pr-1">
                {hierarchicalTree.map((chapter) => {
                  const isChapterActive = activeId === chapter.id;
                  const isAnySubActive = chapter.subsections.some(sub => activeId === sub.id);
                  const isChapterCompleted = completedIds.has(chapter.id) && !isChapterActive && !isAnySubActive;
                  const isOpen = expandedChapters.has(chapter.id);

                  return (
                    <div key={chapter.id} className="space-y-1.5">
                      {/* Main Chapter Row */}
                      <div 
                        onClick={(e) => scrollTo(chapter.id, e)}
                        className={cn(
                          "relative group/row flex items-center justify-between p-2.5 rounded-2xl cursor-pointer transition-all border select-none",
                          isChapterActive || isAnySubActive
                            ? "bg-amber-500/5 dark:bg-amber-500/10 border-amber-500/15"
                            : "bg-transparent border-transparent hover:bg-slate-100/50 dark:hover:bg-white/5"
                        )}
                      >
                        {/* Active indicator line */}
                        {(isChapterActive || isAnySubActive) && (
                          <div className="absolute left-0 top-2 bottom-2 w-[3px] bg-amber-500 rounded-r" />
                        )}

                        <div className="flex items-center gap-2.5 min-w-0 pl-1.5">
                          <span className={cn(
                            "font-mono text-[9px] font-black tracking-widest",
                            isChapterActive || isAnySubActive ? "text-amber-500" : "text-slate-400 dark:text-slate-500"
                          )}>
                            {chapter.index.toString().padStart(2, '0')}
                          </span>
                          <span className={cn(
                            "text-[10px] font-black uppercase tracking-wider truncate",
                            isChapterActive || isAnySubActive
                              ? "text-slate-900 dark:text-white font-black"
                              : "text-slate-500 dark:text-slate-400 group-hover/row:text-slate-800 dark:group-hover/row:text-white"
                          )}>
                            {chapter.text}
                          </span>
                          {isChapterCompleted && (
                            <Check size={10} className="text-emerald-500 shrink-0 stroke-[3]" />
                          )}
                        </div>

                        {chapter.subsections.length > 0 && (
                          <button
                            onClick={(e) => toggleChapterExpand(chapter.id, e)}
                            className="p-1 hover:bg-slate-200 dark:hover:bg-white/10 rounded-lg text-slate-400 transition-all outline-none focus:outline-none"
                          >
                            {isOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                          </button>
                        )}
                      </div>

                      {/* Subsections List */}
                      {chapter.subsections.length > 0 && isOpen && (
                        <div className="pl-6 border-l border-slate-100 dark:border-white/5 space-y-1.5 ml-3.5">
                          {chapter.subsections.map((sub) => {
                            const isSubActive = activeId === sub.id;
                            return (
                              <div
                                key={sub.id}
                                onClick={(e) => scrollTo(sub.id, e)}
                                className={cn(
                                  "relative flex items-center gap-2 py-1.5 px-3 rounded-xl cursor-pointer text-[9.5px] font-bold tracking-wider uppercase transition-all select-none",
                                  isSubActive
                                    ? "text-amber-500 font-black bg-amber-500/5"
                                    : "text-slate-400 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
                                )}
                              >
                                {isSubActive && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse shrink-0" />
                                )}
                                <span className="truncate">{sub.text}</span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              // COLLAPSED RAIL MODE
              <div className={cn("relative pr-1 py-4", isScrollable ? "min-h-full" : "h-full")}>
                {/* Progress Track Container - Perfectly bounds lines between first and last dot centers */}
                <div className="absolute left-[18px] top-[36px] bottom-[36px] w-[2px] z-0 pointer-events-none">
                  {/* Background Track Line */}
                  <div className="absolute inset-0 bg-slate-100 dark:bg-white/5 rounded-full" />

                  {/* Progress Stream Line */}
                  <motion.div
                    className="absolute top-0 left-0 right-0 bg-gradient-to-b from-amber-500 via-yellow-400 to-amber-600 shadow-[0_0_12px_rgba(245,158,11,0.5)] origin-top rounded-full"
                    style={{ height: useTransform(scrollProgress, [0, 1], ["0%", "100%"]) }}
                  />
                </div>

                {/* Nodes List */}
                <div 
                  className={cn(
                    "relative w-full z-20",
                    isScrollable ? "flex flex-col gap-8" : "flex flex-col justify-between h-full"
                  )}
                >
                  {hierarchicalTree.map(renderNode)}
                </div>
              </div>
            )}
          </div>

          {/* Dock Footer / Back To Top */}
          <div className="w-full flex flex-col items-center gap-4 mt-8 border-t border-slate-100 dark:border-white/5 pt-6 shrink-0 px-2 select-none relative min-h-[48px]">
             {(isExpanded || isHovered) && (
               <div className="flex items-center justify-between w-full text-[9px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 px-2">
                 <span>Progress</span>
                 <span className="font-mono text-amber-500">{percent}%</span>
               </div>
             )}

             <AnimatePresence>
               {showBackToTop && (
                 <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={(e) => { e.stopPropagation(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className={cn(
                    "p-3 rounded-[1.25rem] bg-slate-50 dark:bg-white/5 text-slate-400 dark:text-slate-500 hover:text-amber-500 hover:bg-amber-500/10 transition-all active:scale-90 shadow-xl border border-transparent hover:border-amber-500/10 outline-none focus:outline-none focus:ring-0 focus-visible:outline-none shrink-0 cursor-pointer pointer-events-auto z-50",
                    !isExpanded && "absolute left-[-1px] bottom-2"
                  )}
                  title="Return to top of document"
                  aria-label="Scroll back to top"
                 >
                   <ArrowUp size={16} />
                 </motion.button>
               )}
             </AnimatePresence>
          </div>
        </motion.div>
      </aside>

      {/* Mobile Menu & Floating FAB */}
      <div className="fixed bottom-6 left-6 z-[10000] xl:hidden select-none">
         <AnimatePresence>
           {isMobileMenuOpen && (
             <motion.div
               initial={{ opacity: 0, scale: 0.9, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.9, y: 20 }}
               className="w-80 max-h-[60vh] bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl rounded-[2.5rem] p-6 overflow-y-auto no-scrollbar shadow-[0_40px_80px_-20px_rgba(0,0,0,0.2)] dark:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)] border border-slate-200 dark:border-white/20 mb-4"
             >
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-xl text-primary"><List size={16} /></div>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-900 dark:text-white">Outline</span>
                  </div>
                  <button onClick={() => setIsMobileMenuOpen(false)} className="text-slate-400 p-2 outline-none focus:outline-none focus-visible:outline-none"><X size={18} /></button>
                </div>
                <div className="space-y-4">
                  {hierarchicalTree.map((chapter) => {
                    const isChapterActive = activeId === chapter.id || chapter.subsections.some(sub => activeId === sub.id);
                    return (
                      <div key={chapter.id} className="space-y-1.5">
                        <button
                          onClick={() => { scrollTo(chapter.id); setIsMobileMenuOpen(false); }}
                          className={cn(
                            "text-[10px] font-black uppercase tracking-widest text-left flex items-center gap-4 w-full transition-all outline-none focus:outline-none focus-visible:outline-none",
                            isChapterActive ? "text-amber-500 translate-x-2" : "text-slate-400 dark:text-slate-500"
                          )}
                        >
                          <div className={cn("w-1.5 h-1.5 rounded-full", isChapterActive ? "bg-amber-500" : "bg-current")} />
                          <span className="flex-1 truncate">{chapter.text}</span>
                        </button>

                        {chapter.subsections.length > 0 && isChapterActive && (
                          <div className="pl-6 border-l border-slate-200 dark:border-white/5 space-y-2 ml-1">
                            {chapter.subsections.map(sub => (
                              <button
                                key={sub.id}
                                onClick={() => { scrollTo(sub.id); setIsMobileMenuOpen(false); }}
                                className={cn(
                                  "text-[9px] font-bold uppercase tracking-widest text-left flex items-center gap-2 w-full transition-all outline-none focus:outline-none focus-visible:outline-none",
                                  activeId === sub.id ? "text-amber-500" : "text-slate-400 dark:text-slate-500"
                                )}
                              >
                                <span>•</span>
                                <span className="truncate">{sub.text}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
             </motion.div>
           )}
         </AnimatePresence>

         <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="w-16 h-16 rounded-[2rem] bg-white dark:bg-slate-950/90 backdrop-blur-xl text-slate-900 dark:text-white shadow-2xl flex items-center justify-center relative overflow-hidden border border-slate-200 dark:border-white/10 group active:scale-90 transition-transform outline-none focus:outline-none focus:ring-0 focus-visible:outline-none"
         >
            <motion.div
              className="absolute bottom-0 left-0 right-0 bg-amber-500/20"
              style={{ height: useTransform(scrollYProgress, [0, 1], ["0%", "100%"]) }}
            />
            <div className="relative z-10 flex flex-col items-center gap-0.5">
               <span className="text-[9px] font-black">{percent}%</span>
               <Navigation size={22} className={cn("transition-transform duration-500", isMobileMenuOpen && "rotate-45")} />
            </div>
         </button>
      </div>
    </>,
    document.body
  );
};
