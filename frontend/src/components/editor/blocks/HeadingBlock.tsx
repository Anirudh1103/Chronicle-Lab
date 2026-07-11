import React from 'react';
import { useEditorStore } from '../../../store/useEditorStore';
import { cn } from '../../../utils/cn';
import { RichTextEditor } from '../RichTextEditor';

interface HeadingBlockProps {
  id: string;
  content: {
    level: number;
    text: string;
    subtext?: string;
  };
}

export const HeadingBlock: React.FC<HeadingBlockProps> = ({ id, content }) => {
  const updateBlock = useEditorStore((state) => state.updateBlock);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateBlock(id, { ...content, text: e.target.value });
  };

  const handleLevelChange = (level: number) => {
    updateBlock(id, { ...content, level });
  };

  return (
    <div className="space-y-4 group/heading">
      <div className="flex items-center justify-between">
        <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
          {[1, 2, 3, 4].map((l) => (
            <button
              key={l}
              onClick={() => handleLevelChange(l)}
              className={cn(
                'px-2.5 py-1 text-[10px] font-black rounded-md transition-all',
                content.level === l
                  ? 'bg-white dark:bg-slate-700 shadow-sm text-primary'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              )}
            >
              H{l}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <RichTextEditor
          content={content.text}
          onChange={(html) => updateBlock(id, { ...content, text: html })}
          placeholder={`H${content.level} Heading`}
          className={cn(
            'w-full bg-transparent font-black tracking-tighter leading-tight italic font-editorial',
            content.level === 1 && 'text-5xl md:text-6xl',
            content.level === 2 && 'text-4xl md:text-5xl',
            content.level === 3 && 'text-3xl md:text-4xl',
            content.level === 4 && 'text-2xl md:text-3xl'
          )}
        />

        <RichTextEditor
          content={content.subtext || ''}
          onChange={(html) => updateBlock(id, { ...content, subtext: html })}
          placeholder="Add a subheading or description..."
          className="text-lg md:text-xl text-muted-foreground font-medium border-l-2 border-primary/20 pl-4 py-1"
        />
      </div>
    </div>
  );
};
