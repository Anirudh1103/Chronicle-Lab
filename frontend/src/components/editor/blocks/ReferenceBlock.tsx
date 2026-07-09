import React from 'react';
import { useEditorStore } from '../../../store/useEditorStore';
import { Bookmark, Plus, Trash2, Link as LinkIcon } from 'lucide-react';

interface ReferenceItem {
  id: string;
  citation: string;
  url?: string;
}

interface ReferenceBlockProps {
  id: string;
  content: {
    items: ReferenceItem[];
  };
}

export const ReferenceBlock: React.FC<ReferenceBlockProps> = ({ id, content }) => {
  const updateBlock = useEditorStore((state) => state.updateBlock);

  const updateItem = (index: number, field: keyof ReferenceItem, value: string) => {
    const newItems = [...content.items];
    newItems[index] = { ...newItems[index], [field]: value };
    updateBlock(id, { items: newItems });
  };

  const addItem = () => {
    updateBlock(id, {
      items: [...content.items, { id: (content.items.length + 1).toString(), citation: '', url: '' }]
    });
  };

  const removeItem = (index: number) => {
    updateBlock(id, {
      items: content.items.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/50">
      <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm mb-4">
        <Bookmark size={16} className="text-blue-500" />
        References & Citations
      </div>

      <div className="space-y-4">
        {content.items.map((item, index) => (
          <div key={index} className="flex gap-4 group">
            <span className="flex-shrink-0 w-6 h-6 rounded bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-500">
              [{index + 1}]
            </span>
            <div className="flex-1 space-y-2">
              <input
                type="text"
                value={item.citation}
                onChange={(e) => updateItem(index, 'citation', e.target.value)}
                placeholder="Full citation or source name..."
                className="w-full bg-transparent text-sm text-slate-700 dark:text-slate-300 outline-none placeholder:text-slate-400"
              />
              <div className="flex items-center gap-2 text-blue-500">
                <LinkIcon size={12} />
                <input
                  type="text"
                  value={item.url}
                  onChange={(e) => updateItem(index, 'url', e.target.value)}
                  placeholder="https://source-link.com"
                  className="flex-1 bg-transparent text-[11px] outline-none placeholder:text-blue-500/30"
                />
              </div>
            </div>
            <button
              onClick={() => removeItem(index)}
              className="p-1 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={addItem}
        className="mt-6 w-full py-2 border border-dashed border-slate-300 rounded-lg text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-blue-500 hover:border-blue-200 transition-all"
      >
        + Add Source
      </button>
    </div>
  );
};
