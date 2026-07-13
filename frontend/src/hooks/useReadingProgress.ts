import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { EditorBlock } from '../types/editor';
import { HeadingNode } from '../types/navigator';

export function useReadingProgress(blocks: EditorBlock[]) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());

  // Memoize headings to prevent effect loop
  const headings = useMemo(() =>
    blocks.filter(b => b.type === 'heading' && b.content.level > 1),
    [blocks]
  );

  const tree = useMemo(() => {
    const root: HeadingNode[] = [];
    const stack: HeadingNode[] = [];

    headings.forEach((h, i) => {
      const node: HeadingNode = {
        id: h.id,
        text: h.content.text.replace(/<[^>]*>/g, ''), // Clean HTML tags for the navigator
        level: h.content.level,
        index: i,
        children: [],
        type: 'heading' // Adding a type for consistency
      };

      while (stack.length > 0 && stack[stack.length - 1].level >= node.level) {
        stack.pop();
      }

      if (stack.length === 0) {
        root.push(node);
      } else {
        const parent = stack[stack.length - 1];
        node.parentId = parent.id;
        parent.children.push(node);
      }
      stack.push(node);
    });
    return root;
  }, [headings]);

  useEffect(() => {
    const handleScroll = () => {
      // Precise scroll progress calculation
      const winScroll = window.scrollY;
      const height = document.documentElement.scrollHeight - window.innerHeight;
      const scrolled = Math.min(100, Math.max(0, (winScroll / height) * 100));
      setScrollProgress(scrolled);

      // Determine active section
      const headingElements = headings
        .map(h => ({ id: h.id, el: document.getElementById(h.id) }))
        .filter(h => h.el);

      let currentActiveId = null;
      const newCompletedIds = new Set<string>();

      headingElements.forEach((item) => {
        const rect = item.el!.getBoundingClientRect();
        // Section is active if it has crossed the 200px threshold from top
        if (rect.top <= 200) {
          currentActiveId = item.id;
          newCompletedIds.add(item.id);
        }
      });

      setActiveId(prev => prev !== currentActiveId ? currentActiveId : prev);
      setCompletedIds(prev => {
        if (prev.size !== newCompletedIds.size) return newCompletedIds;
        return prev;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [headings]);

  return {
    tree,
    activeId,
    scrollProgress,
    completedIds,
    totalHeadings: headings.length
  };
}
