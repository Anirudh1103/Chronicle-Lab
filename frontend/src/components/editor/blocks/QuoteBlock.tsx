import React from 'react';
import { useEditorStore } from '../../../store/useEditorStore';
import { Quote } from 'lucide-react';
import { cn } from '../../../utils/cn';
import { RichTextEditor } from '../RichTextEditor';

interface QuoteBlockProps {
  id: string;
  content: {
    text: string;
    author?: string;
    source?: string;
  };
}

export const QuoteBlock: React.FC<QuoteBlockProps> = ({ id, content }) => {
  const updateBlock = useEditorStore((state) => state.updateBlock);

  return (
    <div className="relative p-10 rounded-[2.5rem] bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 group overflow-hidden">
      <Quote className="absolute -top-4 -left-4 text-primary/10 w-32 h-32 -rotate-12 group-hover:rotate-0 transition-transform duration-700" />

      <div className="relative z-10 space-y-6">
        <RichTextEditor
          content={content.text}
          onChange={(html) => updateBlock(id, { ...content, text: html })}
          placeholder="Enter a powerful quote..."
          className="text-2xl md:text-4xl font-sans font-black tracking-tight leading-tight text-slate-900 dark:text-white text-center"
        />

        <div className="flex flex-col items-center gap-2">
          <div className="h-px w-12 bg-primary/30" />
          <RichTextEditor
            content={content.author || ''}
            onChange={(html) => updateBlock(id, { ...content, author: html })}
            placeholder="Author name"
            className="text-sm font-black uppercase tracking-[0.2em] text-primary text-center"
          />
          <RichTextEditor
            content={content.source || ''}
            onChange={(html) => updateBlock(id, { ...content, source: html })}
            placeholder="Source (optional)"
            className="text-[10px] font-bold uppercase tracking-widest text-slate-400 text-center"
          />
        </div>
      </div>
    </div>
  );
};
