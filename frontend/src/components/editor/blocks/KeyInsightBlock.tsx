import React from 'react';
import { useEditorStore } from '../../../store/useEditorStore';
import { Sparkles, Trash2 } from 'lucide-react';
import { RichTextEditor } from '../RichTextEditor';

interface KeyInsightBlockProps {
  id: string;
  content: {
    title: string;
    points: string[];
  };
}

export const KeyInsightBlock: React.FC<KeyInsightBlockProps> = ({ id, content }) => {
  const updateBlock = useEditorStore((state) => state.updateBlock);

  const updatePoint = (index: number, value: string) => {
    const newPoints = [...content.points];
    newPoints[index] = value;
    updateBlock(id, { ...content, points: newPoints });
  };

  const addPoint = () => {
    updateBlock(id, { ...content, points: [...content.points, ''] });
  };

  const removePoint = (index: number) => {
    if (content.points.length <= 1) return;
    updateBlock(id, { ...content, points: content.points.filter((_, i) => i !== index) });
  };

  return (
    <div className="p-8 md:p-12 rounded-[3rem] bg-primary/[0.03] border border-primary/10 relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-6 opacity-10">
        <Sparkles size={120} className="text-primary" />
      </div>

      <div className="relative z-10 space-y-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-xl text-primary">
            <Sparkles size={20} />
          </div>
          <input
            type="text"
            value={content.title}
            onChange={(e) => updateBlock(id, { ...content, title: e.target.value })}
            placeholder="Key Insight Title"
            className="bg-transparent border-none outline-none text-xl font-black uppercase tracking-widest text-slate-900 dark:text-white placeholder:text-slate-300 w-full"
          />
        </div>

        <div className="space-y-4">
          {content.points.map((point, index) => (
            <div key={index} className="flex items-start gap-4 group/point">
              <span className="mt-3 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-black flex-shrink-0">
                {index + 1}
              </span>
              <RichTextEditor
                content={point}
                onChange={(html) => updatePoint(index, html)}
                placeholder="Share a key takeaway..."
                className="flex-1 text-lg font-medium text-slate-600 dark:text-slate-400"
              />
              <button
                onClick={() => removePoint(index)}
                className="mt-2 p-1 text-slate-300 hover:text-red-500 opacity-0 group-point/hover:opacity-100 transition-opacity"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={addPoint}
          className="ml-10 text-xs font-black uppercase tracking-widest text-primary/60 hover:text-primary transition-colors"
        >
          + Add Insight Point
        </button>
      </div>
    </div>
  );
};
