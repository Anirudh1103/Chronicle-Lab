import { useState, useEffect, useRef } from 'react';
import { NarrationChunk } from '../services/narrationParser';

export type TTSStatus = 'idle' | 'loading' | 'playing' | 'paused' | 'completed' | 'error';

interface UseArticleTTSProps {
  chunks: NarrationChunk[];
}

interface WordOffset {
  start: number;
  end: number;
}

function getWordOffsets(text: string): WordOffset[] {
  const offsets: WordOffset[] = [];
  const regex = /\S+/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    offsets.push({
      start: match.index,
      end: match.index + match[0].length
    });
  }
  return offsets;
}

export function useArticleTTS({ chunks }: UseArticleTTSProps) {
  const [status, setStatus] = useState<TTSStatus>('idle');
  const [currentChunkIndex, setCurrentChunkIndex] = useState<number>(-1);
  const [spokenWordRange, setSpokenWordRange] = useState<{ start: number; end: number } | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceName, setSelectedVoiceName] = useState<string>(() => {
    return localStorage.getItem('chroniclelab_tts_voice') || 'Auto';
  });
  const [rate, setRate] = useState<number>(() => {
    const saved = localStorage.getItem('chroniclelab_tts_speed');
    return saved ? parseFloat(saved) : 1.0;
  });

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const timerRef = useRef<any>(null);
  const hasReceivedBoundaryRef = useRef(false);
  const chunkStartTimeRef = useRef(0);
  const pausedTimeRef = useRef(0);

  // Load voices
  useEffect(() => {
    const updateVoices = () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        const loadedVoices = window.speechSynthesis.getVoices();
        setVoices(loadedVoices);
        
        // Auto-select Google Hindi as default if no user preference is stored
        if (!localStorage.getItem('chroniclelab_tts_voice')) {
          const googleHindi = loadedVoices.find(v => 
            v.lang.toLowerCase().startsWith('hi') && 
            (v.name.toLowerCase().includes('google') || v.name.includes('हिन्दी') || v.name.toLowerCase().includes('hindi'))
          );
          if (googleHindi) {
            setSelectedVoiceName(googleHindi.name);
          }
        }
      }
    };

    updateVoices();
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  // Helper to select the best voice based on language
  const getVoiceForLang = (lang: string): SpeechSynthesisVoice | null => {
    if (voices.length === 0) return null;

    // 1. Respect user override if a specific voice is selected
    if (selectedVoiceName !== 'Auto') {
      const match = voices.find(v => v.name === selectedVoiceName);
      if (match) return match;
    }

    // 2. Prioritize Google Hindi for any content (default voice model) if voice setting is Auto
    if (selectedVoiceName === 'Auto') {
      const googleHindiVoice = voices.find(v => 
        v.lang.toLowerCase().startsWith('hi') && 
        (v.name.toLowerCase().includes('google') || v.name.includes('हिन्दी') || v.name.toLowerCase().includes('hindi'))
      );
      if (googleHindiVoice) return googleHindiVoice;
    }

    // 3. Prioritize Microsoft Mark as default if using Auto
    if (selectedVoiceName === 'Auto') {
      const markVoice = voices.find(v => v.name.toLowerCase().includes('microsoft mark'));
      if (markVoice) return markVoice;
    }

    // 4. Prioritize Indian English (en-IN) voices for English content if Mark isn't available
    if (selectedVoiceName === 'Auto' && lang.toLowerCase().startsWith('en')) {
      const indianVoice = voices.find(v => v.lang.toLowerCase() === 'en-in' || v.lang.toLowerCase().startsWith('en-in'));
      if (indianVoice) return indianVoice;
    }

    // 5. Select default voice for target language
    // Match exact lang first (e.g., 'hi-IN' or 'en-US')
    let matchedVoice = voices.find(v => v.lang.toLowerCase() === lang.toLowerCase());
    
    // Fallback: match lang prefix (e.g., 'en')
    if (!matchedVoice) {
      const prefix = lang.split('-')[0].toLowerCase();
      if (prefix === 'en') {
        const indianVoice = voices.find(v => v.lang.toLowerCase().startsWith('en-in'));
        if (indianVoice) matchedVoice = indianVoice;
      }
      if (!matchedVoice) {
        matchedVoice = voices.find(v => v.lang.toLowerCase().startsWith(prefix));
      }
    }

    // Fallback: try local default voice
    if (!matchedVoice) {
      matchedVoice = voices.find(v => v.default);
    }

    return matchedVoice || null;
  };

  const playChunk = (index: number) => {
    if (chunks.length === 0) return;
    if (index < 0 || index >= chunks.length) {
      setStatus('completed');
      setCurrentChunkIndex(-1);
      setSpokenWordRange(null);
      return;
    }

    if (typeof window === 'undefined' || !window.speechSynthesis) {
      setStatus('error');
      return;
    }

    // Silence old utterance handlers to avoid async End/Error races
    if (utteranceRef.current) {
      utteranceRef.current.onstart = null;
      utteranceRef.current.onend = null;
      utteranceRef.current.onerror = null;
      utteranceRef.current.onboundary = null;
    }
    window.speechSynthesis.cancel();

    const chunk = chunks[index];
    const utterance = new SpeechSynthesisUtterance(chunk.text);

    // Bind voice
    const activeVoice = getVoiceForLang(chunk.lang);
    if (activeVoice) {
      utterance.voice = activeVoice;
    }
    utterance.lang = chunk.lang;
    utterance.rate = rate;

    // Bind events
    utterance.onstart = () => {
      setStatus('playing');
      setCurrentChunkIndex(index);
      setSpokenWordRange(null);
    };

    utterance.onend = () => {
      // Move to next chunk automatically
      playChunk(index + 1);
    };

    utterance.onboundary = (e) => {
      if (e.name === 'word') {
        hasReceivedBoundaryRef.current = true;
        const start = e.charIndex;
        let length = e.charLength || 0;
        if (!length) {
          const subText = chunk.text.substring(start);
          const match = subText.match(/^\w+/);
          length = match ? match[0].length : 1;
        }
        setSpokenWordRange({ start, end: start + length });
      }
    };

    utterance.onerror = (e) => {
      // Ignore interruption triggers
      if (e.error === 'interrupted') return;
      console.error('SpeechSynthesis error:', e);
      setStatus('error');
    };

    // Reference retention to dodge GC bug
    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const handlePlay = (index?: number) => {
    if (status === 'paused') {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.resume();
        setStatus('playing');
      }
    } else {
      const targetIndex = typeof index === 'number' ? index : (currentChunkIndex >= 0 ? currentChunkIndex : 0);
      playChunk(targetIndex);
    }
  };

  const handlePause = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.pause();
      setStatus('paused');
    }
  };

  const handleStop = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      if (utteranceRef.current) {
        utteranceRef.current.onstart = null;
        utteranceRef.current.onend = null;
        utteranceRef.current.onerror = null;
        utteranceRef.current.onboundary = null;
      }
      window.speechSynthesis.cancel();
    }
    setStatus('idle');
    setCurrentChunkIndex(-1);
    setSpokenWordRange(null);
  };

  const handleSkipForward = () => {
    if (currentChunkIndex < 0) return;
    const currentBlockId = chunks[currentChunkIndex]?.blockId;
    let nextIndex = currentChunkIndex + 1;
    
    // Jump to next logical block
    while (nextIndex < chunks.length && chunks[nextIndex].blockId === currentBlockId) {
      nextIndex++;
    }
    
    if (nextIndex < chunks.length) {
      playChunk(nextIndex);
    } else {
      handleStop();
      setStatus('completed');
    }
  };

  const handleSkipBackward = () => {
    if (currentChunkIndex < 0) return;
    const currentBlockId = chunks[currentChunkIndex]?.blockId;
    
    // Identify start of current block
    let startOfCurrent = currentChunkIndex;
    while (startOfCurrent > 0 && chunks[startOfCurrent - 1].blockId === currentBlockId) {
      startOfCurrent--;
    }
    
    // If at block start already, skip to start of previous block
    if (currentChunkIndex === startOfCurrent) {
      let prevIndex = currentChunkIndex - 1;
      if (prevIndex >= 0) {
        const prevBlockId = chunks[prevIndex].blockId;
        while (prevIndex > 0 && chunks[prevIndex - 1].blockId === prevBlockId) {
          prevIndex--;
        }
        playChunk(prevIndex);
      }
    } else {
      playChunk(startOfCurrent);
    }
  };

  const handleRateChange = (newRate: number) => {
    setRate(newRate);
    localStorage.setItem('chroniclelab_tts_speed', newRate.toString());
    if (status === 'playing' || status === 'paused') {
      playChunk(currentChunkIndex);
    }
  };

  const handleVoiceChange = (voiceName: string) => {
    setSelectedVoiceName(voiceName);
    localStorage.setItem('chroniclelab_tts_voice', voiceName);
    if (status === 'playing' || status === 'paused') {
      // Re-trigger current chunk with the new voice setting
      playChunk(currentChunkIndex);
    }
  };

  // Timer-based fallback for word-level highlights
  useEffect(() => {


    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (status !== 'playing' || currentChunkIndex < 0 || currentChunkIndex >= chunks.length) {
      if (status === 'paused') {
        pausedTimeRef.current = Date.now();
      }
      return;
    }

    if (status === 'playing' && pausedTimeRef.current > 0) {
      const pauseDuration = Date.now() - pausedTimeRef.current;
      chunkStartTimeRef.current += pauseDuration;
      pausedTimeRef.current = 0;
    } else {
      chunkStartTimeRef.current = Date.now();
      hasReceivedBoundaryRef.current = false;
    }

    const chunk = chunks[currentChunkIndex];
    const wordOffsets = getWordOffsets(chunk.text);
    const wordsCount = wordOffsets.length;
    if (wordsCount === 0) return;

    const wpm = chunk.lang.startsWith('hi') ? 105 : 135;
    const estimatedDuration = (wordsCount / (wpm * rate)) * 60 * 1000;

    timerRef.current = setInterval(() => {
      if (hasReceivedBoundaryRef.current) {
        return;
      }

      const elapsed = Date.now() - chunkStartTimeRef.current;
      if (elapsed >= estimatedDuration) {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        return;
      }

      const progress = elapsed / estimatedDuration;
      const activeIdx = Math.floor(progress * wordsCount);
      const activeOffset = wordOffsets[Math.min(activeIdx, wordsCount - 1)];
      if (activeOffset) {
        setSpokenWordRange(activeOffset);
      }
    }, 60);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [status, currentChunkIndex, rate, chunks]);

  // Cleanup synthesis on hook unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return {
    status,
    currentChunkIndex,
    spokenWordRange,
    currentBlockId: chunks[currentChunkIndex]?.blockId || null,
    voices,
    selectedVoiceName,
    rate,
    play: handlePlay,
    pause: handlePause,
    stop: handleStop,
    skipForward: handleSkipForward,
    skipBackward: handleSkipBackward,
    setRate: handleRateChange,
    setVoice: handleVoiceChange,
  };
}
