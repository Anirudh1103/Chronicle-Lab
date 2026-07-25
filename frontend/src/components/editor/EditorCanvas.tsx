import React, { useState, useEffect, useMemo } from 'react';
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
import { Plus, Upload, Sparkles, BookOpen, Settings, Trash2, Copy, ChevronRight, ChevronDown, MoveUp, MoveDown, BookPlus, FolderPlus } from 'lucide-react';
import { BlockType, EditorBlock, BlockTypes } from '../../types/editor';
import api from '../../api/client';
import { cn } from '../../utils/cn';
import { getUploadUrl } from '../../utils/url';
import { AnimatePresence, motion } from 'framer-motion';
import { buildHierarchyTree, flattenHierarchyTree, validateHierarchy, generateSlug } from '../../utils/hierarchy';
import { v4 as uuidv4 } from 'uuid';

interface EditorCanvasProps {
  activeSubId: string | null;
  setActiveSubId: (id: string | null) => void;
}

/**
 * EditorCanvas functional component representing the interactive, drag-and-drop workspace layout.
 * Houses device size viewports and renders the active subheading nodes list.
 */
export const EditorCanvas: React.FC<EditorCanvasProps> = ({
  activeSubId,
  setActiveSubId
}) => {
  const { blocks, moveBlock, addBlock, updateBlock, removeBlock, duplicateBlock, setBlocks } = useEditorStore();
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const parts = useMemo(() => buildHierarchyTree(blocks), [blocks]);
  const hasParts = parts.length > 0;

  // Auto-select first subheading on load if parts exist
  useEffect(() => {
    if (hasParts && !activeSubId) {
      const firstPart = parts[0];
      if (firstPart.chapters.length > 0) {
        const firstChap = firstPart.chapters[0];
        if (firstChap.headings.length > 0) {
          const firstHead = firstChap.headings[0];
          if (firstHead.subheadings.length > 0) {
            setActiveSubId(firstHead.subheadings[0].id);
          }
        }
      }
    }
  }, [hasParts, parts, activeSubId, setActiveSubId]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      moveBlock(active.id as string, over.id as string);
    }
  };

  const handleFileDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(false);

    const targetSubId = activeSubId;

    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(f => f.type.startsWith('image/'));

    if (imageFiles.length > 0) {
      setIsUploading(true);
      try {
        for (const file of imageFiles) {
          const formData = new FormData();
          formData.append('file', file);
          const { data } = await api.post('/media/upload', formData);
          const url = getUploadUrl(data.path);

          handleAddBlock(BlockTypes.IMAGE, {
            url,
            alt: file.name,
            caption: '',
            alignment: 'center'
          }, targetSubId || undefined);
        }
      } catch (error) {
        console.error('File upload failed:', error);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleAddBlock = (type: BlockType, content?: any, parentId?: string) => {
    const id = addBlock(type, undefined, content, parentId || activeSubId || undefined);
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        const focusable = el.querySelector('input, textarea, [contenteditable="true"]') as HTMLElement;
        if (focusable) focusable.focus();
      }
    }, 100);
  };

  const getBreadcrumbs = () => {
    if (!activeSubId) return null;
    for (const part of parts) {
      for (const chap of part.chapters) {
        for (const head of chap.headings) {
          for (const sub of head.subheadings) {
            if (sub.id === activeSubId) {
              return (
                <div className="flex flex-wrap items-center gap-2.5 text-[9px] font-black tracking-widest text-slate-500 dark:text-slate-400 uppercase bg-slate-100 border border-slate-200 dark:bg-[#090d16] dark:border-slate-900 rounded-full px-4 py-2 mb-8 select-none max-w-max">
                  <span className="text-orange-600 dark:text-orange-500 font-bold hover:opacity-80 cursor-pointer">{part.title}</span>
                  <span className="text-slate-350 dark:text-slate-700">/</span>
                  <span className="text-blue-600 dark:text-blue-400 font-bold hover:opacity-80 cursor-pointer">Chapter {chap.chapterNumber}: {chap.title}</span>
                  <span className="text-slate-355 dark:text-slate-700">/</span>
                  <span className="text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white cursor-pointer">{head.title}</span>
                  <span className="text-slate-355 dark:text-slate-700">/</span>
                  <span className="text-slate-800 dark:text-white bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-2 py-0.5 rounded-full">{sub.title}</span>
                </div>
              );
            }
          }
        }
      }
    }
    return null;
  };

  const activeContentBlocks = blocks.filter(b => b.parentId === activeSubId).sort((a, b) => a.orderIndex - b.orderIndex);
  const activeSubBlock = blocks.find(b => b.id === activeSubId);

  const blockTypes: { type: BlockType; label: string }[] = [
    { type: BlockTypes.PARAGRAPH, label: 'Text' },
    { type: BlockTypes.IMAGE, label: 'Image' },
    { type: BlockTypes.GALLERY, label: 'Gallery' },
    { type: BlockTypes.TABLE, label: 'Table' },
    { type: BlockTypes.CODE, label: 'Code' },
    { type: BlockTypes.QUOTE, label: 'Quote' },
    { type: BlockTypes.TRANSLATION_QUOTE, label: 'Translation' },
    { type: BlockTypes.CALLOUT, label: 'Callout' },
    { type: BlockTypes.TIMELINE, label: 'Timeline' },
    { type: BlockTypes.REFERENCE, label: 'Citations' },
    { type: BlockTypes.LIST, label: 'List' },
    { type: BlockTypes.KEY_INSIGHT, label: 'Key Insight' },
    { type: BlockTypes.DIVIDER, label: 'Divider' },
    { type: BlockTypes.VIDEO, label: 'Video' },
    { type: BlockTypes.BUTTON, label: 'Button' },
    { type: BlockTypes.PERSONAL_TOUCH, label: 'Personal Touch' },
    { type: BlockTypes.SUMMARY, label: 'Summary' },
  ];

  return (
    <div
      className="w-full min-h-[70vh] relative select-text"
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
            className="absolute inset-0 z-50 bg-blue-500/10 backdrop-blur-[2px] border-4 border-dashed border-blue-500/80 m-2 rounded-[2rem] flex flex-col items-center justify-center pointer-events-none"
          >
            <Upload size={48} className="text-blue-500 animate-bounce mb-4" />
            <p className="text-xl font-black text-blue-500 uppercase tracking-tighter">Drop images to add blocks</p>
          </motion.div>
        )}

        {isUploading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[70] bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 text-slate-800 dark:text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 font-bold text-xs uppercase tracking-wider"
          >
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 dark:border-white border-t-transparent" />
            Processing Assets...
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. LEGACY FLAT POST OR NO PARTS DEFINED */}
      {!hasParts && (
        <div className="mx-auto max-w-4xl">
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

          {/* Simple flat block adding menu */}
          <div className="mt-12 flex flex-col items-center">
            <div className="mb-4 h-px w-full bg-slate-200 dark:bg-slate-900" />
            <div className="flex flex-wrap justify-center gap-2">
              {blockTypes.map((bt) => (
                <button
                  key={bt.type}
                  onClick={() => handleAddBlock(bt.type)}
                  className="group flex items-center gap-2 rounded-full border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 dark:border-slate-900 dark:bg-[#090d16]/30 dark:text-slate-400 px-4 py-2 text-xs font-semibold transition-all dark:hover:border-blue-500 dark:hover:text-white dark:hover:bg-slate-900"
                >
                  <Plus size={12} className="group-hover:rotate-90 transition-transform" />
                  {bt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. CHRONICLE HIERARCHICAL EDITOR WORKSPACE */}
      {hasParts && (
        <div className="w-full flex flex-col">
          {getBreadcrumbs()}

          {activeSubId && activeSubBlock ? (
            <>
              {/* Active Subheading Title & Subtext description */}
              <div className="mb-8 group/title select-text">
                <input
                  type="text"
                  value={activeSubBlock.content.title || ''}
                  onChange={(e) => updateBlock(activeSubBlock.id, { ...activeSubBlock.content, title: e.target.value })}
                  className="w-full bg-transparent border-none text-4xl md:text-5xl font-black text-slate-800 dark:text-slate-100 placeholder:text-slate-300 dark:placeholder:text-slate-800 outline-none p-0 focus:ring-0 leading-tight tracking-tighter"
                  placeholder="Subheading Title"
                />
                <textarea
                  value={activeSubBlock.content.description || ''}
                  onChange={(e) => updateBlock(activeSubBlock.id, { ...activeSubBlock.content, description: e.target.value })}
                  rows={2}
                  className="w-full bg-transparent border-none text-base text-slate-500 dark:text-slate-400 placeholder:text-slate-350 dark:placeholder:text-slate-800 outline-none p-0 mt-3 focus:ring-0 resize-none font-medium italic leading-relaxed"
                  placeholder="To understand a leader, one must first understand the land that shaped his spirit..."
                />
                <div className="mt-6 h-px w-full bg-slate-200 dark:bg-slate-900/60" />
              </div>

              {/* Subheading Blocks Dnd canvas */}
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
                modifiers={[restrictToVerticalAxis]}
              >
                <SortableContext items={activeContentBlocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
                  {activeContentBlocks.length > 0 ? (
                    activeContentBlocks.map((block) => (
                      <BlockWrapper
                        key={block.id}
                        id={block.id}
                        type={block.type}
                        isCollapsed={block.isCollapsed}
                      >
                        <BlockRenderer block={block} />
                      </BlockWrapper>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center p-16 border-2 border-dashed border-slate-200 dark:border-slate-900 rounded-2xl text-slate-400 dark:text-slate-500 mb-6 bg-slate-100/30 dark:bg-slate-950/10">
                      <Sparkles size={24} className="opacity-40 animate-pulse mb-3 text-orange-600 dark:text-orange-500" />
                      <span className="font-bold text-[10px] uppercase tracking-wider text-slate-700 dark:text-slate-400">Empty Content Section</span>
                      <span className="text-[10px] mt-1 opacity-60 text-center max-w-xs leading-normal">Drag or select block types from the left explorer menu to write content in this section.</span>
                    </div>
                  )}
                </SortableContext>
              </DndContext>

              {/* Toolbar */}
              <div className="mt-8 flex flex-col items-center">
                <div className="mb-4 h-px w-full bg-slate-200 dark:bg-slate-900/60" />
                <div className="flex flex-wrap justify-center gap-1.5">
                  {blockTypes.map((bt) => (
                    <button
                      key={bt.type}
                      onClick={() => handleAddBlock(bt.type)}
                      className="group flex items-center gap-1.5 rounded-full border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 dark:border-slate-900 dark:bg-[#090d16]/30 dark:text-slate-450 dark:hover:border-blue-500 dark:hover:text-white dark:hover:bg-slate-900 transition-all px-3 py-1.5 text-[10px] font-bold"
                    >
                      <Plus size={10} className="group-hover:rotate-90 transition-transform" />
                      {bt.label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-slate-400 dark:text-slate-500">
              <BookOpen size={48} className="opacity-30 mb-4 text-blue-500" />
              <span className="font-bold text-xs uppercase tracking-wider text-slate-650 dark:text-slate-450">Select a section</span>
              <span className="text-[11px] mt-1 text-slate-500 max-w-xs text-center leading-normal">
                Click on any subheading in the Book Navigator outline under the Settings panel to start adding and editing content blocks.
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
