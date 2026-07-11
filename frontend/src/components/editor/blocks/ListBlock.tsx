import React from 'react';
import { useEditorStore } from '../../../store/useEditorStore';
import { List, ListOrdered, Plus, Trash2 } from 'lucide-react';
import { cn } from '../../../utils/cn';
import { RichTextEditor } from '../RichTextEditor';

interface ListBlockProps {
  id: string;
  content: {
    type: 'bullet' | 'number';
    items: string[];
  };
}

export const ListBlock: React.FC<ListBlockProps> = ({ id, content }) => {
  const updateBlock = useEditorStore((state) => state.updateBlock);

  const updateItem = (index: number, value: string) => {
    const newItems = [...content.items];
    newItems[index] = value;
    updateBlock(id, { ...content, items: newItems });
  };

  const addItem = () => {
    updateBlock(id, { ...content, items: [...content.items, ''] });
  };

  const removeItem = (index: number) => {
    if (content.items.length <= 1) {
      updateItem(0, '');
      return;
    }
    updateBlock(id, { ...content, items: content.items.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-4 py-4">
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => updateBlock(id, { ...content, type: 'bullet' })}
          className={cn(
            "p-2.5 rounded-xl transition-all",
            content.type === 'bullet'
              ? "bg-primary text-white shadow-lg shadow-primary/20"
              : "bg-slate-50 dark:bg-slate-900/50 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          )}
        >
          <List size={18} />
        </button>
        <button
          onClick={() => updateBlock(id, { ...content, type: 'number' })}
          className={cn(
            "p-2.5 rounded-xl transition-all",
            content.type === 'number'
              ? "bg-primary text-white shadow-lg shadow-primary/20"
              : "bg-slate-50 dark:bg-slate-900/50 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          )}
        >
          <ListOrdered size={18} />
        </button>
      </div>

      <div className="space-y-3">
        {content.items.map((item, index) => (
          <div key={index} className="flex items-start gap-4 group/item">
            <div className="mt-2.5 w-6 flex-shrink-0 flex justify-end">
               <span className="text-sm font-black text-primary/40 group-hover/item:text-primary transition-colors">
                {content.type === 'bullet' ? '•' : `${index + 1}.`}
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <RichTextEditor
                content={item}
                onChange={(html) => updateItem(index, html)}
                placeholder="Enter list item..."
                className="text-base md:text-lg font-medium leading-relaxed py-1"
              />
            </div>

            <button
              onClick={() => removeItem(index)}
              className="mt-2 p-2 text-slate-300 hover:text-red-500 opacity-0 group-hover/item:opacity-100 transition-all hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={addItem}
        className="flex items-center gap-2 px-4 py-2 mt-4 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all ml-10"
      >
        <Plus size={16} /> Add Next Point
      </button>
    </div>
  );
};
