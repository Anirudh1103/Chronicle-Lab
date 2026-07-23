import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { List, BookOpen, ChevronRight, ChevronDown, X } from 'lucide-react';
import { PartNode, ChapterNode, HeadingNode, SubheadingNode } from '../../utils/hierarchy';

interface OutlineNavigationProps {
  postId: string;
  parts: PartNode[];
  activeBlockId: string | null;
  onNavigate: (blockId: string, slug: string) => void;
}

export const OutlineNavigation: React.FC<OutlineNavigationProps> = ({
  postId,
  parts,
  activeBlockId,
  onNavigate
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedParts, setExpandedParts] = useState<Record<string, boolean>>({});
  const [expandedChapters, setExpandedChapters] = useState<Record<string, boolean>>({});
  const [readingProgress, setReadingProgress] = useState(0);
  const navContainerRef = useRef<HTMLDivElement>(null);

  // Track active path
  const [activePath, setActivePath] = useState<{
    partId: string | null;
    chapterId: string | null;
    headingId: string | null;
    subheadingId: string | null;
  }>({ partId: null, chapterId: null, headingId: null, subheadingId: null });

  // 1. Calculate reading progress
  useEffect(() => {
    const handleScroll = () => {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) {
        setReadingProgress(0);
        return;
      }
      const scrollPos = window.scrollY;
      const pct = Math.min(Math.max(Math.round((scrollPos / docHeight) * 100), 0), 100);
      setReadingProgress(pct);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 2. Resolve active path from activeBlockId
  useEffect(() => {
    if (!activeBlockId) return;

    let resolved = { partId: null, chapterId: null, headingId: null, subheadingId: null } as any;

    for (const part of parts) {
      for (const chapter of part.chapters) {
        for (const heading of chapter.headings) {
          for (const subheading of heading.subheadings) {
            if (subheading.id === activeBlockId || subheading.contentBlocks.some(b => b.id === activeBlockId)) {
              resolved = {
                partId: part.id,
                chapterId: chapter.id,
                headingId: heading.id,
                subheadingId: subheading.id
              };
              break;
            }
          }
          if (resolved.partId) break;
          if (heading.id === activeBlockId) {
            resolved = { partId: part.id, chapterId: chapter.id, headingId: heading.id, subheadingId: null };
            break;
          }
        }
        if (resolved.partId) break;
        if (chapter.id === activeBlockId) {
          resolved = { partId: part.id, chapterId: chapter.id, headingId: null, subheadingId: null };
          break;
        }
      }
      if (resolved.partId) break;
      if (part.id === activeBlockId) {
        resolved = { partId: part.id, chapterId: null, headingId: null, subheadingId: null };
        break;
      }
    }

    if (resolved.partId) {
      setActivePath(resolved);

      // Auto-expand parents of active items if not explicitly set
      setExpandedParts(prev => ({
        ...prev,
        [resolved.partId]: prev[resolved.partId] !== false
      }));
      if (resolved.chapterId) {
        setExpandedChapters(prev => ({
          ...prev,
          [resolved.chapterId]: prev[resolved.chapterId] !== false
        }));
      }
    }
  }, [activeBlockId, parts]);

  // Load persistent collapse/expand state
  useEffect(() => {
    try {
      const stored = localStorage.getItem(`outline-nav-expanded-${postId}`);
      if (stored) {
        const { parts: savedParts, chapters: savedChapters } = JSON.parse(stored);
        if (savedParts) setExpandedParts(savedParts);
        if (savedChapters) setExpandedChapters(savedChapters);
      } else {
        // Default: Expand first part
        if (parts.length > 0) {
          setExpandedParts({ [parts[0].id]: true });
          if (parts[0].chapters.length > 0) {
            setExpandedChapters({ [parts[0].chapters[0].id]: true });
          }
        }
      }
    } catch (e) {
      console.error('Error loading navigation state', e);
    }
  }, [postId, parts]);

  // Persist collapse/expand state
  const saveState = (updatedParts: any, updatedChapters: any) => {
    try {
      localStorage.setItem(
        `outline-nav-expanded-${postId}`,
        JSON.stringify({ parts: updatedParts, chapters: updatedChapters })
      );
    } catch (e) {
      console.error('Error saving navigation state', e);
    }
  };

  const togglePart = (partId: string) => {
    const updated = { ...expandedParts, [partId]: !expandedParts[partId] };
    setExpandedParts(updated);
    saveState(updated, expandedChapters);
  };

  const toggleChapter = (chapterId: string) => {
    const updated = { ...expandedChapters, [chapterId]: !expandedChapters[chapterId] };
    setExpandedChapters(updated);
    saveState(expandedParts, updated);
  };

  // Keyboard accessibility helper
  const handleKeyDown = (e: React.KeyboardEvent, blockId: string, slug: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onNavigate(blockId, slug);
      if (window.innerWidth < 1024) setIsExpanded(false);
    }
  };

  // Build chapter list for dots in collapsed state
  const allChapters = parts.flatMap(p => p.chapters);

  return (
    <>
      {/* 1. COLLAPSED floating vertical rail */}
      <motion.div
        className="fixed left-6 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col items-center bg-[#070b19]/80 border border-slate-800/80 backdrop-blur-xl rounded-full py-6 px-3 shadow-2xl w-14"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: isExpanded ? 0 : 1, x: isExpanded ? -20 : 0 }}
        transition={{ duration: 0.3 }}
        style={{ pointerEvents: isExpanded ? 'none' : 'auto' }}
      >
        <button
          onClick={() => setIsExpanded(true)}
          className="w-10 h-10 rounded-full bg-[#f97316] hover:bg-[#ea580c] flex items-center justify-center text-white shadow-lg transition-colors cursor-pointer"
          title="Open Outline"
          aria-label="Open Outline"
        >
          <List className="w-5 h-5" />
        </button>

        {/* Dynamic Dot Rail */}
        <div className="flex flex-col gap-3 my-8 max-h-[40vh] overflow-y-auto scrollbar-none py-1">
          {allChapters.map(chap => {
            const isActive = activePath.chapterId === chap.id;
            return (
              <button
                key={chap.id}
                onClick={() => onNavigate(chap.id, chap.slug)}
                className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center transition-all ${
                  isActive
                    ? 'border-[#f97316] bg-[#f97316]/20 scale-125'
                    : 'border-slate-600 bg-slate-800/50 hover:border-slate-400'
                }`}
                title={`Chapter ${chap.chapterNumber}: ${chap.title}`}
                aria-label={`Go to Chapter ${chap.chapterNumber}: ${chap.title}`}
              >
                <div
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${
                    isActive ? 'bg-[#f97316]' : 'bg-transparent'
                  }`}
                />
              </button>
            );
          })}
        </div>

        {/* Progress Display */}
        <div className="flex flex-col items-center">
          <div className="w-px h-6 bg-slate-800" />
          <span className="text-[11px] font-bold text-[#f97316] mt-3 tracking-wide">{readingProgress}%</span>
        </div>
      </motion.div>

      {/* Trigger for small screens (floating outline button bottom-left) */}
      <button
        onClick={() => setIsExpanded(true)}
        className="fixed bottom-6 left-6 z-40 md:hidden w-12 h-12 rounded-full bg-[#f97316] hover:bg-[#ea580c] flex items-center justify-center text-white shadow-xl transition-colors cursor-pointer"
        aria-label="Open Outline"
      >
        <List className="w-6 h-6" />
      </button>

      {/* 2. EXPANDED Side overlay panel */}
      <AnimatePresence>
        {isExpanded && (
          <>
            {/* Backdrop cover for mobile/tablet */}
            <motion.div
              className="fixed inset-0 bg-black/60 z-45 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsExpanded(false)}
            />

            <motion.div
              ref={navContainerRef}
              className="fixed left-0 md:left-6 top-0 md:top-1/2 -translate-y-0 md:-translate-y-1/2 z-50 w-full md:w-[380px] h-full md:h-[85vh] bg-[#050814]/95 border border-slate-900 md:border-slate-800/80 backdrop-blur-2xl md:rounded-3xl shadow-2xl flex flex-col text-slate-100 overflow-hidden"
              initial={{ opacity: 0, x: -100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800/60">
                <div className="flex items-center gap-3">
                  <List className="w-5 h-5 text-[#f97316]" />
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">Outline</h2>
                </div>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="p-1.5 rounded-lg border border-slate-800/80 hover:bg-slate-800/50 hover:text-white transition-colors"
                  aria-label="Close outline"
                >
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>

              {/* Scrollable Tree Menu */}
              <div className="flex-1 overflow-y-auto px-6 py-5 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
                <div className="space-y-4">
                  {parts.map((part) => {
                    const isPartExpanded = !!expandedParts[part.id];
                    const isPartActive = activePath.partId === part.id;

                    return (
                      <div key={part.id} className="border-b border-slate-900/40 pb-2">
                        {/* Part Header */}
                        <button
                          onClick={() => togglePart(part.id)}
                          className="w-full flex items-center justify-between text-left py-2 hover:text-[#f97316] transition-colors focus:outline-none cursor-pointer group"
                        >
                          <div className="flex items-center gap-3">
                            <BookOpen
                              className={`w-4 h-4 transition-colors ${
                                isPartActive ? 'text-[#f97316]' : 'text-slate-400 group-hover:text-[#f97316]'
                              }`}
                            />
                            <span
                              className={`text-xs font-bold tracking-wider uppercase ${
                                isPartActive ? 'text-[#f97316]' : 'text-slate-400 group-hover:text-slate-200'
                              }`}
                            >
                              {part.title}
                            </span>
                          </div>
                          {isPartExpanded ? (
                            <ChevronDown className="w-4 h-4 text-slate-500" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-slate-500" />
                          )}
                        </button>

                        {/* Part Chapters container */}
                        {isPartExpanded && (
                          <div className="mt-2 pl-4 border-l border-slate-800/50 space-y-1.5 ml-2">
                            {part.chapters.map((chapter) => {
                              const isChapExpanded = !!expandedChapters[chapter.id];
                              const isChapActive = activePath.chapterId === chapter.id;

                              return (
                                <div key={chapter.id} className="space-y-1">
                                  {/* Chapter Header */}
                                  <div
                                    onClick={() => {
                                      onNavigate(chapter.id, chapter.slug);
                                      if (window.innerWidth < 1024) setIsExpanded(false);
                                    }}
                                    onKeyDown={(e) => handleKeyDown(e, chapter.id, chapter.slug)}
                                    tabIndex={0}
                                    className={`w-full flex items-center justify-between text-left py-1.5 px-3 rounded-lg cursor-pointer transition-all focus:outline-none ${
                                      isChapActive
                                        ? 'bg-[#0f172a]/80 text-[#f97316] font-medium border-l-2 border-[#f97316] pl-2.5 shadow-inner shadow-[#f97316]/5'
                                        : 'text-slate-300 hover:text-white hover:bg-slate-900/40'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2 overflow-hidden">
                                      <span className="text-[10px] font-mono opacity-60">
                                        {chapter.chapterNumber.toString().padStart(2, '0')}
                                      </span>
                                      <span className="text-[13px] truncate">
                                        {chapter.title}
                                      </span>
                                    </div>
                                    {chapter.headings.length > 0 && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          toggleChapter(chapter.id);
                                        }}
                                        className="p-1 hover:bg-slate-800/50 rounded"
                                        aria-label="Toggle Sub-elements"
                                      >
                                        {isChapExpanded ? (
                                          <ChevronDown className="w-3.5 h-3.5 text-slate-500 hover:text-slate-300" />
                                        ) : (
                                          <ChevronRight className="w-3.5 h-3.5 text-slate-500 hover:text-slate-300" />
                                        )}
                                      </button>
                                    )}
                                  </div>

                                  {/* Headings List */}
                                  {isChapExpanded && chapter.headings.length > 0 && (
                                    <div className="pl-4 border-l border-slate-900/60 ml-3.5 space-y-1.5 py-1">
                                      {chapter.headings.map((heading) => {
                                        const isHeadActive = activePath.headingId === heading.id;

                                        return (
                                          <div key={heading.id} className="space-y-1">
                                            <div
                                              onClick={() => {
                                                onNavigate(heading.id, heading.slug);
                                                if (window.innerWidth < 1024) setIsExpanded(false);
                                              }}
                                              onKeyDown={(e) => handleKeyDown(e, heading.id, heading.slug)}
                                              tabIndex={0}
                                              className={`flex items-center gap-2 py-1 px-2 rounded cursor-pointer transition-colors focus:outline-none text-[12px] ${
                                                isHeadActive
                                                  ? 'text-[#f97316] font-medium'
                                                  : 'text-slate-400 hover:text-slate-200'
                                              }`}
                                            >
                                              <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                                              <span className="truncate">{heading.title}</span>
                                            </div>

                                            {/* Subheadings List */}
                                            {isHeadActive && heading.subheadings.length > 0 && (
                                              <div className="pl-3 border-l border-[#f97316]/20 ml-2.5 space-y-1 py-0.5">
                                                {heading.subheadings.map((subheading) => {
                                                  const isSubActive = activePath.subheadingId === subheading.id;

                                                  return (
                                                    <div
                                                      key={subheading.id}
                                                      onClick={() => {
                                                        onNavigate(subheading.id, subheading.slug);
                                                        if (window.innerWidth < 1024) setIsExpanded(false);
                                                      }}
                                                      onKeyDown={(e) =>
                                                        handleKeyDown(e, subheading.id, subheading.slug)
                                                      }
                                                      tabIndex={0}
                                                      className={`py-0.5 px-2 rounded cursor-pointer text-[11px] transition-colors focus:outline-none ${
                                                        isSubActive
                                                          ? 'text-[#38bdf8] font-medium border-l border-[#38bdf8] pl-1.5'
                                                          : 'text-slate-500 hover:text-slate-300'
                                                      }`}
                                                    >
                                                      {subheading.title}
                                                    </div>
                                                  );
                                                })}
                                              </div>
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Progress Summary Footer */}
              <div className="px-6 py-5 border-t border-slate-800/60 bg-slate-950/20">
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  <span>Overall Progress</span>
                  <span className="text-[#f97316]">{readingProgress}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-[#f97316] to-[#ea580c]"
                    style={{ width: `${readingProgress}%` }}
                    transition={{ ease: 'easeOut', duration: 0.2 }}
                  />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
