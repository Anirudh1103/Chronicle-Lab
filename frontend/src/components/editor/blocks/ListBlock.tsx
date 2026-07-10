import React from 'react';
import { useEditorStore } from '../../../store/useEditorStore';
import { List, ListOrdered, Plus, Trash2 } from 'lucide-react';
import { cn } from '../../../utils/cn';

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
    if (content.items.length <= 1) return;
    updateBlock(id, { ...content, items: content.items.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button
          onClick={() => updateBlock(id, { ...content, type: 'bullet' })}
          className={cn(
            "p-2 rounded-lg transition-colors",
            content.type === 'bullet' ? "bg-primary text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
          )}
        >
          <List size={16} />
        </button>
        <button
          onClick={() => updateBlock(id, { ...content, type: 'number' })}
          className={cn(
            "p-2 rounded-lg transition-colors",
            content.type === 'number' ? "bg-primary text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
          )}
        >
          <ListOrdered size={16} />
        </button>
      </div>

      <div className="space-y-2">
        {content.items.map((item, index) => (
          <div key={index} className="flex items-start gap-3 group">
            <span className="mt-3 w-6 text-sm font-bold text-slate-400 text-right">
              {content.type === 'bullet' ? '•' : `${index + 1}.`}
            </span>
            <input
              type="text"
              value={item}
              onChange={(e) => updateItem(index, e.target.value)}
              placeholder="List item..."
              className="flex-1 py-2 bg-transparent outline-none border-b border-transparent focus:border-primary/20 transition-colors"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addItem();
                }
                if (e.key === 'Backspace' && item === '' && content.items.length > 1) {
                  e.preventDefault();
                  removeItem(index);
                }
              }}
            />
            <button
              onClick={() => removeItem(index)}
              className="mt-2 p-1 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={addItem}
        className="flex items-center gap-2 text-xs font-bold uppercase text-slate-400 hover:text-primary transition-colors ml-9"
      >
        <Plus size={14} /> Add Item
      </button>
    </div>
  );
};
