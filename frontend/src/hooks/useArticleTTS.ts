import { useState, useEffect, useRef } from 'react';
import { NarrationChunk } from '../services/narrationParser';

export type TTSStatus = 'idle' | 'loading' | 'playing' | 'paused' | 'completed' | 'error';

interface UseArticleTTSProps {
  chunks: NarrationChunk[];
}

export function useArticleTTS({ chunks }: UseArticleTTSProps) {
  const [status, setStatus] = useState<TTSStatus>('idle');
  const [currentChunkIndex, setCurrentChunkIndex] = useState<number>(-1);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceName, setSelectedVoiceName] = useState<string>(() => {
    return localStorage.getItem('chroniclelab_tts_voice') || 'Auto';
  });
  const [rate, setRate] = useState<number>(() => {
    const saved = localStorage.getItem('chroniclelab_tts_speed');
    return saved ? parseFloat(saved) : 1.0;
  });

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Load voices
  useEffect(() => {
    const updateVoices = () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        setVoices(window.speechSynthesis.getVoices());
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

    // 2. Prioritize Indian English (en-IN) voices for English content if using Auto
    if (selectedVoiceName === 'Auto' && lang.toLowerCase().startsWith('en')) {
      const indianVoice = voices.find(v => v.lang.toLowerCase() === 'en-in' || v.lang.toLowerCase().startsWith('en-in'));
      if (indianVoice) return indianVoice;
    }

    // 3. Select default voice for target language
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
      return;
    }

    if (typeof window === 'undefined' || !window.speechSynthesis) {
      setStatus('error');
      return;
    }

    // Cancel active speech
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
    };

    utterance.onend = () => {
      // Move to next chunk automatically
      playChunk(index + 1);
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
      window.speechSynthesis.cancel();
    }
    setStatus('idle');
    setCurrentChunkIndex(-1);
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
