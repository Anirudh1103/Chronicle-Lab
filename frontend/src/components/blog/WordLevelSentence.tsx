import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../../utils/cn';

interface HtmlWordToken {
  type: 'tag' | 'text';
  content: string;
  start?: number;
  end?: number;
}

export function parseHtmlSentence(htmlText: string): HtmlWordToken[] {
  const tokens: HtmlWordToken[] = [];
  let i = 0;
  let cleanTextOffset = 0;

  while (i < htmlText.length) {
    if (htmlText[i] === '<') {
      const closeIdx = htmlText.indexOf('>', i);
      if (closeIdx !== -1) {
        tokens.push({
          type: 'tag',
          content: htmlText.substring(i, closeIdx + 1)
        });
        i = closeIdx + 1;
      } else {
        tokens.push({
          type: 'text',
          content: '<',
          start: cleanTextOffset,
          end: cleanTextOffset + 1
        });
        cleanTextOffset += 1;
        i++;
      }
    } else {
      let nextTagIdx = htmlText.indexOf('<', i);
      if (nextTagIdx === -1) {
        nextTagIdx = htmlText.length;
      }
      
      const textSection = htmlText.substring(i, nextTagIdx);
      let wordStart = 0;
      while (wordStart < textSection.length) {
        if (/\s/.test(textSection[wordStart])) {
          let spaceEnd = wordStart;
          while (spaceEnd < textSection.length && /\s/.test(textSection[spaceEnd])) {
            spaceEnd++;
          }
          tokens.push({
            type: 'tag',
            content: textSection.substring(wordStart, spaceEnd)
          });
          wordStart = spaceEnd;
        } else {
          let wordEnd = wordStart;
          while (wordEnd < textSection.length && !/\s/.test(textSection[wordEnd])) {
            wordEnd++;
          }
          const wordStr = textSection.substring(wordStart, wordEnd);
          tokens.push({
            type: 'text',
            content: wordStr,
            start: cleanTextOffset,
            end: cleanTextOffset + wordStr.length
          });
          cleanTextOffset += wordStr.length;
          wordStart = wordEnd;
        }
      }
      i = nextTagIdx;
    }
  }

  return tokens;
}

interface WordLevelSentenceProps {
  id: string;
  htmlText: string;
  isActiveSentence: boolean;
  spokenWordRange?: { start: number; end: number } | null;
  className?: string;
}

export const WordLevelSentence: React.FC<WordLevelSentenceProps> = ({
  id,
  htmlText,
  isActiveSentence,
  spokenWordRange,
  className
}) => {
  const containerRef = useRef<HTMLSpanElement>(null);
  const [pillStyle, setPillStyle] = useState<React.CSSProperties>({
    position: 'absolute',
    opacity: 0,
    pointerEvents: 'none',
    zIndex: -1
  });

  const tokens = React.useMemo(() => parseHtmlSentence(htmlText), [htmlText]);

  const activeTokenIndex = React.useMemo(() => {
    if (!isActiveSentence || !spokenWordRange) return -1;
    return tokens.findIndex(token => 
      token.type === 'text' && 
      spokenWordRange.start >= token.start! && 
      spokenWordRange.start < token.end!
    );
  }, [isActiveSentence, spokenWordRange, tokens]);

  const prefersReducedMotion = typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
    : false;

  useEffect(() => {
    if (activeTokenIndex === -1) {
      setPillStyle(prev => ({ ...prev, opacity: 0 }));
      return;
    }

    const container = containerRef.current;
    if (!container) return;

    const activeEl = container.querySelector(`[data-token-idx="${activeTokenIndex}"]`) as HTMLElement;
    if (activeEl) {
      setPillStyle({
        position: 'absolute',
        left: 0,
        top: 0,
        width: activeEl.offsetWidth,
        height: activeEl.offsetHeight,
        transform: `translate3d(${activeEl.offsetLeft}px, ${activeEl.offsetTop}px, 0)`,
        opacity: 1,
        pointerEvents: 'none',
        zIndex: -1,
        transition: prefersReducedMotion 
          ? 'none' 
          : 'transform 180ms cubic-bezier(0.2, 0.8, 0.2, 1), width 180ms cubic-bezier(0.2, 0.8, 0.2, 1), height 180ms cubic-bezier(0.2, 0.8, 0.2, 1), opacity 150ms ease',
      });
    }
  }, [activeTokenIndex, prefersReducedMotion]);

  const isSentenceLevelFallback = isActiveSentence && !spokenWordRange;

  return (
    <span 
      ref={containerRef} 
      id={id} 
      className={cn(
        "relative inline transition-all duration-300 rounded px-0.5",
        isSentenceLevelFallback ? "font-bold" : "",
        className
      )}
    >
      <span
        style={pillStyle}
        className="bg-primary/10 border-b border-primary/25 rounded-md dark:bg-primary/20 shadow-[0_0_12px_rgba(59,130,246,0.25)]"
      />

      {tokens.map((token, idx) => {
        if (token.type === 'tag') {
          return <span key={idx} dangerouslySetInnerHTML={{ __html: token.content }} />;
        }

        const isWordActive = idx === activeTokenIndex;

        return (
          <span
            key={idx}
            data-token-idx={idx}
            className={cn(
              "transition-colors duration-200 rounded px-0.5 inline",
              isWordActive
                ? "text-slate-950 dark:text-white font-extrabold"
                : isActiveSentence 
                  ? "text-slate-800 dark:text-slate-300" 
                  : ""
            )}
            dangerouslySetInnerHTML={{ __html: token.content }}
          />
        );
      })}
    </span>
  );
};
