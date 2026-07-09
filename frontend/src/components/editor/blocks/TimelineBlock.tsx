import React from 'react';
import { useEditorStore } from '../../../store/useEditorStore';
import { Plus, Trash2, Calendar } from 'lucide-react';

interface TimelineItem {
  date: string;
  title: string;
  description: string;
}

interface TimelineBlockProps {
  id: string;
  content: {
    items: TimelineItem[];
  };
}

export const TimelineBlock: React.FC<TimelineBlockProps> = ({ id, content }) => {
  const updateBlock = useEditorStore((state) => state.updateBlock);

  const updateItem = (index: number, field: keyof TimelineItem, value: string) => {
    const newItems = [...content.items];
    newItems[index][field] = value;
    updateBlock(id, { items: newItems });
  };

  const addItem = () => {
    updateBlock(id, {
      items: [...content.items, { date: '', title: '', description: '' }]
    });
  };

  const removeItem = (index: number) => {
    updateBlock(id, {
      items: content.items.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="space-y-6 px-4">
      <div className="relative space-y-8 before:absolute before:inset-0 before:left-2.5 before:h-full before:w-0.5 before:bg-slate-100 dark:before:bg-slate-800">
        {content.items.map((item, index) => (
          <div key={index} className="relative pl-10 group">
            {/* Timeline Dot */}
            <div className="absolute left-0 top-1.5 h-6 w-6 rounded-full border-4 border-white bg-blue-500 shadow-sm dark:border-slate-900" />

            <button
              onClick={() => removeItem(index)}
              className="absolute -right-2 top-0 p-1 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 size={14} />
            </button>

            <div className="space-y-2">
              <input
                type="text"
                value={item.date}
                onChange={(e) => updateItem(index, 'date', e.target.value)}
                placeholder="Date (e.g. June 2024)"
                className="text-xs font-bold text-blue-600 uppercase tracking-wider bg-transparent outline-none placeholder:text-blue-200"
              />
              <input
                type="text"
                value={item.title}
                onChange={(e) => updateItem(index, 'title', e.target.value)}
                placeholder="Event Title"
                className="w-full text-lg font-bold text-slate-800 dark:text-slate-100 bg-transparent outline-none placeholder:text-slate-200"
              />
              <textarea
                value={item.description}
                onChange={(e) => updateItem(index, 'description', e.target.value)}
                placeholder="Description of the event..."
                className="w-full text-sm text-slate-500 bg-transparent outline-none placeholder:text-slate-200 resize-none"
                rows={2}
              />
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={addItem}
        className="ml-10 px-4 py-2 text-xs font-bold uppercase text-slate-400 hover:text-blue-500 border border-slate-200 border-dashed rounded-lg transition-colors flex items-center gap-2"
      >
        <Plus size={14} /> Add Timeline Event
      </button>
    </div>
  );
};
