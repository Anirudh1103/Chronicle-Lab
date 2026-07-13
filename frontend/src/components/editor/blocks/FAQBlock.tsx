import React from 'react';
import { useEditorStore } from '../../../store/useEditorStore';
import { Plus, Trash2, HelpCircle } from 'lucide-react';
import { RichTextEditor } from '../RichTextEditor';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQBlockProps {
  id: string;
  content: {
    items: FAQItem[];
  };
}

export const FAQBlock: React.FC<FAQBlockProps> = ({ id, content }) => {
  const updateBlock = useEditorStore((state) => state.updateBlock);

  const updateItem = (index: number, field: keyof FAQItem, value: string) => {
    const newItems = [...content.items];
    newItems[index][field] = value;
    updateBlock(id, { ...content, items: newItems });
  };

  const addItem = () => {
    updateBlock(id, {
      ...content,
      items: [...content.items, { question: '', answer: '' }]
    });
  };

  const removeItem = (index: number) => {
    updateBlock(id, {
      ...content,
      items: content.items.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-slate-800 font-bold text-sm mb-4">
        <HelpCircle size={18} className="text-blue-500" />
        Frequently Asked Questions
      </div>

      <div className="space-y-3">
        {content.items.map((item, index) => (
          <div key={index} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 group relative">
            <button
              onClick={() => removeItem(index)}
              className="absolute top-2 right-2 p-1 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 size={14} />
            </button>
            <RichTextEditor
              content={item.question}
              onChange={(html) => updateItem(index, 'question', html)}
              placeholder="Question..."
              className="w-full bg-transparent font-bold text-slate-700 outline-none placeholder:text-slate-300 mb-2"
            />
            <RichTextEditor
              content={item.answer}
              onChange={(html) => updateItem(index, 'answer', html)}
              placeholder="Answer..."
              className="w-full bg-transparent text-sm text-slate-500 outline-none placeholder:text-slate-200"
            />
          </div>
        ))}
      </div>

      <button
        onClick={addItem}
        className="w-full py-3 border-2 border-dashed border-slate-100 rounded-xl text-slate-400 hover:text-blue-500 hover:border-blue-200 hover:bg-blue-50/30 transition-all flex items-center justify-center gap-2 text-sm font-medium"
      >
        <Plus size={16} /> Add Question
      </button>
    </div>
  );
};
