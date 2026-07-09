import React, { useState } from 'react';
import { useEditorStore } from '../../store/useEditorStore';
import {
  Settings,
  Search,
  Image as ImageIcon,
  Tag as TagIcon,
  Globe,
  Share2,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { GooglePreview } from './GooglePreview';

export const EditorSidebar: React.FC = () => {
  const { metadata, seo, setMetadata, setSEO } = useEditorStore();
  const [activeTab, setActiveTab] = useState<'settings' | 'seo' | 'social'>('settings');

  return (
    <aside className="w-80 border-l border-slate-200 bg-white overflow-y-auto dark:border-slate-800 dark:bg-slate-900 h-[calc(100vh-64px)] sticky top-16">
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
            </section>

            {/* Classification */}
            <section className="space-y-4">
               <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-semibold text-sm">
                  <TagIcon size={16} />
                  Categories & Tags
               </div>
               <select
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none dark:bg-slate-800 dark:border-slate-700"
                value={metadata.categoryId}
                onChange={(e) => setMetadata({ categoryId: e.target.value })}
               >
                 <option value="">Select Category</option>
                 <option value="tech">Technology</option>
                 <option value="history">History</option>
               </select>
            </section>

            {/* Cover Image Settings */}
            <section className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
               <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-semibold text-sm">
                  <ImageIcon size={16} />
                  Cover Image
               </div>
               {metadata.coverImage ? (
                 <div className="relative rounded-lg overflow-hidden group">
                    <img src={metadata.coverImage} className="w-full aspect-video object-cover" />
                    <button
                      onClick={() => setMetadata({ coverImage: '' })}
                      className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold"
                    >
                      Remove
                    </button>
                 </div>
               ) : (
                 <button className="w-full py-8 border-2 border-dashed border-slate-200 rounded-lg text-slate-400 hover:text-slate-600 hover:border-slate-300 transition-colors flex flex-col items-center">
                    <ImageIcon size={24} className="mb-2" />
                    <span className="text-xs">Add Cover Image</span>
                 </button>
               )}
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
                {/* Image upload for social would go here */}
              </section>
           </div>
        )}
      </div>
    </aside>
  );
};
