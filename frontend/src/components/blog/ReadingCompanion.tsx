import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, BookOpen, Layers, Compass, ArrowRight } from 'lucide-react';
import { EditorBlock } from '../../types/editor';
import { stripHtml } from '../../utils/stripHtml';
import { cn } from '../../utils/cn';

interface ReadingCompanionProps {
  blocks: EditorBlock[];
  activeId: string | null;
  percent: number;
}

export const ReadingCompanion: React.FC<ReadingCompanionProps> = ({
  blocks,
  activeId,
  percent
}) => {
  // Find all H2 chapters
  const chapters = useMemo(() =>
    blocks.filter(b => b.type === 'heading' && b.content.level === 2),
    [blocks]
  );

  // Find all headings (H2, H3, H4)
  const allHeadings = useMemo(() =>
    blocks.filter(b => (b.type === 'heading' || b.type === 'subheading') && b.content.level > 1 && stripHtml(b.content.text) !== ''),
    [blocks]
  );

  // Determine active heading block
  const activeHeadingBlock = useMemo(() => {
    if (!activeId) return allHeadings[0] || null;
    return allHeadings.find(h => h.id === activeId) || allHeadings[0] || null;
  }, [activeId, allHeadings]);

  // Determine active chapter (the active H2 or the parent H2 preceding the active H3/H4)
  const activeChapterInfo = useMemo(() => {
    if (!activeHeadingBlock || chapters.length === 0) return { number: 1, total: chapters.length || 1 };

    let lastH2Index = 0;
    for (let i = 0; i < blocks.length; i++) {
      const block = blocks[i];
      if (block.type === 'heading' && block.content.level === 2) {
        lastH2Index = chapters.indexOf(block);
      }
      if (block.id === activeHeadingBlock.id) {
        break;
      }
    }
    return {
      number: lastH2Index + 1,
      total: chapters.length
    };
  }, [activeHeadingBlock, chapters, blocks]);

  // Determine next heading block
  const nextHeadingBlock = useMemo(() => {
    if (!activeHeadingBlock) return null;
    const index = allHeadings.findIndex(h => h.id === activeHeadingBlock.id);
    if (index === -1 || index === allHeadings.length - 1) return null;
    return allHeadings[index + 1];
  }, [activeHeadingBlock, allHeadings]);

  // Dynamic remaining reading time calculation based on remaining words
  const remainingTimeMinutes = useMemo(() => {
    if (blocks.length === 0) return 0;

    let activeBlockIndex = 0;
    if (activeId) {
      activeBlockIndex = blocks.findIndex(b => b.id === activeId);
      if (activeBlockIndex === -1) activeBlockIndex = 0;
    }

    let totalWords = 0;
    for (let i = activeBlockIndex; i < blocks.length; i++) {
      const block = blocks[i];
      if (block.content && typeof block.content.text === 'string') {
        const cleanText = stripHtml(block.content.text);
        const words = cleanText.split(/\s+/).filter(Boolean).length;
        totalWords += words;
      }
    }

    // Standard reading WPM speed: 200
    return Math.max(1, Math.ceil(totalWords / 200));
  }, [blocks, activeId]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="p-8 rounded-[2.5rem] bg-slate-50 dark:bg-slate-900/30 border border-slate-150 dark:border-white/5 space-y-6 shadow-sm relative overflow-hidden text-left"
    >
      {/* Current Chapter Section */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500">
          <BookOpen size={14} className="text-primary" />
          <span className="text-[10px] font-black uppercase tracking-[0.25em]">Current Chapter</span>
        </div>
        <p className="text-[10px] font-mono font-black text-amber-500 uppercase tracking-widest">
          Chapter {activeChapterInfo.number} of {activeChapterInfo.total}
        </p>
        <h4 className="text-base font-editorial italic font-black text-slate-800 dark:text-white leading-snug">
          {activeHeadingBlock ? stripHtml(activeHeadingBlock.content.text) : 'Introduction'}
        </h4>
      </div>

      {/* Reading Progress Track */}
      <div className="space-y-2 pt-4 border-t border-slate-150 dark:border-white/5">
        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 dark:text-slate-500">
          <div className="flex items-center gap-2">
            <Compass size={14} className="text-primary" />
            <span>Progress</span>
          </div>
          <span className="font-mono text-amber-500">{percent}%</span>
        </div>
        <div className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full"
            style={{ width: `${percent}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>
      </div>

      {/* Time Remaining */}
      <div className="space-y-1.5 pt-4 border-t border-slate-150 dark:border-white/5">
        <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500">
          <Clock size={14} className="text-primary" />
          <span className="text-[10px] font-black uppercase tracking-[0.25em]">Time Remaining</span>
        </div>
        <p className="text-sm font-bold text-slate-700 dark:text-slate-350">
          Approximately <span className="font-black text-slate-900 dark:text-white">{remainingTimeMinutes} min left</span>
        </p>
      </div>

      {/* Next Section Heading */}
      <div className="space-y-2 pt-4 border-t border-slate-150 dark:border-white/5">
        <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500">
          <Layers size={14} className="text-primary" />
          <span className="text-[10px] font-black uppercase tracking-[0.25em]">Up Next</span>
        </div>
        {nextHeadingBlock ? (
          <div className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
            <p className="text-xs font-bold leading-relaxed line-clamp-2">
              "{stripHtml(nextHeadingBlock.content.text)}"
            </p>
          </div>
        ) : (
          <span className="text-xs font-black uppercase tracking-[0.15em] text-slate-400 dark:text-slate-600 block">
            Final Section
          </span>
        )}
      </div>
    </motion.div>
  );
};
