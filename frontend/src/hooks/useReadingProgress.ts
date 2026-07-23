import { useState, useEffect, useMemo } from 'react';
import { EditorBlock } from '../types/editor';
import { HeadingNode } from '../types/navigator';
import { stripHtml } from '../utils/stripHtml';

export function useReadingProgress(blocks: EditorBlock[]) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());

  // Focus navigation on significant structural headings for a cleaner TOC
  const headings = useMemo(() =>
    blocks.filter(b =>
      b.type === 'part' ||
      b.type === 'chapter' ||
      b.type === 'heading' ||
      b.type === 'subheading'
    ),
    [blocks]
  );

  const tree = useMemo(() => {
    return headings.map((h, i) => ({
      id: h.id,
      text: stripHtml(h.content.title || h.content.text || ''),
      level: h.content.level || 2,
      index: i,
      children: [],
      type: h.type
    } as any));
  }, [headings]);

  useEffect(() => {
    if (headings.length === 0) return;

    // Use a more precise observer for "completion" and "active" status
    const observerOptions = {
      root: null,
      rootMargin: '-15% 0px -60% 0px', // Center-weighted viewport area
      threshold: [0, 0.5, 1.0]
    };

    const callback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        const id = entry.target.id;

        // Active detection
        if (entry.isIntersecting && entry.intersectionRatio > 0.1) {
          setActiveId(id);
        }

        // Completion detection: Section is considered "read" if it's passed the top threshold
        const rect = entry.target.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.2) {
            setCompletedIds(prev => {
                if (prev.has(id)) return prev;
                const next = new Set(prev);
                next.add(id);
                return next;
            });
        } else {
            setCompletedIds(prev => {
                if (!prev.has(id)) return prev;
                const next = new Set(prev);
                next.delete(id);
                return next;
            });
        }
      });
    };

    const observer = new IntersectionObserver(callback, observerOptions);
    headings.forEach((h) => {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  return {
    tree,
    activeId,
    completedIds
  };
}
