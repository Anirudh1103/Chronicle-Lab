import React from 'react';
import { useEditorStore } from '../../../store/useEditorStore';
import { BookOpen, Sparkles } from 'lucide-react';
import { RichTextEditor } from '../RichTextEditor';

interface SummaryBlockProps {
  id: string;
  content: {
    title?: string;
    text: string;
  };
}

export const SummaryBlock: React.FC<SummaryBlockProps> = ({ id, content }) => {
  const updateBlock = useEditorStore((state) => state.updateBlock);

  return (
    <div className="p-8 md:p-10 rounded-[2.5rem] bg-gradient-to-br from-primary/5 via-slate-50/50 to-primary/5 dark:from-primary/10 dark:via-slate-900/30 dark:to-primary/10 border border-primary/10 dark:border-white/5 relative overflow-hidden shadow-sm">
       <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
         <Sparkles size={120} className="text-primary" />
       </div>

        <div className="flex items-center gap-3 mb-6 select-none relative z-10">
          <div className="p-2.5 rounded-2xl bg-primary/10 text-primary">
            <BookOpen size={20} />
          </div>
          <div className="flex-1">
            <input
              type="text"
              value={content.title === undefined ? 'Quick Read' : content.title}
              onChange={(e) => updateBlock(id, { ...content, title: e.target.value })}
              placeholder="Quick Read"
              className="bg-transparent border-none outline-none text-lg font-sans font-black uppercase tracking-widest text-slate-900 dark:text-white placeholder:text-slate-350 w-full"
            />
          </div>
        </div>

       <div className="prose prose-slate max-w-none dark:prose-invert relative z-10">
         <RichTextEditor
           content={content.text}
           onChange={(html) => updateBlock(id, { ...content, text: html })}
           placeholder="Write a quick summary or key bullet points of the post..."
         />
       </div>
    </div>
  );
};
