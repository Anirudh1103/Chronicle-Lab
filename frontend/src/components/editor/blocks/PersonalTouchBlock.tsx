import React from 'react';
import { useEditorStore } from '../../../store/useEditorStore';
import { Sparkles } from 'lucide-react';
import { RichTextEditor } from '../RichTextEditor';

interface PersonalTouchBlockProps {
  id: string;
  content: {
    text: string;
  };
}

export const PersonalTouchBlock: React.FC<PersonalTouchBlockProps> = ({ id, content }) => {
  const updateBlock = useEditorStore((state) => state.updateBlock);

  return (
    <div className="relative my-8 group">
      <div className="relative p-6 rounded-3xl bg-slate-900 border border-white/10 overflow-hidden shadow-xl">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={14} className="text-primary" />
          <span className="text-[9px] font-black uppercase tracking-[0.3em] text-primary">Personal Insight</span>
        </div>

        <RichTextEditor
          content={content.text}
          onChange={(html) => updateBlock(id, { ...content, text: html })}
          placeholder="Share your personal touch here..."
          className="text-sm md:text-base font-medium leading-relaxed text-slate-300 bg-transparent italic"
        />
      </div>
    </div>
  );
};
