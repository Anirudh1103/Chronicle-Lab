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
  Star
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { GooglePreview } from './GooglePreview';
import { getUploadUrl } from '../../utils/url';
import { MediaPicker } from './MediaPicker';
import { AnimatePresence } from 'framer-motion';

export const EditorSidebar: React.FC = () => {
  const { metadata, seo, setMetadata, setSEO } = useEditorStore();
  const [activeTab, setActiveTab] = useState<'settings' | 'seo' | 'social'>('settings');
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [categories, setCategories] = useState<{ id: string, name: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await blogApi.getCategories();
        setCategories(data);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };
    fetchCategories();
  }, []);

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

  return (
    <aside className="w-80 border-l border-slate-200 bg-white overflow-y-auto dark:border-slate-800 dark:bg-slate-900 h-[calc(100vh-64px)] sticky top-16">
      {/* Media Picker Modal */}
      <AnimatePresence>
        {showMediaPicker && (
          <MediaPicker
            onSelect={(url) => {
              setMetadata({ coverImage: url });
              setShowMediaPicker(false);
            }}
            onClose={() => setShowMediaPicker(false)}
          />
        )}
      </AnimatePresence>

      <div className="flex border-b border-slate-100 dark:border-slate-800">
        {(['settings', 'seo', 'social'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors',
              activeTab === tab
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-slate-400 hover:text-slate-600'
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="p-5 space-y-8">
        {activeTab === 'settings' && (
          <>
            {/* Basic Info */}
            <section className="space-y-4">
              <label className="block">
                <span className="text-xs font-bold text-slate-500 uppercase">URL Slug</span>
                <input
                  type="text"
                  value={metadata.slug}
                  onChange={(e) => setMetadata({ slug: e.target.value })}
                  className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 dark:bg-slate-800 dark:border-slate-700"
                  placeholder="my-awesome-post"
                />
              </label>

              <label className="block">
                <span className="text-xs font-bold text-slate-500 uppercase">Excerpt</span>
                <textarea
                  value={metadata.excerpt}
                  onChange={(e) => setMetadata({ excerpt: e.target.value })}
                  rows={4}
                  className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 dark:bg-slate-800 dark:border-slate-700"
                  placeholder="Short summary for cards..."
                />
              </label>

              <label className="block">
                <span className="text-xs font-bold text-slate-500 uppercase">Summary Section Title</span>
                <input
                  type="text"
                  value={metadata.summaryTitle || ''}
                  onChange={(e) => setMetadata({ summaryTitle: e.target.value })}
                  className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 dark:bg-slate-800 dark:border-slate-700"
                  placeholder="Quick Read"
                />
              </label>

              <label className="block">
                <span className="text-xs font-bold text-slate-500 uppercase">Summary (TL;DR)</span>
                <textarea
                  value={metadata.summary || ''}
                  onChange={(e) => setMetadata({ summary: e.target.value })}
                  rows={4}
                  className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 dark:bg-slate-800 dark:border-slate-700"
                  placeholder="Write a quick summary or TL;DR of the post..."
                />
              </label>

              <label className="block pt-2">
                <span className="text-xs font-bold text-slate-500 uppercase">Completion Quote</span>
                <textarea
                  value={metadata.completionQuote || ''}
                  onChange={(e) => setMetadata({ completionQuote: e.target.value })}
                  rows={3}
                  className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 dark:bg-slate-800 dark:border-slate-700"
                  placeholder="History belongs to..."
                />
              </label>

              <label className="block">
                <span className="text-xs font-bold text-slate-500 uppercase">Completion Quote Author</span>
                <input
                  type="text"
                  value={metadata.completionQuoteAuthor || ''}
                  onChange={(e) => setMetadata({ completionQuoteAuthor: e.target.value })}
                  className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 dark:bg-slate-800 dark:border-slate-700"
                  placeholder="Chronicle Lab"
                />
              </label>
            </section>

            {/* Classification */}
            <section className="space-y-4">
               <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-semibold text-sm">
                  <TagIcon size={16} />
                  Categories & Tags
               </div>
                <div className="space-y-2 max-h-40 overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-lg p-3 bg-white dark:bg-slate-800">
                  {categories.map((category) => {
                    const isChecked = metadata.categoryIds?.includes(category.id) || false;
                    return (
                      <label key={category.id} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 p-1 rounded transition-all">
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
                          className="rounded border-slate-300 text-primary focus:ring-primary w-4 h-4"
                        />
                        <span>{category.name}</span>
                      </label>
                    );
                  })}
                  {categories.length === 0 && (
                    <span className="text-xs text-slate-400 italic">No categories available</span>
                  )}
                </div>

               <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-white/5 mt-4">
                  <div className="flex items-center gap-2">
                    <Star className={cn("transition-colors", metadata.featured ? "text-amber-500 fill-amber-500" : "text-slate-400")} size={16} />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Featured Article</span>
                  </div>
                  <button
                    onClick={() => setMetadata({ featured: !metadata.featured, featuredOrder: !metadata.featured ? null : metadata.featuredOrder })}
                    className={cn(
                      "w-10 h-6 rounded-full relative transition-colors duration-200",
                      metadata.featured ? "bg-primary" : "bg-slate-300 dark:bg-slate-700"
                    )}
                  >
                    <div className={cn(
                      "absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-200",
                      metadata.featured && "translate-x-4"
                    )} />
                  </button>
               </div>

                {metadata.featured && (
                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-white/5 mt-2">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Featured Order (Optional)</span>
                    <input
                      type="number"
                      min="1"
                      value={metadata.featuredOrder || ''}
                      onChange={(e) => {
                        const val = e.target.value ? parseInt(e.target.value, 10) : null;
                        setMetadata({ featuredOrder: val });
                      }}
                      placeholder="Last"
                      className="w-20 bg-background border px-3 py-1.5 rounded-lg text-xs font-bold text-center focus:ring-2 ring-primary/20 outline-none"
                    />
                  </div>
                )}
            </section>

            {/* Cover Image Settings */}
            <section className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
               <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-semibold text-sm">
                  <ImageIcon size={16} />
                  Cover Image
               </div>

               <div
                  onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); }}
                  onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsDragging(false);
                    const file = e.dataTransfer.files?.[0];
                    if (file) handleUpload(file);
                  }}
                  className={cn(
                    "relative transition-all space-y-3",
                    isDragging && "scale-[1.02] ring-2 ring-blue-500 ring-offset-2"
                  )}
               >
                 {metadata.coverImage ? (
                   <div className="relative rounded-lg overflow-hidden group">
                      <img src={getUploadUrl(metadata.coverImage)} loading="lazy" decoding="async" className="w-full aspect-video object-cover" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-2 transition-opacity p-2">
                        <div className="flex gap-2">
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className="bg-white text-black px-3 py-1.5 rounded-md text-xs font-bold hover:bg-slate-100 transition-colors flex items-center gap-1"
                          >
                            <Upload size={12} /> Local
                          </button>
                          <button
                            onClick={() => setShowMediaPicker(true)}
                            className="bg-primary text-primary-foreground px-3 py-1.5 rounded-md text-xs font-bold hover:opacity-90 transition-colors flex items-center gap-1"
                          >
                            <ImageIcon size={12} /> Media Library
                          </button>
                        </div>
                        <button
                          onClick={() => setMetadata({ coverImage: '' })}
                          className="bg-destructive text-destructive-foreground px-3 py-1.5 rounded-md text-xs font-bold hover:opacity-90 transition-colors"
                        >
                          Remove Cover
                        </button>
                      </div>
                   </div>
                 ) : (
                   <div className="p-5 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center gap-3">
                      {isUploading ? (
                        <div className="flex flex-col items-center gap-2 py-4">
                           <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                           <span className="text-[10px] font-bold uppercase text-slate-400">Optimizing Cover...</span>
                        </div>
                      ) : (
                        <>
                          <div className="text-center space-y-1">
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-200 block">Select Cover Image</span>
                            <span className="text-[10px] text-slate-400 block">Choose image source for cover</span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 w-full pt-1">
                            <button
                              onClick={() => fileInputRef.current?.click()}
                              className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all text-slate-700 dark:text-slate-200"
                            >
                              <Upload size={14} className="text-blue-500" /> Upload Local
                            </button>

                            <button
                              onClick={() => setShowMediaPicker(true)}
                              className="py-2.5 px-3 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all border border-primary/20"
                            >
                              <ImageIcon size={14} /> Media Library
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
            </section>
          </>
        )}

        {activeTab === 'seo' && (
          <div className="space-y-6">
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-blue-600 uppercase">Google Preview</span>
              <GooglePreview
                title={seo.seoTitle || metadata.title}
                url={metadata.slug}
                description={seo.seoDescription || metadata.excerpt || ''}
              />
            </div>

            <section className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <label className="block">
                <span className="text-xs font-bold text-slate-500 uppercase">SEO Title</span>
                <input
                  type="text"
                  value={seo.seoTitle}
                  onChange={(e) => setSEO({ seoTitle: e.target.value })}
                  className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 dark:bg-slate-800 dark:border-slate-700"
                />
                <p className="mt-1 text-[10px] text-slate-400">Optimal: 50-60 characters</p>
              </label>

              <label className="block">
                <span className="text-xs font-bold text-slate-500 uppercase">Meta Description</span>
                <textarea
                  value={seo.seoDescription}
                  onChange={(e) => setSEO({ seoDescription: e.target.value })}
                  rows={3}
                  className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 dark:bg-slate-800 dark:border-slate-700"
                />
                <p className="mt-1 text-[10px] text-slate-400">Optimal: 150-160 characters</p>
              </label>

              <label className="block">
                <span className="text-xs font-bold text-slate-500 uppercase">Focus Keywords</span>
                <input
                  type="text"
                  value={seo.seoKeywords}
                  onChange={(e) => setSEO({ seoKeywords: e.target.value })}
                  className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 dark:bg-slate-800 dark:border-slate-700"
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
                    value={seo.ogTitle}
                    onChange={(e) => setSEO({ ogTitle: e.target.value })}
                    className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 dark:bg-slate-800 dark:border-slate-700"
                  />
                </label>
              </section>
           </div>
        )}
      </div>
    </aside>
  );
};
