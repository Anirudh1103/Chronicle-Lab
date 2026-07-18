import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Square, SkipForward, SkipBack, ChevronDown, Volume2, Settings, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { TTSStatus } from '../../hooks/useArticleTTS';
import { NarrationChunk } from '../../services/narrationParser';
import { cn } from '../../utils/cn';
import { WordLevelSentence } from './WordLevelSentence';

interface ArticleAudioPlayerProps {
  status: TTSStatus;
  currentChunkIndex: number;
  spokenWordRange?: { start: number; end: number } | null;
  rate: number;
  voices: SpeechSynthesisVoice[];
  selectedVoiceName: string;
  chunks: NarrationChunk[];
  readingTime: number;
  play: (index?: number) => void;
  pause: () => void;
  stop: () => void;
  skipForward: () => void;
  skipBackward: () => void;
  setRate: (rate: number) => void;
  setVoice: (voiceName: string) => void;
}

export function ArticleAudioPlayer({
  status,
  currentChunkIndex,
  spokenWordRange = null,
  rate,
  voices,
  selectedVoiceName,
  chunks,
  readingTime,
  play,
  pause,
  stop,
  skipForward,
  skipBackward,
  setRate,
  setVoice
}: ArticleAudioPlayerProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showVoiceMenu, setShowVoiceMenu] = useState(false);

  const speedMenuRef = useRef<HTMLDivElement>(null);
  const voiceMenuRef = useRef<HTMLDivElement>(null);

  // Close menus on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (speedMenuRef.current && !speedMenuRef.current.contains(event.target as Node)) {
        setShowSpeedMenu(false);
      }
      if (voiceMenuRef.current && !voiceMenuRef.current.contains(event.target as Node)) {
        setShowVoiceMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (chunks.length === 0) return null;

  // Calculate estimated reading/listening metrics consistent with database stats
  const totalMinutes = readingTime || 5;
  const listenMinutes = Math.max(1, Math.round(totalMinutes / rate));

  // Timestamp estimates scaled matching the current chunk queue progress
  const totalSecs = totalMinutes * 60;
  const elapsedSecs = chunks.length > 0
    ? Math.min(totalSecs, Math.round(((currentChunkIndex >= 0 ? currentChunkIndex : 0) / chunks.length) * totalSecs))
    : 0;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const progressPercent = chunks.length > 0
    ? Math.round(((currentChunkIndex >= 0 ? currentChunkIndex : 0) / chunks.length) * 100)
    : 0;

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    const targetIndex = Math.floor(ratio * chunks.length);
    play(targetIndex);
  };

  const isPreparing = status === 'loading';
  const isPlaying = status === 'playing';
  const isPaused = status === 'paused';
  const isIdle = status === 'idle' || status === 'completed';

  const speedOptions = [0.75, 1.0, 1.25, 1.5, 1.75, 2.0];

  return (
    <div className="w-full my-8 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-[2rem] p-6 md:p-8 space-y-6 shadow-sm backdrop-blur-xl">
      {/* Collapsed Player State */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => isPlaying ? pause() : play()}
            disabled={isPreparing}
            className="p-4 bg-primary text-white rounded-full hover:scale-105 active:scale-95 transition-transform shadow-lg shadow-primary/20 flex items-center justify-center disabled:opacity-50"
            aria-label={isPlaying ? 'Pause narration' : 'Play narration'}
          >
            {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-0.5" />}
          </button>
          
          <div>
            <h4 className="font-black text-sm uppercase tracking-wider text-slate-800 dark:text-slate-200">
              {isPlaying ? 'Listening to Article' : isPaused ? 'Narration Paused' : 'Listen to this article'}
            </h4>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Approx. {totalMinutes} min read &middot; {listenMinutes} min listen
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Collapse/Expand Toggle */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800/80 rounded-xl text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-800 dark:hover:text-white transition-all flex items-center gap-2"
          >
            {isExpanded ? 'Show Less' : 'Show Player'}
            <ChevronDown size={14} className={cn("transition-transform duration-300", isExpanded && "rotate-180")} />
          </button>
        </div>
      </div>

      {/* Expanded Audio Options */}
      {isExpanded && (
        <div className="space-y-6 pt-6 border-t border-slate-100 dark:border-slate-800/50 animate-in fade-in duration-300">
          {/* Time & Progress Seek bar */}
          <div className="space-y-2">
            <div
              onClick={handleProgressBarClick}
              className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full cursor-pointer relative group"
            >
              <div
                style={{ width: `${progressPercent}%` }}
                className="h-full bg-primary rounded-full transition-all duration-300 relative"
              />
              <div
                style={{ left: `${progressPercent}%` }}
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 bg-primary border-2 border-white dark:border-slate-900 rounded-full shadow-md scale-0 group-hover:scale-100 transition-transform duration-200"
              />
            </div>
            
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <span>{formatTime(elapsedSecs)}</span>
              <span>{formatTime(totalSecs)}</span>
            </div>
          </div>

          {/* Subtitle Queue Panel */}
          {isPlaying && chunks[currentChunkIndex] && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-slate-100/50 dark:bg-white/5 border border-slate-200/25 dark:border-white/5 rounded-3xl select-none text-left">
              {/* CURRENT */}
              <div className="space-y-2.5">
                <span className="text-[9px] font-black uppercase tracking-[0.25em] text-primary flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  Now Narrating
                </span>
                <div className="overflow-hidden min-h-[55px]">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={chunks[currentChunkIndex].id}
                      initial={{ 
                        opacity: 0, 
                        y: (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) ? 0 : 15,
                        filter: 'blur(3px)'
                      }}
                      animate={{ 
                        opacity: 1, 
                        y: 0,
                        filter: 'blur(0px)'
                      }}
                      exit={{ 
                        opacity: 0, 
                        y: (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) ? 0 : -15,
                        filter: 'blur(3px)'
                      }}
                      transition={{ duration: 0.3, ease: 'easeOut' }}
                      className="text-xs md:text-sm text-slate-800 dark:text-slate-250 font-bold leading-relaxed border-l-2 border-primary/30 pl-4 py-0.5"
                    >
                      <WordLevelSentence
                        id={`player-${chunks[currentChunkIndex].id}`}
                        htmlText={chunks[currentChunkIndex].text}
                        isActiveSentence={true}
                        spokenWordRange={spokenWordRange}
                      />
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>

              {/* UP NEXT */}
              <div className="space-y-2.5 border-t md:border-t-0 md:border-l border-slate-250/50 dark:border-white/5 pt-4 md:pt-0 md:pl-6 opacity-60">
                <span className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-450 dark:text-slate-500">
                  Up Next
                </span>
                <div className="overflow-hidden min-h-[55px]">
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={chunks[currentChunkIndex + 1] ? chunks[currentChunkIndex + 1].id : 'end'}
                      initial={{ 
                        opacity: 0, 
                        y: (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) ? 0 : 15,
                        filter: 'blur(3px)'
                      }}
                      animate={{ 
                        opacity: 1, 
                        y: 0,
                        filter: 'blur(0px)'
                      }}
                      exit={{ 
                        opacity: 0, 
                        y: (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) ? 0 : -15,
                        filter: 'blur(3px)'
                      }}
                      transition={{ duration: 0.3, ease: 'easeOut' }}
                      className="text-xs text-slate-500 dark:text-slate-400 font-semibold leading-relaxed pl-4 py-0.5"
                    >
                      {chunks[currentChunkIndex + 1] ? chunks[currentChunkIndex + 1].text : 'End of narration queue.'}
                    </motion.p>
                  </AnimatePresence>
                </div>
              </div>
            </div>
          )}

          {/* Control Bar */}
          <div className="flex flex-wrap items-center justify-between gap-6 pt-2">
            {/* Core Controls */}
            <div className="flex items-center gap-4">
              <button
                onClick={skipBackward}
                disabled={isIdle}
                className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors disabled:opacity-40"
                aria-label="Skip to previous paragraph"
              >
                <SkipBack size={18} fill="currentColor" />
              </button>

              <button
                onClick={isPlaying ? pause : () => play()}
                className="p-3 bg-primary/10 hover:bg-primary/20 text-primary rounded-full hover:scale-105 active:scale-95 transition-transform"
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
              </button>

              <button
                onClick={skipForward}
                disabled={isIdle}
                className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors disabled:opacity-40"
                aria-label="Skip to next paragraph"
              >
                <SkipForward size={18} fill="currentColor" />
              </button>

              {!isIdle && (
                <button
                  onClick={stop}
                  className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-red-500 hover:bg-red-500/10 transition-colors"
                  aria-label="Stop narration"
                >
                  <Square size={16} fill="currentColor" />
                </button>
              )}
            </div>

            {/* Menu Options (Speed & Voice) */}
            <div className="flex items-center gap-4">
              {/* Playback Speed Control */}
              <div className="relative" ref={speedMenuRef}>
                <button
                  onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                  className="px-3.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-xs font-black uppercase tracking-wider text-slate-400 hover:text-slate-800 dark:hover:text-white transition-all flex items-center gap-1.5"
                >
                  <Volume2 size={14} />
                  Speed: {rate}x
                </button>

                {showSpeedMenu && (
                  <div className="absolute right-0 bottom-full mb-2 w-32 bg-slate-900 border border-white/10 rounded-2xl shadow-xl overflow-hidden py-1.5 z-[210] animate-in fade-in slide-in-from-bottom-2 duration-200">
                    {speedOptions.map((option) => (
                      <button
                        key={option}
                        onClick={() => {
                          setRate(option);
                          setShowSpeedMenu(false);
                        }}
                        className={cn(
                          "w-full text-left px-4 py-2 text-xs font-bold transition-colors text-slate-400 hover:text-white hover:bg-white/5",
                          rate === option && "text-primary hover:text-primary bg-primary/5"
                        )}
                      >
                        {option}x {option === 1.0 && '(Default)'}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Voice Selection */}
              <div className="relative" ref={voiceMenuRef}>
                <button
                  onClick={() => setShowVoiceMenu(!showVoiceMenu)}
                  className="px-3.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-xs font-black uppercase tracking-wider text-slate-400 hover:text-slate-800 dark:hover:text-white transition-all flex items-center gap-1.5 max-w-[200px]"
                >
                  <Globe size={14} />
                  <span className="truncate">Voice: {selectedVoiceName}</span>
                </button>

                {showVoiceMenu && (
                  <div className="absolute right-0 bottom-full mb-2 w-64 max-h-60 overflow-y-auto no-scrollbar bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl py-1.5 z-[210] animate-in fade-in slide-in-from-bottom-2 duration-200">
                    <button
                      onClick={() => {
                        setVoice('Auto');
                        setShowVoiceMenu(false);
                      }}
                      className={cn(
                        "w-full text-left px-4 py-2 text-xs font-bold transition-colors text-slate-700 dark:text-slate-300 hover:text-primary dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5",
                        selectedVoiceName === 'Auto' && "text-primary hover:text-primary bg-primary/5"
                      )}
                    >
                      System Default (Auto)
                    </button>
                    <div className="h-px bg-slate-200 dark:bg-white/5 my-1" />
                    {voices.map((v) => (
                      <button
                        key={v.name}
                        onClick={() => {
                          setVoice(v.name);
                          setShowVoiceMenu(false);
                        }}
                        className={cn(
                          "w-full text-left px-4 py-2 text-xs font-bold transition-colors text-slate-700 dark:text-slate-300 hover:text-primary dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 flex flex-col gap-0.5",
                          selectedVoiceName === v.name && "text-primary hover:text-primary bg-primary/5"
                        )}
                      >
                        <span className="truncate">{v.name}</span>
                        <span className="text-[9px] text-slate-400 dark:text-slate-500 font-medium">({v.lang})</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
