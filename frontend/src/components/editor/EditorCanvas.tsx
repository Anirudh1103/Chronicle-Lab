import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { useEditorStore } from '../../store/useEditorStore';
import { BlockWrapper } from './BlockWrapper';
import { BlockRenderer } from './BlockRenderer';
import { TableOfContents } from './TableOfContents';
import { Plus } from 'lucide-react';
import { BlockType } from '../../types/editor';

export const EditorCanvas: React.FC = () => {
  const { blocks, moveBlock, addBlock } = useEditorStore();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      moveBlock(active.id as string, over.id as string);
    }
  };

  const blockTypes: { type: BlockType; label: string }[] = [
    { type: 'heading', label: 'Heading' },
    { type: 'paragraph', label: 'Text' },
    { type: 'image', label: 'Image' },
    { type: 'code', label: 'Code' },
    { type: 'quote', label: 'Quote' },
    { type: 'table', label: 'Table' },
    { type: 'callout', label: 'Callout' },
    { type: 'faq', label: 'FAQ' },
    { type: 'timeline', label: 'Timeline' },
    { type: 'reference', label: 'Citations' },
  ];

  return (
    <div className="mx-auto max-w-4xl px-12 py-20">
      <TableOfContents blocks={blocks} />

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToVerticalAxis]}
      >
        <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
          {blocks.map((block) => (
            <BlockWrapper
              key={block.id}
              id={block.id}
              type={block.type}
              isCollapsed={block.isCollapsed}
            >
              <BlockRenderer block={block} />
            </BlockWrapper>
          ))}
        </SortableContext>
      </DndContext>

      {/* Add Block Menu */}
      <div className="mt-12 flex flex-col items-center">
        <div className="mb-4 h-px w-full bg-slate-100 dark:bg-slate-800" />
        <div className="flex flex-wrap justify-center gap-2">
          {blockTypes.map((bt) => (
            <button
              key={bt.type}
              onClick={() => addBlock(bt.type)}
              className="group flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition-all hover:border-blue-500 hover:text-blue-500 hover:shadow-md dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400"
            >
              <Plus size={16} className="group-hover:rotate-90 transition-transform" />
              {bt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
