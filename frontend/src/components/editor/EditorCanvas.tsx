import React, { useState, useEffect } from 'react';
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
import { buildHierarchyTree, flattenHierarchyTree, validateHierarchy, generateSlug, PartNode, ChapterNode, HeadingNode, SubheadingNode } from '../../utils/hierarchy';
import { v4 as uuidv4 } from 'uuid';

export const EditorCanvas: React.FC = () => {
  const { blocks, moveBlock, addBlock, updateBlock, removeBlock, duplicateBlock, setBlocks } = useEditorStore();
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Tree states
  const [activeSubId, setActiveSubId] = useState<string | null>(null);
  const [editingMetadataId, setEditingMetadataId] = useState<string | null>(null);
  const [expandedParts, setExpandedParts] = useState<Record<string, boolean>>({});
  const [expandedChapters, setExpandedChapters] = useState<Record<string, boolean>>({});

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const parts = buildHierarchyTree(blocks);
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
  }, [hasParts, parts, activeSubId]);

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
          const url = getUploadUrl(data.path);

          addBlock(BlockTypes.IMAGE, undefined, {
            url,
            alt: file.name,
            caption: '',
            alignment: 'center'
          }, activeSubId || undefined);
        }
      } catch (error) {
        console.error('File upload failed:', error);
      } finally {
        setIsUploading(false);
      }
    }
  };

  // Convert legacy flat blocks to nested hierarchy structure
  const initializeHierarchy = () => {
    const partId = uuidv4();
    const chapId = uuidv4();
    const headId = uuidv4();
    const subId = uuidv4();

    const newPart: EditorBlock = {
      id: partId,
      type: BlockTypes.PART,
      content: { title: 'Part I: Background', slug: 'part-i-background', description: '' },
      orderIndex: 0
    };

    const newChapter: EditorBlock = {
      id: chapId,
      type: BlockTypes.CHAPTER,
      content: { title: 'Chapter 1: Origins', slug: 'chapter-1-origins', description: '' },
      orderIndex: 0,
      parentId: partId
    };

    const newHeading: EditorBlock = {
      id: headId,
      type: BlockTypes.HEADING,
      content: { title: 'Section Overview', slug: 'section-overview', description: '' },
      orderIndex: 0,
      parentId: chapId
    };

    const newSubheading: EditorBlock = {
      id: subId,
      type: BlockTypes.SUBHEADING,
      content: { title: 'Introduction & Context', slug: 'introduction-context', description: '' },
      orderIndex: 0,
      parentId: headId
    };

    // Nest all existing blocks under the default subheading
    const nestedExistingBlocks = blocks.map((b, idx) => ({
      ...b,
      parentId: subId,
      orderIndex: idx
    }));

    setBlocks([newPart, newChapter, newHeading, newSubheading, ...nestedExistingBlocks]);
    setActiveSubId(subId);
  };

  // Add structural nodes
  const addPartNode = () => {
    const id = addBlock(BlockTypes.PART, undefined, {
      title: 'New Part',
      slug: `part-new-part`,
      description: '',
      metadata: {}
    });
    setExpandedParts(prev => ({ ...prev, [id]: true }));
  };

  const addChapterNode = (partId: string) => {
    const id = addBlock(BlockTypes.CHAPTER, undefined, {
      title: 'New Chapter',
      slug: `chapter-new-chapter`,
      description: '',
      metadata: {}
    }, partId);
    setExpandedChapters(prev => ({ ...prev, [id]: true }));
    setExpandedParts(prev => ({ ...prev, [partId]: true }));
  };

  const addHeadingNode = (chapterId: string) => {
    addBlock(BlockTypes.HEADING, undefined, {
      title: 'New Heading',
      slug: `heading-new-heading`,
      description: '',
      metadata: {}
    }, chapterId);
    setExpandedChapters(prev => ({ ...prev, [chapterId]: true }));
  };

  const addSubheadingNode = (headingId: string) => {
    const id = addBlock(BlockTypes.SUBHEADING, undefined, {
      title: 'New Subheading',
      slug: `subheading-new-subheading`,
      description: '',
      metadata: {}
    }, headingId);
    setActiveSubId(id);
  };

  // Change order of sibling blocks in store
  const moveSibling = (blockId: string, direction: 'up' | 'down') => {
    const currentBlocks = [...blocks];
    const index = currentBlocks.findIndex(b => b.id === blockId);
    if (index === -1) return;

    const block = currentBlocks[index];
    const siblings = currentBlocks.filter(b => b.parentId === block.parentId).sort((a, b) => a.orderIndex - b.orderIndex);
    const siblingIdx = siblings.findIndex(b => b.id === blockId);

    if (direction === 'up' && siblingIdx > 0) {
      const prevSibling = siblings[siblingIdx - 1];
      
      // Swap orderIndex
      const temp = block.orderIndex;
      block.orderIndex = prevSibling.orderIndex;
      prevSibling.orderIndex = temp;

      // Re-sort currentBlocks array based on raw orderIndex changes
      currentBlocks.sort((a, b) => a.orderIndex - b.orderIndex);
      setBlocks(currentBlocks);
    } else if (direction === 'down' && siblingIdx < siblings.length - 1) {
      const nextSibling = siblings[siblingIdx + 1];

      // Swap orderIndex
      const temp = block.orderIndex;
      block.orderIndex = nextSibling.orderIndex;
      nextSibling.orderIndex = temp;

      currentBlocks.sort((a, b) => a.orderIndex - b.orderIndex);
      setBlocks(currentBlocks);
    }
  };

  // Render breadcrumbs for active subheading
  const getBreadcrumbs = () => {
    if (!activeSubId) return null;
    for (const part of parts) {
      for (const chap of part.chapters) {
        for (const head of chap.headings) {
          for (const sub of head.subheadings) {
            if (sub.id === activeSubId) {
              return (
                <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-bold tracking-wider text-slate-400 uppercase bg-[#090d1f] border border-slate-800/60 rounded-full px-4 py-2 mb-8 select-none shadow-sm">
                  <span className="text-[#f97316]">{part.title}</span>
                  <span className="opacity-40">/</span>
                  <span className="text-[#38bdf8]">Chapter {chap.chapterNumber}: {chap.title}</span>
                  <span className="opacity-40">/</span>
                  <span className="text-slate-300">{head.title}</span>
                  <span className="opacity-40">/</span>
                  <span className="text-white bg-slate-800 px-2.5 py-0.5 rounded-full">{sub.title}</span>
                </div>
              );
            }
          }
        }
      }
    }
    return null;
  };

  // Filter content blocks for active subheading
  const activeContentBlocks = blocks.filter(b => b.parentId === activeSubId).sort((a, b) => a.orderIndex - b.orderIndex);

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
      className="w-full px-6 md:px-12 py-10 min-h-[70vh] relative"
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

      {/* 1. LEGACY FLAT BLOG STATE */}
      {!hasParts && (
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center justify-between border border-dashed border-slate-800 bg-[#090d1f]/40 backdrop-blur-md rounded-2xl p-6 mb-10 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#f97316]/10 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-[#f97316]" />
              </div>
              <div>
                <h3 className="font-bold text-slate-100">Elevate to Book Structure</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-md">Evolve this post into a nested hierarchy (Parts, Chapters, Headings, Subheadings) to enable premium interactive book navigations.</p>
              </div>
            </div>
            <button
              onClick={initializeHierarchy}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#f97316] to-[#ea580c] hover:opacity-90 text-white font-bold text-xs px-5 py-3 shadow-lg shadow-[#f97316]/20 transition-all cursor-pointer"
            >
              <BookOpen size={14} />
              Initialize Book Outline
            </button>
          </div>

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
            <div className="mb-4 h-px w-full bg-slate-100 dark:bg-slate-800" />
            <div className="flex flex-wrap justify-center gap-2">
              {blockTypes.map((bt) => (
                <button
                  key={bt.type}
                  onClick={() => addBlock(bt.type)}
                  className="group flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition-all hover:border-[#f97316] hover:text-[#f97316] hover:shadow-md dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400"
                >
                  <Plus size={14} className="group-hover:rotate-90 transition-transform" />
                  {bt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. CHRONICLE HIERARCHICAL EDITOR WORKSPACE */}
      {hasParts && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: Outline Tree Explorer Panel */}
          <div className="lg:col-span-5 bg-[#050814]/85 border border-slate-800/80 rounded-2xl p-5 shadow-xl backdrop-blur-xl max-h-[80vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-800/60 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#f97316]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Book Navigator</h3>
              </div>
              <button
                onClick={addPartNode}
                className="flex items-center gap-1 bg-slate-850 hover:bg-slate-800 border border-slate-750 text-white rounded-lg text-[10px] font-bold px-3 py-1.5 transition-colors cursor-pointer"
              >
                <BookPlus size={12} className="text-[#f97316]" />
                Add Part
              </button>
            </div>

            {/* Tree Scroll area */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-3.5 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
              {parts.map((part) => {
                const isPartExpanded = !!expandedParts[part.id];
                const isPartEditingMeta = editingMetadataId === part.id;

                return (
                  <div key={part.id} className="border border-slate-900/60 rounded-xl bg-slate-950/20 p-2.5">
                    {/* Part Header */}
                    <div className="flex items-center justify-between gap-2 group/part">
                      <div className="flex items-center gap-2 overflow-hidden flex-1">
                        <button
                          onClick={() => setExpandedParts(prev => ({ ...prev, [part.id]: !prev[part.id] }))}
                          className="p-0.5 rounded hover:bg-slate-800/50"
                        >
                          {isPartExpanded ? <ChevronDown size={14} className="text-slate-400" /> : <ChevronRight size={14} className="text-slate-400" />}
                        </button>
                        <input
                          type="text"
                          value={part.title}
                          onChange={(e) => updateBlock(part.id, { ...blocks.find(b => b.id === part.id)!.content, title: e.target.value })}
                          className="bg-transparent border-b border-transparent hover:border-slate-800 focus:border-[#f97316] font-bold text-xs uppercase tracking-wider text-slate-200 focus:outline-none flex-1 truncate py-0.5"
                          placeholder="Part Name"
                        />
                      </div>
                      
                      {/* Actions */}
                      <div className="flex items-center gap-1 opacity-0 group-hover/part:opacity-100 transition-opacity">
                        <button onClick={() => addChapterNode(part.id)} title="Add Chapter" className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"><FolderPlus size={12} /></button>
                        <button onClick={() => setEditingMetadataId(isPartEditingMeta ? null : part.id)} title="Metadata" className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-[#f97316]"><Settings size={12} /></button>
                        <button onClick={() => moveSibling(part.id, 'up')} title="Move Up" className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"><MoveUp size={12} /></button>
                        <button onClick={() => moveSibling(part.id, 'down')} title="Move Down" className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"><MoveDown size={12} /></button>
                        <button onClick={() => duplicateBlock(part.id)} title="Duplicate" className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-blue-500"><Copy size={12} /></button>
                        <button onClick={() => removeBlock(part.id)} title="Delete Part" className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-red-500"><Trash2 size={12} /></button>
                      </div>
                    </div>

                    {/* Metadata Panel */}
                    {isPartEditingMeta && (
                      <div className="mt-2.5 p-3 rounded-lg bg-slate-900/60 border border-slate-800/40 space-y-2 text-[11px]">
                        <div className="font-bold text-[#f97316] uppercase tracking-wider mb-1">Part Settings</div>
                        <div>
                          <label className="text-slate-400 block mb-1">Description</label>
                          <textarea
                            value={part.description || ''}
                            onChange={(e) => updateBlock(part.id, { ...blocks.find(b => b.id === part.id)!.content, description: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-850 rounded p-1.5 text-slate-200 focus:outline-none focus:border-[#f97316] resize-none h-12"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-slate-400 block mb-1">Custom Accent Color</label>
                            <input
                              type="text"
                              value={part.metadata?.accentColor || ''}
                              onChange={(e) => updateBlock(part.id, {
                                ...blocks.find(b => b.id === part.id)!.content,
                                metadata: { ...part.metadata, accentColor: e.target.value }
                              })}
                              className="w-full bg-slate-950 border border-slate-850 rounded p-1.5 text-slate-200 focus:outline-none"
                              placeholder="#hex"
                            />
                          </div>
                          <div>
                            <label className="text-slate-400 block mb-1">Icon Name</label>
                            <input
                              type="text"
                              value={part.metadata?.icon || ''}
                              onChange={(e) => updateBlock(part.id, {
                                ...blocks.find(b => b.id === part.id)!.content,
                                metadata: { ...part.metadata, icon: e.target.value }
                              })}
                              className="w-full bg-slate-950 border border-slate-850 rounded p-1.5 text-slate-200 focus:outline-none"
                              placeholder="book"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Chapters container */}
                    {isPartExpanded && (
                      <div className="mt-2 pl-4 border-l border-slate-800/40 ml-2 space-y-2.5">
                        {part.chapters.map((chap) => {
                          const isChapExpanded = !!expandedChapters[chap.id];
                          const isChapEditingMeta = editingMetadataId === chap.id;

                          return (
                            <div key={chap.id} className="border border-slate-900/40 rounded-lg p-2 bg-slate-950/10">
                              {/* Chapter header */}
                              <div className="flex items-center justify-between gap-2 group/chap">
                                <div className="flex items-center gap-1.5 flex-1 overflow-hidden">
                                  <button
                                    onClick={() => setExpandedChapters(prev => ({ ...prev, [chap.id]: !prev[chap.id] }))}
                                    className="p-0.5 rounded hover:bg-slate-800/50"
                                  >
                                    {isChapExpanded ? <ChevronDown size={12} className="text-slate-400" /> : <ChevronRight size={12} className="text-slate-400" />}
                                  </button>
                                  <span className="text-[10px] font-mono opacity-50">
                                    {chap.chapterNumber.toString().padStart(2, '0')}
                                  </span>
                                  <input
                                    type="text"
                                    value={chap.title}
                                    onChange={(e) => updateBlock(chap.id, { ...blocks.find(b => b.id === chap.id)!.content, title: e.target.value })}
                                    className="bg-transparent border-b border-transparent hover:border-slate-800 focus:border-[#f97316] font-semibold text-xs text-slate-300 focus:outline-none flex-1 truncate py-0.5"
                                    placeholder="Chapter Name"
                                  />
                                </div>

                                <div className="flex items-center gap-1 opacity-0 group-hover/chap:opacity-100 transition-opacity">
                                  <button onClick={() => addHeadingNode(chap.id)} title="Add Heading" className="p-0.5 hover:bg-slate-800 rounded text-slate-400 hover:text-white"><Plus size={11} /></button>
                                  <button onClick={() => setEditingMetadataId(isChapEditingMeta ? null : chap.id)} title="Metadata" className="p-0.5 hover:bg-slate-800 rounded text-slate-400 hover:text-[#f97316]"><Settings size={11} /></button>
                                  <button onClick={() => moveSibling(chap.id, 'up')} title="Move Up" className="p-0.5 hover:bg-slate-800 rounded text-slate-400 hover:text-white"><MoveUp size={11} /></button>
                                  <button onClick={() => moveSibling(chap.id, 'down')} title="Move Down" className="p-0.5 hover:bg-slate-800 rounded text-slate-400 hover:text-white"><MoveDown size={11} /></button>
                                  <button onClick={() => duplicateBlock(chap.id)} title="Duplicate" className="p-0.5 hover:bg-slate-800 rounded text-slate-400 hover:text-blue-500"><Copy size={11} /></button>
                                  <button onClick={() => removeBlock(chap.id)} title="Delete Chapter" className="p-0.5 hover:bg-slate-800 rounded text-slate-400 hover:text-red-500"><Trash2 size={11} /></button>
                                </div>
                              </div>

                              {/* Metadata Panel */}
                              {isChapEditingMeta && (
                                <div className="mt-2 p-2 rounded bg-slate-900/60 border border-slate-800/40 space-y-2 text-[10px]">
                                  <div>
                                    <label className="text-slate-400 block mb-0.5">Description</label>
                                    <textarea
                                      value={chap.description || ''}
                                      onChange={(e) => updateBlock(chap.id, { ...blocks.find(b => b.id === chap.id)!.content, description: e.target.value })}
                                      className="w-full bg-slate-950 border border-slate-850 rounded p-1 text-slate-200 focus:outline-none focus:border-[#f97316] resize-none h-10"
                                    />
                                  </div>
                                </div>
                              )}

                              {/* Headings container */}
                              {isChapExpanded && (
                                <div className="mt-1.5 pl-3 border-l border-slate-900 ml-1.5 space-y-1.5">
                                  {chap.headings.map((heading) => {
                                    return (
                                      <div key={heading.id} className="space-y-1">
                                        <div className="flex items-center justify-between gap-2 group/head">
                                          <div className="flex items-center gap-1.5 flex-1 overflow-hidden">
                                            <span className="w-1 h-1 rounded-full bg-slate-600" />
                                            <input
                                              type="text"
                                              value={heading.title}
                                              onChange={(e) => updateBlock(heading.id, { ...blocks.find(b => b.id === heading.id)!.content, title: e.target.value })}
                                              className="bg-transparent border-b border-transparent hover:border-slate-850 focus:border-[#f97316] text-[11px] text-slate-400 focus:outline-none flex-1 truncate py-0.5"
                                              placeholder="Heading Title"
                                            />
                                          </div>

                                          <div className="flex items-center gap-1 opacity-0 group-hover/head:opacity-100 transition-opacity">
                                            <button onClick={() => addSubheadingNode(heading.id)} title="Add Subheading" className="p-0.5 hover:bg-slate-800 rounded text-slate-400 hover:text-white"><Plus size={10} /></button>
                                            <button onClick={() => moveSibling(heading.id, 'up')} title="Move Up" className="p-0.5 hover:bg-slate-800 rounded text-slate-400 hover:text-white"><MoveUp size={10} /></button>
                                            <button onClick={() => moveSibling(heading.id, 'down')} title="Move Down" className="p-0.5 hover:bg-slate-800 rounded text-slate-400 hover:text-white"><MoveDown size={10} /></button>
                                            <button onClick={() => removeBlock(heading.id)} title="Delete Heading" className="p-0.5 hover:bg-slate-800 rounded text-slate-400 hover:text-red-500"><Trash2 size={10} /></button>
                                          </div>
                                        </div>

                                        {/* Subheadings container */}
                                        <div className="pl-3.5 border-l border-slate-900/60 space-y-1 py-0.5">
                                          {heading.subheadings.map((subheading) => {
                                            const isSelected = activeSubId === subheading.id;

                                            return (
                                              <div
                                                key={subheading.id}
                                                onClick={() => setActiveSubId(subheading.id)}
                                                className={cn(
                                                  "flex items-center justify-between gap-2 group/sub p-1 rounded transition-all cursor-pointer",
                                                  isSelected ? "bg-[#0f172a] text-[#38bdf8] font-bold border-l border-[#38bdf8] pl-1.5" : "text-slate-500 hover:text-slate-300"
                                                )}
                                              >
                                                <input
                                                  type="text"
                                                  value={subheading.title}
                                                  onClick={(e) => e.stopPropagation()}
                                                  onChange={(e) => updateBlock(subheading.id, { ...blocks.find(b => b.id === subheading.id)!.content, title: e.target.value })}
                                                  className="bg-transparent border-none text-[11px] focus:outline-none focus:ring-0 w-full cursor-pointer"
                                                  placeholder="Subheading Title"
                                                />

                                                <div className="flex items-center gap-0.5 opacity-0 group-hover/sub:opacity-100 transition-opacity">
                                                  <button onClick={(e) => { e.stopPropagation(); moveSibling(subheading.id, 'up'); }} title="Move Up" className="p-0.5 hover:bg-slate-800 rounded text-slate-400 hover:text-white"><MoveUp size={9} /></button>
                                                  <button onClick={(e) => { e.stopPropagation(); moveSibling(subheading.id, 'down'); }} title="Move Down" className="p-0.5 hover:bg-slate-800 rounded text-slate-400 hover:text-white"><MoveDown size={9} /></button>
                                                  <button onClick={(e) => { e.stopPropagation(); removeBlock(subheading.id); }} title="Delete Subheading" className="p-0.5 hover:bg-slate-800 rounded text-slate-400 hover:text-red-500"><Trash2 size={9} /></button>
                                                </div>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT: Focused content canvas for active subheading */}
          <div className="lg:col-span-7 bg-white/40 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 md:p-8 min-h-[60vh] flex flex-col shadow-xl">
            {getBreadcrumbs()}

            {activeSubId ? (
              <>
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
                      <div className="flex flex-col items-center justify-center p-16 border-2 border-dashed border-slate-200 dark:border-slate-850 rounded-2xl text-slate-400 dark:text-slate-500 mb-6">
                        <Sparkles size={32} className="opacity-40 animate-pulse mb-3" />
                        <span className="font-bold text-xs uppercase tracking-wider">No Content Blocks Yet</span>
                        <span className="text-[11px] mt-1 opacity-60 text-center max-w-xs">Use the toolbar below to insert text, images, lists, tables or other elements inside this section.</span>
                      </div>
                    )}
                  </SortableContext>
                </DndContext>

                {/* Insertion Toolbar */}
                <div className="mt-8 flex flex-col items-center">
                  <div className="mb-4 h-px w-full bg-slate-100 dark:bg-slate-800" />
                  <div className="flex flex-wrap justify-center gap-2">
                    {blockTypes.map((bt) => (
                      <button
                        key={bt.type}
                        onClick={() => addBlock(bt.type, undefined, undefined, activeSubId)}
                        className="group flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-600 transition-all hover:border-[#f97316] hover:text-[#f97316] hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 cursor-pointer"
                      >
                        <Plus size={12} className="group-hover:rotate-90 transition-transform" />
                        {bt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 text-slate-400 dark:text-slate-500">
                <BookOpen size={48} className="opacity-30 mb-4" />
                <span className="font-bold text-sm uppercase tracking-wider text-slate-300">Select a Subheading</span>
                <span className="text-xs mt-1 text-slate-400 max-w-xs text-center">Click on any subheading in the Book Navigator outline on the left to start adding and editing content blocks.</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
