import React from 'react';
import { useEditorStore } from '../../../store/useEditorStore';
import { Quote, Globe, BookOpen } from 'lucide-react';
import { RichTextEditor } from '../RichTextEditor';

interface TranslationQuoteBlockProps {
  id: string;
  content: {
    text: string;
    translation: string;
    meaning: string;
    author?: string;
    source?: string;
  };
}

export const TranslationQuoteBlock: React.FC<TranslationQuoteBlockProps> = ({ id, content }) => {
  const updateBlock = useEditorStore((state) => state.updateBlock);

  return (
    <div className="relative p-10 rounded-[2.5rem] bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 group overflow-hidden">
      <Quote className="absolute -top-4 -left-4 text-primary/10 w-32 h-32 -rotate-12 group-hover:rotate-0 transition-transform duration-700" />

      <div className="relative z-10 space-y-8">
        {/* Section Header */}
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-primary/60">
          <Globe size={14} /> Multilingual Translation Quote
        </div>

        {/* 1. Original Quote */}
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Original Quote</label>
          <RichTextEditor
            content={content.text}
            onChange={(html) => updateBlock(id, { ...content, text: html })}
            placeholder="Enter the original quote (e.g. हे हिंदवी स्वराज्य व्हावे...)"
            className="text-2xl md:text-4xl font-sans font-black tracking-tight leading-tight text-slate-900 dark:text-white text-center"
          />
        </div>

        {/* 2. Translation */}
        <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-white/5 max-w-2xl mx-auto">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center justify-center gap-1.5">
            <Globe size={12} /> Translation / Roman Script
          </label>
          <RichTextEditor
            content={content.translation || ''}
            onChange={(html) => updateBlock(id, { ...content, translation: html })}
            placeholder="Enter roman script translation (e.g. He Hindavi Swarajya Vhave...)"
            className="text-xl md:text-2xl font-serif italic text-slate-650 dark:text-slate-300 text-center leading-relaxed"
          />
        </div>

        {/* 3. Meaning */}
        <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-white/5 max-w-2xl mx-auto">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center justify-center gap-1.5">
            <BookOpen size={12} /> Meaning / Explanation
          </label>
          <RichTextEditor
            content={content.meaning || ''}
            onChange={(html) => updateBlock(id, { ...content, meaning: html })}
            placeholder="Explain the meaning (e.g. It is the will of the Divine...)"
            className="text-lg md:text-xl text-slate-500 dark:text-slate-450 text-center font-medium leading-relaxed"
          />
        </div>

        {/* 4. Metadata (Author, Source) */}
        <div className="flex flex-col items-center gap-2 pt-4 border-t border-slate-100 dark:border-white/5 max-w-md mx-auto">
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
