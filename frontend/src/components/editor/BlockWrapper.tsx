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
  MoreVertical,
  Layers,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useEditorStore } from '../../store/useEditorStore';

interface BlockWrapperProps {
  id: string;
  children: React.ReactNode;
  type: string;
  isCollapsed?: boolean;
}

/**
 * BlockWrapper functional component wrapping individual canvas block elements.
 * Hooks into dnd-kit sortable behavior and provides a rich floating hover toolbar.
 */
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

  const { blocks, setBlocks, removeBlock, duplicateBlock, toggleCollapse } = useEditorStore();

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const moveSibling = (direction: 'up' | 'down') => {
    const currentBlocks = blocks.map(b => ({ ...b }));
    const index = currentBlocks.findIndex(b => b.id === id);
    if (index === -1) return;

    const block = currentBlocks[index];
    const siblings = currentBlocks.filter(b => b.parentId === block.parentId).sort((a, b) => a.orderIndex - b.orderIndex);
    const siblingIdx = siblings.findIndex(b => b.id === id);

    if (direction === 'up' && siblingIdx > 0) {
      const prevSibling = siblings[siblingIdx - 1];
      const temp = block.orderIndex;
      block.orderIndex = prevSibling.orderIndex;
      prevSibling.orderIndex = temp;
      currentBlocks.sort((a, b) => a.orderIndex - b.orderIndex);
      setBlocks(currentBlocks);
    } else if (direction === 'down' && siblingIdx < siblings.length - 1) {
      const nextSibling = siblings[siblingIdx + 1];
      const temp = block.orderIndex;
      block.orderIndex = nextSibling.orderIndex;
      nextSibling.orderIndex = temp;
      currentBlocks.sort((a, b) => a.orderIndex - b.orderIndex);
      setBlocks(currentBlocks);
    }
  };

  return (
    <div
      ref={setNodeRef}
      id={id}
      style={style}
      className={cn(
        'group relative mb-6 rounded-2xl border border-transparent bg-slate-100/30 dark:bg-[#090d16]/10 p-1.5 transition-all hover:border-slate-200 dark:hover:border-slate-900 focus-within:border-blue-400/40 dark:focus-within:border-blue-500/40 focus-within:bg-slate-100/50 dark:focus-within:bg-[#090d16]/25 hover:shadow-lg dark:hover:shadow-2xl duration-300',
        isDragging && 'z-50 border-blue-500/80 opacity-55 shadow-2xl bg-white dark:bg-slate-950/60 scale-[0.99]',
        isCollapsed && 'mb-3'
      )}
    >
      {/* Floating Dark Toolbar above the block */}
      <div className="absolute -top-5 left-4 z-40 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2 py-1 flex items-center gap-1.5 shadow-md dark:shadow-2xl opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-all duration-300 select-none scale-90 group-hover:scale-100 origin-left text-slate-800 dark:text-white">
        {/* Grip Handle */}
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-850 dark:hover:text-slate-100"
          title="Drag block"
        >
          <GripVertical size={13} />
        </div>

        {/* Level Moover arrows */}
        <button
          onClick={() => moveSibling('up')}
          className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-850 dark:hover:text-slate-100 transition-colors border-none cursor-pointer bg-transparent"
          title="Move up"
        >
          <ArrowUp size={12} />
        </button>
        <button
          onClick={() => moveSibling('down')}
          className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-850 dark:hover:text-slate-100 transition-colors border-none cursor-pointer bg-transparent"
          title="Move down"
        >
          <ArrowDown size={12} />
        </button>

        <div className="h-3 w-px bg-slate-200 dark:bg-slate-800 mx-0.5" />

        {/* Label */}
        <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 px-1 font-mono select-none">
          {type}
        </span>

        <div className="h-3 w-px bg-slate-200 dark:bg-slate-800 mx-0.5" />

        {/* Actions */}
        <button
          onClick={() => toggleCollapse(id)}
          className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-850 dark:hover:text-slate-100 transition-colors border-none cursor-pointer bg-transparent"
          title={isCollapsed ? "Expand block" : "Collapse block"}
        >
          {isCollapsed ? <ChevronRight size={13} /> : <ChevronDown size={13} />}
        </button>

        <button
          onClick={() => duplicateBlock(id)}
          className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors border-none cursor-pointer bg-transparent"
          title="Duplicate block"
        >
          <Copy size={12} />
        </button>

        <button
          onClick={() => removeBlock(id)}
          className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-950/60 text-slate-400 hover:text-red-650 dark:hover:text-red-400 transition-colors border-none cursor-pointer bg-transparent"
          title="Delete block"
        >
          <Trash2 size={12} />
        </button>
      </div>

      {/* Content wrapper */}
      <div className={cn('p-2', isCollapsed && 'hidden')}>
        {children}
      </div>

      {isCollapsed && (
        <div className="px-4 py-2 text-xs text-slate-400 dark:text-slate-500 italic truncate font-semibold font-mono">
          Block content collapsed...
        </div>
      )}
    </div>
  );
};
