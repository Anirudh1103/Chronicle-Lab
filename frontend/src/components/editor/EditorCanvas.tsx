import React, { useState } from 'react';
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
import { Plus, Upload } from 'lucide-react';
import { BlockType } from '../../types/editor';
import api from '../../api/client';
import { cn } from '../../utils/cn';
import { AnimatePresence, motion } from 'framer-motion';

export const EditorCanvas: React.FC = () => {
  const { blocks, moveBlock, addBlock } = useEditorStore();
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

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

  const handleFileDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(false);

    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(f => f.type.startsWith('image/'));

    if (imageFiles.length > 0) {
      setIsUploading(true);
      try {
        for (const file of imageFiles) {
          const formData = new FormData();
          formData.append('file', file);
          const { data } = await api.post('/media/upload', formData);
          const url = `http://localhost:5000/uploads/${data.path}`;

          addBlock('image', undefined, {
            url,
            alt: file.name,
            caption: '',
            alignment: 'center'
          });
        }
      } catch (error) {
        console.error('File upload failed:', error);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const blockTypes: { type: BlockType; label: string }[] = [
    { type: 'heading', label: 'Heading' },
    { type: 'subheading', label: 'Sub Heading' },
    { type: 'paragraph', label: 'Text' },
    { type: 'summary', label: 'Summary' },
    { type: 'image', label: 'Image' },
    { type: 'code', label: 'Code' },
    { type: 'quote', label: 'Quote' },
    { type: 'translationQuote', label: 'Translation Quote' },
    { type: 'table', label: 'Table' },
    { type: 'callout', label: 'Callout' },
    { type: 'timeline', label: 'Timeline' },
    { type: 'reference', label: 'Citations' },
    { type: 'list', label: 'List' },
    { type: 'gallery', label: 'Gallery' },
    { type: 'keyInsight', label: 'Key Insight' },
    { type: 'divider', label: 'Divider' },
    { type: 'video', label: 'Video' },
    { type: 'button', label: 'Button' },
    { type: 'personalTouch', label: 'Personal Touch' },
  ];

  return (
    <div
      className="mx-auto max-w-4xl px-12 py-20 min-h-[50vh] relative"
      onDragOver={(e) => {
        if (e.dataTransfer.types.includes('Files')) {
          e.preventDefault();
          setIsDraggingFile(true);
        }
      }}
      onDragLeave={() => setIsDraggingFile(false)}
      onDrop={handleFileDrop}
    >
      <AnimatePresence>
        {isDraggingFile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-blue-500/10 backdrop-blur-[2px] border-4 border-dashed border-blue-500 m-4 rounded-[2rem] flex flex-col items-center justify-center pointer-events-none"
          >
            <Upload size={48} className="text-blue-500 animate-bounce mb-4" />
            <p className="text-xl font-black text-blue-600 uppercase tracking-tighter">Drop images to add blocks</p>
          </motion.div>
        )}

        {isUploading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[70] bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 font-bold"
          >
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Processing Media Assets...
          </motion.div>
        )}
      </AnimatePresence>

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
