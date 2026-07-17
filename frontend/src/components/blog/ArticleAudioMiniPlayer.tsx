import React from 'react';
import { Play, Pause, Square, SkipForward, SkipBack, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { TTSStatus } from '../../hooks/useArticleTTS';
import { NarrationChunk } from '../../services/narrationParser';

interface ArticleAudioMiniPlayerProps {
  status: TTSStatus;
  currentChunkIndex: number;
  chunks: NarrationChunk[];
  play: () => void;
  pause: () => void;
  stop: () => void;
  skipForward: () => void;
  skipBackward: () => void;
  visible: boolean;
  scrollToPlayer: () => void;
}

export function ArticleAudioMiniPlayer({
  status,
  currentChunkIndex,
  chunks,
  play,
  pause,
  stop,
  skipForward,
  skipBackward,
  visible,
  scrollToPlayer
}: ArticleAudioMiniPlayerProps) {
  
  if (chunks.length === 0 || status === 'idle' || status === 'completed') return null;

  const currentChunk = chunks[currentChunkIndex];
  const progressPercent = chunks.length > 0
    ? Math.round(((currentChunkIndex >= 0 ? currentChunkIndex : 0) / chunks.length) * 100)
    : 0;

  // Determine section description text
  let sectionDesc = 'Listening to Article';
  if (currentChunk) {
    if (currentChunk.type === 'title') {
      sectionDesc = 'Introductory Title';
    } else if (currentChunk.type === 'subtitle') {
      sectionDesc = 'Subheading Description';
    } else if (currentChunk.type === 'heading' || currentChunk.type === 'subheading') {
      sectionDesc = currentChunk.text;
    } else if (currentChunk.type.startsWith('quote')) {
      sectionDesc = 'Quote Block';
    } else {
      sectionDesc = 'Article Content';
    }
  }

  const isPlaying = status === 'playing';

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 25 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-xl z-[150] shadow-2xl rounded-2xl md:rounded-3xl border border-slate-200/60 dark:border-white/10 overflow-hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl pb-safe"
        >
          {/* Progress bar at the top edge */}
          <div className="w-full h-1 bg-slate-200/50 dark:bg-white/5">
            <div
              style={{ width: `${progressPercent}%` }}
              className="h-full bg-primary transition-all duration-300"
            />
          </div>

          <div className="p-4 flex items-center justify-between gap-4">
            {/* Info Text - Clicks to scroll to main player */}
            <div
              onClick={scrollToPlayer}
              className="flex-1 min-w-0 cursor-pointer hover:opacity-80 transition-opacity"
            >
              <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-primary">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <span>Now Listening</span>
              </div>
              <p className="text-xs text-slate-800 dark:text-slate-200 font-bold truncate mt-0.5">
                {sectionDesc}
              </p>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={skipBackward}
                className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg text-slate-400 hover:text-slate-850 dark:hover:text-white transition-colors"
                aria-label="Skip backward"
              >
                <SkipBack size={14} fill="currentColor" />
              </button>

              <button
                onClick={isPlaying ? pause : play}
                className="p-2.5 bg-primary text-white rounded-full hover:scale-105 active:scale-95 transition-transform flex items-center justify-center"
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" className="ml-0.5" />}
              </button>

              <button
                onClick={skipForward}
                className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg text-slate-400 hover:text-slate-850 dark:hover:text-white transition-colors"
                aria-label="Skip forward"
              >
                <SkipForward size={14} fill="currentColor" />
              </button>

              <div className="w-px h-6 bg-slate-200 dark:bg-white/10 mx-1" />

              <button
                onClick={stop}
                className="p-2 hover:bg-slate-100 dark:hover:bg-red-500/10 rounded-lg text-slate-400 hover:text-red-500 transition-colors"
                aria-label="Stop playback"
              >
                <Square size={12} fill="currentColor" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
