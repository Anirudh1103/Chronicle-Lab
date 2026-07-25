import React from 'react';
import { useEditorStore } from '../../../store/useEditorStore';

interface ChapterBlockProps {
  id: string;
  content: {
    title: string;
    description?: string;
  };
}

/**
 * ChapterBlock functional component representing a chapter header wrapper in the document.
 * Includes a text field for title and description.
 */
export const ChapterBlock: React.FC<ChapterBlockProps> = ({ id, content }) => {
  const updateBlock = useEditorStore((state) => state.updateBlock);

  return (
    <div className="pt-6 pb-4 border-b border-slate-200 dark:border-slate-900 mb-6 text-left select-text">
      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#f97316] block mb-1">
        Part / Chapter Section
      </span>
      <input
        type="text"
        value={content.title || ''}
        onChange={(e) => updateBlock(id, { ...content, title: e.target.value })}
        className="w-full bg-transparent border-none text-xl md:text-2xl font-editorial italic font-black text-slate-800 dark:text-slate-100 placeholder:text-slate-350 dark:placeholder:text-slate-855 focus:outline-none focus:ring-0 p-0"
        placeholder="Enter Chapter/Part Title..."
      />
      <textarea
        value={content.description || ''}
        onChange={(e) => updateBlock(id, { ...content, description: e.target.value })}
        rows={1}
        className="w-full bg-transparent border-none text-xs text-slate-550 dark:text-slate-500 mt-2 focus:outline-none focus:ring-0 p-0 resize-none font-medium"
        placeholder="Add chapter description (optional)..."
      />
    </div>
  );
};
