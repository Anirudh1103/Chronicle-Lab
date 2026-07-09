import React from 'react';
import { useEditorStore } from '../../../store/useEditorStore';
import { Info, AlertTriangle, CheckCircle, XCircle, Lightbulb } from 'lucide-react';
import { cn } from '../../../utils/cn';

interface CalloutBlockProps {
  id: string;
  content: {
    type: 'info' | 'warning' | 'success' | 'error' | 'tip';
    text: string;
  };
}

const CALLOUT_TYPES = [
  { id: 'info', icon: Info, color: 'bg-blue-50 text-blue-800 border-blue-200' },
  { id: 'warning', icon: AlertTriangle, color: 'bg-amber-50 text-amber-800 border-amber-200' },
  { id: 'success', icon: CheckCircle, color: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  { id: 'error', icon: XCircle, color: 'bg-red-50 text-red-800 border-red-200' },
  { id: 'tip', icon: Lightbulb, color: 'bg-purple-50 text-purple-800 border-purple-200' },
] as const;

export const CalloutBlock: React.FC<CalloutBlockProps> = ({ id, content }) => {
  const updateBlock = useEditorStore((state) => state.updateBlock);
  const activeType = CALLOUT_TYPES.find(t => t.id === content.type) || CALLOUT_TYPES[0];

  return (
    <div className={cn(
      "flex gap-4 p-4 rounded-xl border transition-all",
      activeType.color
    )}>
      <div className="flex flex-col gap-2 pt-1">
        <activeType.icon size={20} />
      </div>

      <div className="flex-1 space-y-4">
        <div className="flex gap-1 overflow-x-auto pb-2">
          {CALLOUT_TYPES.map((t) => (
            <button
              key={t.id}
              onClick={() => updateBlock(id, { ...content, type: t.id })}
              className={cn(
                "px-2 py-0.5 text-[9px] font-black uppercase rounded border transition-all",
                content.type === t.id
                  ? "bg-white border-transparent shadow-sm"
                  : "bg-transparent border-black/5 opacity-50 hover:opacity-100"
              )}
            >
              {t.id}
            </button>
          ))}
        </div>
        <textarea
          value={content.text}
          onChange={(e) => updateBlock(id, { ...content, text: e.target.value })}
          placeholder="Type your callout message here..."
          className="w-full bg-transparent border-none outline-none focus:ring-0 p-0 text-sm font-medium placeholder:text-current/30 resize-none"
          rows={2}
        />
      </div>
    </div>
  );
};
