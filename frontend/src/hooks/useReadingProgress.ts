import { useState, useEffect, useCallback } from 'react';
import { EditorBlock } from '../types/editor';
import { HeadingNode } from '../types/navigator';

export function useReadingProgress(blocks: EditorBlock[]) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());

  // Build hierarchy
  const headings = blocks.filter(b => b.type === 'heading' && b.content.level > 1);

  const tree = useCallback(() => {
    const root: HeadingNode[] = [];
    const stack: HeadingNode[] = [];

    headings.forEach((h, i) => {
      const node: HeadingNode = {
        id: h.id,
        text: h.content.text,
        level: h.content.level,
        index: i,
        children: [],
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
      // Calculate scroll progress
      const winScroll = document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = (winScroll / height) * 100;
      setScrollProgress(scrolled);

      // Determine active section and completed sections
      const headingElements = headings.map(h => document.getElementById(h.id)).filter(Boolean) as HTMLElement[];

      let currentActiveId = null;
      const newCompletedIds = new Set<string>();

      headingElements.forEach((el, idx) => {
        const rect = el.getBoundingClientRect();
        // Section is active if it's near the top of the viewport
        if (rect.top <= 150) {
          currentActiveId = headings[idx].id;
          newCompletedIds.add(headings[idx].id);
        }
      });

      setActiveId(currentActiveId);
      setCompletedIds(newCompletedIds);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check

    return () => window.removeEventListener('scroll', handleScroll);
  }, [headings]);

  return {
    tree: tree(),
    activeId,
    scrollProgress,
    completedIds,
    totalHeadings: headings.length
  };
}
