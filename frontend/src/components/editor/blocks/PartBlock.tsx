import React from 'react';
import { useEditorStore } from '../../../store/useEditorStore';
import { BookOpen } from 'lucide-react';

interface PartBlockProps {
  id: string;
  content: {
    title: string;
    description?: string;
    metadata?: {
      accentColor?: string;
    };
  };
}

/**
 * PartBlock functional component representing a major part/section wrapper in the document.
 * Rendered with an accented border top, customizable title and description.
 */
export const PartBlock: React.FC<PartBlockProps> = ({ id, content }) => {
  const updateBlock = useEditorStore((state) => state.updateBlock);
  const accentColor = content.metadata?.accentColor || '#f97316';

  return (
    <div
      className="relative my-8 w-full text-center py-10 px-6 rounded-[2rem] bg-slate-50 dark:bg-gradient-to-b dark:from-[#070c1d]/90 dark:to-[#030611]/95 border border-slate-200 dark:border-slate-900/60 shadow-md select-text"
      style={{ borderTopColor: accentColor, borderTopWidth: '4px' }}
    >
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center border shadow-md bg-white dark:bg-[#070c1d] border-slate-200 dark:border-slate-850">
        <BookOpen className="w-4 h-4" style={{ color: accentColor }} />
      </div>
      <span className="text-[9px] font-black tracking-[0.25em] uppercase opacity-60 block mb-2" style={{ color: accentColor }}>
        Part
      </span>
      <input
        type="text"
        value={content.title || ''}
        onChange={(e) => updateBlock(id, { ...content, title: e.target.value })}
        className="w-full bg-transparent border-none text-center text-xl md:text-2xl font-editorial italic font-black text-slate-800 dark:text-white focus:outline-none focus:ring-0 p-0"
        placeholder="Enter Part Title..."
      />
      <textarea
        value={content.description || ''}
        onChange={(e) => updateBlock(id, { ...content, description: e.target.value })}
        rows={2}
        className="w-full bg-transparent border-none text-center text-xs text-slate-500 dark:text-slate-400 mt-3 focus:outline-none focus:ring-0 p-0 resize-none font-medium"
        placeholder="Add part description (optional)..."
      />
    </div>
  );
};
