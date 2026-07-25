import React, { useState, useRef, useEffect } from 'react';
import { useEditorStore } from '../../store/useEditorStore';
import api from '../../api/client';
import { blogApi } from '../../api/blog.api';
import {
  Settings,
  Search,
  Image as ImageIcon,
  Tag as TagIcon,
  Globe,
  Share2,
  ChevronRight,
  ChevronDown,
  X,
  Upload,
  Star,
  BookOpen,
  History as HistoryIcon,
  Plus,
  Trash2,
  Copy,
  MoveUp,
  MoveDown,
  BookPlus,
  FolderPlus,
  Check,
  Edit2
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { GooglePreview } from './GooglePreview';
import { getUploadUrl } from '../../utils/url';
import { MediaPicker } from './MediaPicker';
import { AnimatePresence } from 'framer-motion';
import { buildHierarchyTree, flattenHierarchyTree, validateHierarchy } from '../../utils/hierarchy';
import { useParams } from 'react-router-dom';

interface EditorSidebarProps {
  activeTab: 'settings' | 'seo' | 'social' | 'outline' | 'history';
  setActiveTab: (tab: 'settings' | 'seo' | 'social' | 'outline' | 'history') => void;
  activeSubId: string | null;
  setActiveSubId: (id: string | null) => void;
}

/**
 * EditorSidebar functional component representing the right configuration drawer.
 * Supports metadata settings, categories selection, tag lists creation/deletion,
 * SEO optimization parameters, social OG preview inputs, structured outline tree navigator,
 * and post revision history restoration logs.
 */
export const EditorSidebar: React.FC<EditorSidebarProps> = ({
  activeTab,
  setActiveTab,
  activeSubId,
  setActiveSubId
}) => {
  const { id: postId } = useParams();
  const { blocks, metadata, seo, setMetadata, setSEO, updateBlock, removeBlock, duplicateBlock, setBlocks, addBlock } = useEditorStore();
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [categories, setCategories] = useState<{ id: string, name: string }[]>([]);
  const [tags, setTags] = useState<{ id: string, name: string }[]>([]);
  const [revisions, setRevisions] = useState<{ id: string, createdAt: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const catRef = useRef<HTMLDivElement>(null);
  const tagRef = useRef<HTMLDivElement>(null);

  // Dropdown states
  const [showCatDropdown, setShowCatDropdown] = useState(false);
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newCatName, setNewCatName] = useState('');

  // Outline (Hierarchy) tree states inside Outline tab
  const [editingMetadataId, setEditingMetadataId] = useState<string | null>(null);
  const [expandedParts, setExpandedParts] = useState<Record<string, boolean>>({});
  const [expandedChapters, setExpandedChapters] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        catRef.current && !catRef.current.contains(e.target as Node) &&
        tagRef.current && !tagRef.current.contains(e.target as Node)
      ) {
        setShowCatDropdown(false);
        setShowTagDropdown(false);
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowCatDropdown(false);
        setShowTagDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  useEffect(() => {
    const fetchCategoriesAndTags = async () => {
      try {
        const catData = await blogApi.getCategories();
        setCategories(catData);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }

      try {
        const tagData = await blogApi.getTags();
        setTags(tagData);
      } catch (error) {
        console.error('Failed to fetch tags:', error);
      }
    };
    fetchCategoriesAndTags();
  }, []);

  useEffect(() => {
    const fetchRevisions = async () => {
      if (postId && activeTab === 'history') {
        try {
          const revData = await blogApi.getRevisions(postId);
          setRevisions(revData);
        } catch (error) {
          console.error('Failed to fetch revisions:', error);
        }
      }
    };
    fetchRevisions();
  }, [postId, activeTab]);

  const handleUpload = async (file: File) => {
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const { data } = await api.post('media/upload', formData);
      const url = getUploadUrl(data.path);
      setMetadata({ coverImage: url });
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;
    try {
      const slug = newTagName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const tag = await blogApi.createTag({ name: newTagName.trim(), slug });
      setTags(prev => [...prev, tag]);
      const currentIds = metadata.tagIds || [];
      setMetadata({ tagIds: [...currentIds, tag.id] });
      setNewTagName('');
    } catch (error) {
      console.error('Failed to create tag:', error);
    }
  };

  const handleCreateCategory = async () => {
    if (!newCatName.trim()) return;
    try {
      const slug = newCatName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const category = await blogApi.createCategory({ name: newCatName.trim(), slug });
      setCategories(prev => [...prev, category]);
      const currentIds = metadata.categoryIds || [];
      setMetadata({ categoryIds: [...currentIds, category.id] });
      setNewCatName('');
    } catch (error) {
      console.error('Failed to create category:', error);
    }
  };

  const parts = buildHierarchyTree(blocks);

  const addPartNode = () => {
    const id = addBlock('part', undefined, {
      title: 'New Part',
      slug: 'part-new-part',
      description: '',
      metadata: {}
    });
    setExpandedParts(prev => ({ ...prev, [id]: true }));
  };

  const addChapterNode = (partId: string) => {
    const id = addBlock('chapter', undefined, {
      title: 'New Chapter',
      slug: 'chapter-new-chapter',
      description: '',
      metadata: {}
    }, partId);
    setExpandedChapters(prev => ({ ...prev, [id]: true }));
    setExpandedParts(prev => ({ ...prev, [partId]: true }));
  };

  const addHeadingNode = (chapterId: string) => {
    addBlock('heading', undefined, {
      title: 'New Heading',
      slug: 'heading-new-heading',
      description: '',
      metadata: {}
    }, chapterId);
    setExpandedChapters(prev => ({ ...prev, [chapterId]: true }));
  };

  const addSubheadingNode = (headingId: string) => {
    const id = addBlock('subheading', undefined, {
      title: 'New Subheading',
      slug: 'subheading-new-subheading',
      description: '',
      metadata: {}
    }, headingId);
    setActiveSubId(id);
  };

  const moveSibling = (blockId: string, direction: 'up' | 'down') => {
    const currentBlocks = blocks.map(b => ({ ...b }));
    const index = currentBlocks.findIndex(b => b.id === blockId);
    if (index === -1) return;

    const block = currentBlocks[index];
    const siblings = currentBlocks.filter(b => b.parentId === block.parentId).sort((a, b) => a.orderIndex - b.orderIndex);
    const siblingIdx = siblings.findIndex(b => b.id === blockId);

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
    <aside className="w-full h-full bg-white dark:bg-[#090d16] border-l border-slate-200 dark:border-slate-900 overflow-y-auto flex flex-col scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-950 scrollbar-track-transparent">
      {/* Tabs list */}
      <div className="flex border-b border-slate-200 dark:border-slate-900 bg-slate-50 dark:bg-[#090d16]/80 sticky top-0 z-30 backdrop-blur-md">
        {(['settings', 'seo', 'social', 'outline', 'history'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'flex-1 py-3 text-[10px] font-black uppercase tracking-wider transition-colors border-b-2 text-center text-slate-500 border-transparent hover:text-slate-800 dark:hover:text-slate-300',
              activeTab === tab && 'text-blue-600 dark:text-blue-500 border-blue-600 dark:border-blue-500 font-extrabold'
            )}
          >
            {tab === 'settings' ? 'General' : tab}
          </button>
        ))}
      </div>

      <div className="p-4 space-y-6 flex-1 text-slate-600 dark:text-slate-300">
        {activeTab === 'settings' && (
          <div className="space-y-5">
            {/* Title */}
            <div>
              <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1.5">Title</span>
              <input
                type="text"
                value={metadata.title}
                onChange={(e) => setMetadata({ title: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 rounded-lg px-3 py-2 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-700 outline-none transition-all"
                placeholder="Colonel Sonam Wangchuk..."
              />
            </div>

            {/* Slug */}
            <div>
              <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1.5">Slug</span>
              <input
                type="text"
                value={metadata.slug}
                onChange={(e) => setMetadata({ slug: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 rounded-lg px-3 py-2 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-700 outline-none transition-all"
                placeholder="colonel-sonam-wangchuk-mvc"
              />
            </div>

            {/* Excerpt */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Excerpt</span>
                <span className="text-[9px] font-bold text-slate-500">
                  {metadata.excerpt?.length || 0} / 160
                </span>
              </div>
              <textarea
                value={metadata.excerpt || ''}
                onChange={(e) => setMetadata({ excerpt: e.target.value })}
                rows={3}
                maxLength={160}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 rounded-lg px-3 py-2 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-700 outline-none transition-all resize-none"
                placeholder="The inspiring story of..."
              />
            </div>

            {/* Cover Image */}
            <div>
              <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1.5">Cover Image</span>
              {metadata.coverImage ? (
                <div className="border border-slate-200 dark:border-slate-900 bg-slate-100/40 dark:bg-slate-950/65 rounded-xl p-2 relative group overflow-hidden">
                  <img src={getUploadUrl(metadata.coverImage)} loading="lazy" decoding="async" className="w-full aspect-video object-cover rounded-lg" />
                  <div className="absolute inset-0 bg-slate-950/80 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity p-2 rounded-xl">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 p-1.5 rounded-lg text-xs hover:text-white transition-all"
                      title="Upload Local"
                    >
                      <Upload size={14} />
                    </button>
                    <button
                      onClick={() => setShowMediaPicker(true)}
                      className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 p-1.5 rounded-lg text-xs hover:text-white transition-all"
                      title="Media Library"
                    >
                      <ImageIcon size={14} />
                    </button>
                    <button
                      onClick={() => setMetadata({ coverImage: '' })}
                      className="bg-red-950/80 hover:bg-red-900 border border-red-900 text-red-300 p-1.5 rounded-lg text-xs hover:text-white transition-all"
                      title="Remove Cover"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="border border-slate-200 dark:border-slate-900 bg-slate-100/10 dark:bg-slate-950/30 hover:border-slate-300 dark:hover:border-slate-800 rounded-xl p-4 flex flex-col items-center justify-center gap-2 transition-all">
                  {isUploading ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                  ) : (
                    <>
                      <span className="text-[10px] text-slate-500">No cover image uploaded</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-900 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg text-[9px] font-black uppercase px-3 py-1.5 transition-all"
                        >
                          Upload
                        </button>
                        <button
                          onClick={() => setShowMediaPicker(true)}
                          className="bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900 border border-blue-100 dark:border-blue-900/60 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 rounded-lg text-[9px] font-black uppercase px-3 py-1.5 transition-all"
                        >
                          Library
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleUpload(file);
                }}
                className="hidden"
                accept="image/*"
              />
            </div>

            {/* Categories */}
            <div className="relative" ref={catRef}>
              <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1.5">Categories</span>
              <div
                onClick={() => {
                  setShowCatDropdown(!showCatDropdown);
                  setShowTagDropdown(false);
                }}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-900 rounded-lg p-2 text-xs min-h-[38px] flex flex-wrap gap-1.5 items-center justify-between cursor-pointer select-none"
              >
                <div className="flex flex-wrap gap-1.5">
                  {categories.filter(c => metadata.categoryIds?.includes(c.id)).map(cat => (
                    <span
                      key={cat.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setMetadata({ categoryIds: (metadata.categoryIds || []).filter(id => id !== cat.id) });
                      }}
                      className="bg-slate-200 border border-slate-200 dark:bg-slate-900 dark:border-slate-900 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-md flex items-center gap-1 hover:border-red-950 hover:text-red-400 transition-all font-semibold"
                    >
                      {cat.name}
                      <X size={10} />
                    </span>
                  ))}
                  {(!metadata.categoryIds || metadata.categoryIds.length === 0) && (
                    <span className="text-slate-400">Select categories...</span>
                  )}
                </div>
                <ChevronDown size={14} className="text-slate-500" />
              </div>

              {showCatDropdown && (
                <div className="absolute left-0 right-0 mt-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-900 rounded-xl shadow-2xl p-3 z-40 max-h-48 overflow-y-auto space-y-2.5">
                  <div className="flex gap-1.5 border-b border-slate-200 dark:border-slate-900 pb-2">
                    <input
                      type="text"
                      value={newCatName}
                      onChange={(e) => setNewCatName(e.target.value)}
                      placeholder="Add custom category..."
                      className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded px-2 py-1 text-[11px] outline-none text-slate-800 dark:text-white focus:border-blue-500"
                    />
                    <button onClick={handleCreateCategory} className="p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded border-none cursor-pointer"><Plus size={12} /></button>
                  </div>
                  {categories.map((category) => {
                    const isChecked = metadata.categoryIds?.includes(category.id) || false;
                    return (
                      <label key={category.id} className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-900/60 p-1.5 rounded transition-all select-none">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            const currentIds = metadata.categoryIds || [];
                            if (e.target.checked) {
                              setMetadata({ categoryIds: [...currentIds, category.id] });
                            } else {
                              setMetadata({ categoryIds: currentIds.filter(id => id !== category.id) });
                            }
                          }}
                          className="rounded border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-blue-600 focus:ring-0 w-3.5 h-3.5"
                        />
                        <span>{category.name}</span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Tags */}
            <div className="relative" ref={tagRef}>
              <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1.5">Tags</span>
              <div
                onClick={() => {
                  setShowTagDropdown(!showTagDropdown);
                  setShowCatDropdown(false);
                }}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-900 rounded-lg p-2 text-xs min-h-[38px] flex flex-wrap gap-1.5 items-center justify-between cursor-pointer select-none"
              >
                <div className="flex flex-wrap gap-1.5">
                  {tags.filter(t => metadata.tagIds?.includes(t.id)).map(tag => (
                    <span
                      key={tag.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setMetadata({ tagIds: (metadata.tagIds || []).filter(id => id !== tag.id) });
                      }}
                      className="bg-slate-200 border border-slate-200 dark:bg-slate-900 dark:border-slate-900 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-md flex items-center gap-1 hover:border-red-950 hover:text-red-400 transition-all font-semibold"
                    >
                      {tag.name}
                      <X size={10} />
                    </span>
                  ))}
                  {(!metadata.tagIds || metadata.tagIds.length === 0) && (
                    <span className="text-slate-400">Select tags...</span>
                  )}
                </div>
                <ChevronDown size={14} className="text-slate-500" />
              </div>

              {showTagDropdown && (
                <div className="absolute left-0 right-0 mt-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-900 rounded-xl shadow-2xl p-3 z-40 max-h-48 overflow-y-auto space-y-2.5">
                  <div className="flex gap-1.5 border-b border-slate-200 dark:border-slate-900 pb-2">
                    <input
                      type="text"
                      value={newTagName}
                      onChange={(e) => setNewTagName(e.target.value)}
                      placeholder="Add new tag..."
                      className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded px-2 py-1 text-[11px] outline-none text-slate-800 dark:text-white focus:border-blue-500"
                    />
                    <button onClick={handleCreateTag} className="p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded border-none cursor-pointer"><Plus size={12} /></button>
                  </div>
                  {tags.map((tag) => {
                    const isChecked = metadata.tagIds?.includes(tag.id) || false;
                    return (
                      <label key={tag.id} className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-900/60 p-1.5 rounded transition-all select-none">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            const currentIds = metadata.tagIds || [];
                            if (e.target.checked) {
                              setMetadata({ tagIds: [...currentIds, tag.id] });
                            } else {
                              setMetadata({ tagIds: currentIds.filter(id => id !== tag.id) });
                            }
                          }}
                          className="rounded border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-blue-600 focus:ring-0 w-3.5 h-3.5"
                        />
                        <span>{tag.name}</span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Featured and Allow Comments */}
            <div className="flex flex-col gap-3 p-4 bg-slate-100/50 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-900/65 rounded-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Featured Article</span>
                <button
                  onClick={() => setMetadata({ featured: !metadata.featured })}
                  className={cn(
                    "w-10 h-5 rounded-full relative transition-colors duration-200",
                    metadata.featured ? "bg-blue-600" : "bg-slate-200 dark:bg-slate-800"
                  )}
                >
                  <div className={cn(
                    "absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform duration-200",
                    metadata.featured && "translate-x-5"
                  )} />
                </button>
              </div>
            </div>

            {/* Status & Publish Date */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1.5">Status</span>
                <select
                  value={metadata.status}
                  onChange={(e) => setMetadata({ status: e.target.value as any })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-900 focus:border-blue-500 rounded-lg px-2.5 py-2 text-xs text-slate-800 dark:text-slate-100 outline-none"
                >
                  <option value="DRAFT">Draft</option>
                  <option value="PUBLISHED">Published</option>
                  <option value="HIDDEN">Hidden</option>
                  <option value="SCHEDULED">Scheduled</option>
                </select>
              </div>

              <div>
                <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1.5">Publish Date</span>
                <input
                  type="date"
                  value={metadata.status === 'PUBLISHED' ? new Date().toISOString().split('T')[0] : ''}
                  disabled
                  className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-400 dark:text-slate-500 outline-none cursor-not-allowed"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'seo' && (
          <div className="space-y-6">
            <div className="space-y-2">
              <span className="text-[10px] font-black text-blue-600 dark:text-blue-500 uppercase">Google Preview</span>
              <GooglePreview
                title={seo.seoTitle || metadata.title}
                url={metadata.slug}
                description={seo.seoDescription || metadata.excerpt || ''}
              />
            </div>

            <section className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-900">
              <label className="block">
                <span className="text-xs font-bold text-slate-500 uppercase">SEO Title</span>
                <input
                  type="text"
                  value={seo.seoTitle || ''}
                  onChange={(e) => setSEO({ seoTitle: e.target.value })}
                  className="mt-1 w-full rounded-md border border-slate-200 bg-slate-50 dark:bg-slate-950 dark:border-slate-900 px-3 py-2 text-sm outline-none focus:border-blue-500 text-slate-800 dark:text-white"
                />
              </label>

              <label className="block">
                <span className="text-xs font-bold text-slate-500 uppercase">Meta Description</span>
                <textarea
                  value={seo.seoDescription || ''}
                  onChange={(e) => setSEO({ seoDescription: e.target.value })}
                  rows={3}
                  className="mt-1 w-full rounded-md border border-slate-200 bg-slate-50 dark:bg-slate-950 dark:border-slate-900 px-3 py-2 text-sm outline-none focus:border-blue-500 text-slate-800 dark:text-white"
                />
              </label>

              <label className="block">
                <span className="text-xs font-bold text-slate-500 uppercase">Focus Keywords</span>
                <input
                  type="text"
                  value={seo.seoKeywords || ''}
                  onChange={(e) => setSEO({ seoKeywords: e.target.value })}
                  className="mt-1 w-full rounded-md border border-slate-200 bg-slate-50 dark:bg-slate-950 dark:border-slate-900 px-3 py-2 text-sm outline-none focus:border-blue-500 text-slate-800 dark:text-white"
                  placeholder="keyword1, keyword2..."
                />
              </label>
            </section>
          </div>
        )}

        {activeTab === 'social' && (
          <div className="space-y-6">
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-semibold text-sm">
                <Share2 size={16} />
                Open Graph (Facebook/LinkedIn)
              </div>
              <label className="block">
                <span className="text-xs font-bold text-slate-500 uppercase">OG Title</span>
                <input
                  type="text"
                  value={seo.ogTitle || ''}
                  onChange={(e) => setSEO({ ogTitle: e.target.value })}
                  className="mt-1 w-full rounded-md border border-slate-200 bg-slate-50 dark:bg-slate-950 dark:border-slate-900 px-3 py-2 text-sm outline-none focus:border-blue-500 text-slate-800 dark:text-white"
                />
              </label>
            </section>
          </div>
        )}

        {activeTab === 'outline' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-900 pb-3 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-100">Outline Navigator</span>
              <button
                onClick={addPartNode}
                className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 border border-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 dark:border-slate-800 text-slate-700 dark:text-white rounded-lg text-[9px] font-bold px-2 py-1 transition-colors cursor-pointer"
              >
                <BookPlus size={10} /> Add Part
              </button>
            </div>

            <div className="space-y-3">
              {parts.map((part) => {
                const isPartExpanded = !!expandedParts[part.id];
                const isPartEditingMeta = editingMetadataId === part.id;

                return (
                  <div key={part.id} className="border border-slate-200 dark:border-slate-900/60 rounded-xl bg-slate-50 dark:bg-slate-950/20 p-2">
                    {/* Part Header */}
                    <div className="flex items-center justify-between gap-1 group/part">
                      <div className="flex items-center gap-1.5 overflow-hidden flex-1">
                        <button
                          onClick={() => setExpandedParts(prev => ({ ...prev, [part.id]: !prev[part.id] }))}
                          className="p-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
                        >
                          {isPartExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                        </button>
                        <input
                          type="text"
                          value={part.title}
                          onChange={(e) => {
                            const b = blocks.find(x => x.id === part.id);
                            if (b) updateBlock(part.id, { ...b.content, title: e.target.value });
                          }}
                          className="bg-transparent border-b border-transparent hover:border-slate-300 dark:hover:border-slate-800 focus:border-[#f97316] font-bold text-[11px] uppercase tracking-wider text-slate-800 dark:text-slate-200 focus:outline-none flex-1 truncate py-0.5"
                          placeholder="Part Name"
                        />
                      </div>
                      
                      {/* Actions */}
                      <div className="flex items-center gap-0.5 opacity-0 group-hover/part:opacity-100 transition-opacity">
                        <button onClick={() => addChapterNode(part.id)} title="Add Chapter" className="p-0.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"><FolderPlus size={10} /></button>
                        <button onClick={() => setEditingMetadataId(isPartEditingMeta ? null : part.id)} title="Metadata" className="p-0.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-500 dark:text-slate-400 hover:text-slate-850 dark:hover:text-white"><Settings size={10} /></button>
                        <button onClick={() => moveSibling(part.id, 'up')} title="Move Up" className="p-0.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-500 dark:text-slate-400 hover:text-slate-850 dark:hover:text-white"><MoveUp size={10} /></button>
                        <button onClick={() => moveSibling(part.id, 'down')} title="Move Down" className="p-0.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-500 dark:text-slate-400 hover:text-slate-850 dark:hover:text-white"><MoveDown size={10} /></button>
                        <button onClick={() => duplicateBlock(part.id)} title="Duplicate" className="p-0.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-500 dark:text-slate-400 hover:text-blue-500"><Copy size={10} /></button>
                        <button onClick={() => removeBlock(part.id)} title="Delete Part" className="p-0.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-500 dark:text-slate-400 hover:text-red-500"><Trash2 size={10} /></button>
                      </div>
                    </div>

                    {/* Optional Metadata Editor Panel */}
                    {isPartEditingMeta && (
                      <div className="mt-2 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg space-y-2">
                        <label className="block text-left">
                          <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1">Slug</span>
                          <input
                            type="text"
                            value={part.slug || ''}
                            onChange={(e) => {
                              const b = blocks.find(x => x.id === part.id);
                              if (b) updateBlock(part.id, { ...b.content, slug: e.target.value });
                            }}
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded px-2 py-1 text-xs outline-none text-slate-800 dark:text-white"
                          />
                        </label>
                        <label className="block text-left">
                          <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1">Description</span>
                          <textarea
                            value={part.description || ''}
                            onChange={(e) => {
                              const b = blocks.find(x => x.id === part.id);
                              if (b) updateBlock(part.id, { ...b.content, description: e.target.value });
                            }}
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded px-2 py-1 text-xs outline-none text-slate-800 dark:text-white resize-none h-12"
                          />
                        </label>
                      </div>
                    )}

                    {/* Chapters container */}
                    {isPartExpanded && (
                      <div className="mt-2 pl-3 border-l border-slate-200 dark:border-slate-900 ml-1.5 space-y-2">
                        {part.chapters.map((chap) => {
                          const isChapExpanded = !!expandedChapters[chap.id];
                          const isChapEditingMeta = editingMetadataId === chap.id;

                          return (
                            <div key={chap.id} className="border border-slate-200 dark:border-slate-900/40 rounded p-1.5 bg-slate-100/50 dark:bg-slate-950/10">
                              {/* Chapter header */}
                              <div className="flex items-center justify-between gap-1 group/chap">
                                <div className="flex items-center gap-1 flex-1 overflow-hidden">
                                  <button
                                    onClick={() => setExpandedChapters(prev => ({ ...prev, [chap.id]: !prev[chap.id] }))}
                                    className="p-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
                                  >
                                    {isChapExpanded ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
                                  </button>
                                  <input
                                    type="text"
                                    value={chap.title}
                                    onChange={(e) => {
                                      const b = blocks.find(x => x.id === chap.id);
                                      if (b) updateBlock(chap.id, { ...b.content, title: e.target.value });
                                    }}
                                    className="bg-transparent border-b border-transparent hover:border-slate-300 dark:hover:border-slate-800 focus:border-blue-500 font-semibold text-[11px] text-slate-700 dark:text-slate-300 focus:outline-none flex-1 truncate py-0.5"
                                    placeholder="Chapter Name"
                                  />
                                </div>

                                <div className="flex items-center gap-0.5 opacity-0 group-hover/chap:opacity-100 transition-opacity">
                                  <button onClick={() => addHeadingNode(chap.id)} title="Add Heading" className="p-0.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-500 dark:text-slate-400 hover:text-slate-850 dark:hover:text-white"><Plus size={10} /></button>
                                  <button onClick={() => setEditingMetadataId(isChapEditingMeta ? null : chap.id)} title="Metadata" className="p-0.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-500 dark:text-slate-400 hover:text-slate-850 dark:hover:text-white"><Settings size={10} /></button>
                                  <button onClick={() => moveSibling(chap.id, 'up')} title="Move Up" className="p-0.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-500 dark:text-slate-400 hover:text-slate-850 dark:hover:text-white"><MoveUp size={10} /></button>
                                  <button onClick={() => moveSibling(chap.id, 'down')} title="Move Down" className="p-0.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-500 dark:text-slate-400 hover:text-slate-850 dark:hover:text-white"><MoveDown size={10} /></button>
                                  <button onClick={() => removeBlock(chap.id)} title="Delete Chapter" className="p-0.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-500 dark:text-slate-400 hover:text-red-500"><Trash2 size={10} /></button>
                                </div>
                              </div>

                              {/* Optional Metadata Editor Panel */}
                              {isChapEditingMeta && (
                                <div className="mt-2 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg space-y-2">
                                  <label className="block text-left">
                                    <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1">Slug</span>
                                    <input
                                      type="text"
                                      value={chap.slug || ''}
                                      onChange={(e) => {
                                        const b = blocks.find(x => x.id === chap.id);
                                        if (b) updateBlock(chap.id, { ...b.content, slug: e.target.value });
                                      }}
                                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded px-2 py-1 text-xs outline-none text-slate-800 dark:text-white"
                                    />
                                  </label>
                                  <label className="block text-left">
                                    <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1">Description</span>
                                    <textarea
                                      value={chap.description || ''}
                                      onChange={(e) => {
                                        const b = blocks.find(x => x.id === chap.id);
                                        if (b) updateBlock(chap.id, { ...b.content, description: e.target.value });
                                      }}
                                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded px-2 py-1 text-xs outline-none text-slate-800 dark:text-white resize-none h-12"
                                    />
                                  </label>
                                </div>
                              )}

                              {/* Headings container */}
                              {isChapExpanded && (
                                <div className="mt-1.5 pl-2.5 border-l border-slate-200 dark:border-slate-900 ml-1 space-y-1">
                                  {chap.headings.map((heading) => {
                                    return (
                                      <div key={heading.id} className="space-y-1">
                                        <div className="flex items-center justify-between gap-1 group/head">
                                          <input
                                            type="text"
                                            value={heading.title}
                                            onChange={(e) => {
                                              const b = blocks.find(x => x.id === heading.id);
                                              if (b) updateBlock(heading.id, { ...b.content, title: e.target.value });
                                            }}
                                            className="bg-transparent border-b border-transparent hover:border-slate-300 dark:hover:border-slate-800 focus:border-blue-500 text-[10px] text-slate-600 dark:text-slate-400 focus:outline-none flex-1 truncate py-0.5"
                                            placeholder="Heading Title"
                                          />

                                          <div className="flex items-center gap-0.5 opacity-0 group-hover/head:opacity-100 transition-opacity">
                                            <button onClick={() => addSubheadingNode(heading.id)} title="Add Subheading" className="p-0.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-500 dark:text-slate-400 hover:text-slate-850 dark:hover:text-white"><Plus size={9} /></button>
                                            <button onClick={() => removeBlock(heading.id)} title="Delete Heading" className="p-0.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-500 dark:text-slate-400 hover:text-red-500"><Trash2 size={9} /></button>
                                          </div>
                                        </div>

                                        {/* Subheadings container */}
                                        <div className="pl-3 border-l border-slate-200 dark:border-slate-900 space-y-1">
                                          {heading.subheadings.map((subheading) => {
                                            const isSelected = activeSubId === subheading.id;

                                            return (
                                              <div
                                                key={subheading.id}
                                                onClick={() => setActiveSubId(subheading.id)}
                                                className={cn(
                                                  "flex items-center justify-between gap-1 group/sub p-1 rounded transition-all cursor-pointer",
                                                  isSelected
                                                    ? "bg-slate-100 dark:bg-slate-900/60 text-blue-600 dark:text-blue-400 font-bold border-l-2 border-blue-500 pl-1.5"
                                                    : "text-slate-400 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
                                                )}
                                              >
                                                <span className="text-[10px] truncate max-w-[120px] select-none block font-semibold">
                                                  {subheading.title || 'Untitled Subheading'}
                                                </span>

                                                <div className="flex items-center gap-0.5 opacity-0 group-hover/sub:opacity-100 transition-opacity">
                                                  <button onClick={(e) => { e.stopPropagation(); moveSibling(subheading.id, 'up'); }} title="Move Up" className="p-0.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"><MoveUp size={8} /></button>
                                                  <button onClick={(e) => { e.stopPropagation(); moveSibling(subheading.id, 'down'); }} title="Move Down" className="p-0.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"><MoveDown size={8} /></button>
                                                  <button onClick={(e) => { e.stopPropagation(); removeBlock(subheading.id); }} title="Delete" className="p-0.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-500 dark:text-slate-400 hover:text-red-500"><Trash2 size={8} /></button>
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
        )}

        {activeTab === 'history' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-900 pb-3 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                <HistoryIcon size={14} className="text-blue-500" />
                Revision Log
              </span>
            </div>

            <div className="space-y-2">
              {revisions.map((rev) => (
                <div
                  key={rev.id}
                  className="p-3 border border-slate-200 dark:border-slate-900 bg-slate-50 dark:bg-slate-950/20 rounded-xl hover:border-slate-300 dark:hover:border-slate-800 transition-colors flex items-center justify-between cursor-pointer group"
                >
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-800 dark:text-slate-200 font-semibold group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {new Date(rev.createdAt).toLocaleString(undefined, {
                         month: 'short',
                         day: 'numeric',
                         year: 'numeric',
                         hour: '2-digit',
                         minute: '2-digit'
                      })}
                    </span>
                    <span className="text-[9px] text-slate-400 dark:text-slate-650 font-bold uppercase tracking-wider mt-0.5">
                      Revision ID: {rev.id.slice(0, 8)}
                    </span>
                  </div>
                  <ChevronRight size={14} className="text-slate-400 dark:text-slate-700 group-hover:translate-x-1 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-all" />
                </div>
              ))}

              {revisions.length === 0 && (
                <div className="text-center py-8 text-slate-550 dark:text-slate-500 text-xs italic">
                  No revisions captured yet.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
