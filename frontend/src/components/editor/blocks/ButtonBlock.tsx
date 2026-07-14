import React from 'react';
import { useEditorStore } from '../../../store/useEditorStore';
import { MousePointer2, Link as LinkIcon } from 'lucide-react';
import { cn } from '../../../utils/cn';

interface ButtonBlockProps {
  id: string;
  content: {
    text: string;
    url: string;
    variant: 'primary' | 'secondary' | 'outline';
    alignment: 'left' | 'center' | 'right';
  };
}

export const ButtonBlock: React.FC<ButtonBlockProps> = ({ id, content }) => {
  const updateBlock = useEditorStore((state) => state.updateBlock);

  return (
    <div className="p-6 rounded-[2rem] bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest">
          <MousePointer2 size={14} />
          Call to Action Button
        </div>

        <div className="flex gap-2">
          {(['left', 'center', 'right'] as const).map((align) => (
            <button
              key={align}
              onClick={() => updateBlock(id, { ...content, alignment: align })}
              className={cn(
                "p-1.5 rounded-md transition-all text-[10px] font-bold uppercase",
                content.alignment === align
                  ? "bg-primary text-white"
                  : "bg-white dark:bg-slate-800 text-slate-400"
              )}
            >
              {align}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-2">Button Text</label>
          <input
            type="text"
            value={content.text}
            onChange={(e) => updateBlock(id, { ...content, text: e.target.value })}
            placeholder="Click here..."
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-2">Target URL</label>
          <div className="relative">
            <LinkIcon size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={content.url}
              onChange={(e) => updateBlock(id, { ...content, url: e.target.value })}
              placeholder="https://..."
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-center p-4 border-t border-slate-100 dark:border-white/5 mt-4">
        <div className={cn(
          "w-full flex",
          content.alignment === 'left' && "justify-start",
          content.alignment === 'center' && "justify-center",
          content.alignment === 'right' && "justify-end"
        )}>
          <button
            className={cn(
              "px-8 py-3 rounded-xl font-bold transition-all",
              content.variant === 'primary' && "bg-primary text-white shadow-lg shadow-primary/25",
              "hover:scale-105 active:scale-95"
            )}
          >
            {content.text || 'Preview Button'}
          </button>
        </div>
      </div>
    </div>
  );
};
