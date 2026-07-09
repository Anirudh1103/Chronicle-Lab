import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  GripVertical,
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  ChevronRight,
  MoreVertical
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useEditorStore } from '../../store/useEditorStore';

interface BlockWrapperProps {
  id: string;
  children: React.ReactNode;
  type: string;
  isCollapsed?: boolean;
}

export const BlockWrapper: React.FC<BlockWrapperProps> = ({
  id,
  children,
  type,
  isCollapsed
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id });

  const { removeBlock, duplicateBlock, toggleCollapse } = useEditorStore();

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      id={id}
      style={style}
      className={cn(
        'group relative mb-4 rounded-xl border border-transparent bg-white/50 transition-all hover:border-slate-200 hover:shadow-sm dark:bg-slate-900/50 dark:hover:border-slate-700',
        isDragging && 'z-50 border-blue-500 opacity-50 shadow-xl',
        isCollapsed && 'mb-2'
      )}
    >
      {/* Drag Handle & Controls */}
      <div className="absolute -left-12 top-2 flex flex-col items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
        >
          <GripVertical size={18} />
        </div>
        <button
          onClick={() => toggleCollapse(id)}
          className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronDown size={18} />}
        </button>
      </div>

      {/* Block Type Label & Actions */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-transparent group-hover:border-slate-100 dark:group-hover:border-slate-800">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          {type}
        </span>

        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100">
          <button
            onClick={() => duplicateBlock(id)}
            className="p-1 text-slate-400 hover:text-blue-500"
            title="Duplicate"
          >
            <Copy size={14} />
          </button>
          <button
            onClick={() => removeBlock(id)}
            className="p-1 text-slate-400 hover:text-red-500"
            title="Delete"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className={cn('p-4', isCollapsed && 'hidden')}>
        {children}
      </div>

      {isCollapsed && (
        <div className="px-4 py-2 text-sm text-slate-400 italic truncate">
          Block content hidden...
        </div>
      )}
    </div>
  );
};
