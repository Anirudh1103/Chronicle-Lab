import React from 'react';
import { EditorBlock } from '../../types/editor';
import { List, ChevronRight } from 'lucide-react';
import { cn } from '../../utils/cn';
import { stripHtml } from '../../utils/stripHtml';

interface TableOfContentsProps {
  blocks: EditorBlock[];
}

export const TableOfContents: React.FC<TableOfContentsProps> = ({ blocks }) => {
  const headings = blocks
    .filter((block) => block.type === 'heading' && stripHtml(block.content.text) !== '')
    .map((block) => ({
      id: block.id,
      text: stripHtml(block.content.text),
      level: block.content.level,
    }));

  if (headings.length === 0) return null;

  const scrollToBlock = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="mb-12 p-6 rounded-2xl border border-slate-200 bg-white/50 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/50">
      <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm mb-4">
        <List size={18} className="text-blue-500" />
        Table of Contents
      </div>
      <nav className="space-y-1">
        {headings.map((heading) => (
          <button
            key={heading.id}
            onClick={() => scrollToBlock(heading.id)}
            className={cn(
              "group flex items-center gap-2 w-full text-left py-1.5 transition-all hover:translate-x-1",
              heading.level === 1 && "pl-0 font-bold text-slate-900 dark:text-white",
              heading.level === 2 && "pl-4 text-sm font-semibold text-slate-700 dark:text-slate-300",
              heading.level === 3 && "pl-8 text-xs font-medium text-slate-500 dark:text-slate-400",
              heading.level > 3 && "pl-12 text-xs text-slate-400"
            )}
          >
            <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 text-blue-500 transition-opacity" />
            <span className="truncate">{heading.text}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};
