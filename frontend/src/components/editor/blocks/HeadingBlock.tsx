import React from 'react';
import { useEditorStore } from '../../../store/useEditorStore';
import { cn } from '../../../utils/cn';

interface HeadingBlockProps {
  id: string;
  content: {
    level: number;
    text: string;
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

  const getHeadingClass = (level: number) => {
    switch (level) {
      case 1: return 'text-4xl font-black';
      case 2: return 'text-3xl font-bold';
      case 3: return 'text-2xl font-bold';
      case 4: return 'text-xl font-semibold';
      default: return 'text-lg font-semibold';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {[1, 2, 3, 4].map((l) => (
          <button
            key={l}
            onClick={() => handleLevelChange(l)}
            className={cn(
              'px-2 py-1 text-xs rounded border transition-colors',
              content.level === l
                ? 'bg-blue-500 border-blue-500 text-white'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            )}
          >
            H{l}
          </button>
        ))}
      </div>
      <input
        type="text"
        value={content.text}
        onChange={handleChange}
        placeholder={`H${content.level} Heading`}
        className={cn(
          'w-full bg-transparent border-none outline-none focus:ring-0 p-0 placeholder:text-slate-300',
          getHeadingClass(content.level)
        )}
      />
    </div>
  );
};
