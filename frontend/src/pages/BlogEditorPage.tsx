import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { EditorCanvas } from '../components/editor/EditorCanvas';
import { EditorSidebar } from '../components/editor/EditorSidebar';
import { BlocksPanel } from '../components/editor/BlocksPanel';
import { PreviewModal } from '../components/editor/PreviewModal';
import { useEditorStore } from '../store/useEditorStore';
import { blogApi } from '../api/blog.api';
import { useAuthStore } from '../store/authStore';
import {
  Save,
  Check,
  ChevronLeft,
  Eye,
  Menu,
  Smartphone,
  Tablet,
  Monitor,
  SlidersHorizontal,
  Edit3,
  Loader2
} from 'lucide-react';
import { cn } from '../utils/cn';
import { AnimatePresence, motion } from 'framer-motion';

export const BlogEditorPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  // Sidebar Layout States
  const [showLeftSidebar, setShowLeftSidebar] = useState(true);
  const [showRightSidebar, setShowRightSidebar] = useState(true);
  const [activeTab, setActiveTab] = useState<'settings' | 'seo' | 'social' | 'outline' | 'history'>('settings');
  const [deviceMode, setDeviceMode] = useState<'phone' | 'tablet' | 'desktop'>('desktop');

  // Outline/Hierarchy States
  const [activeSubId, setActiveSubId] = useState<string | null>(null);

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const {
    metadata,
    seo,
    setMetadata,
    setSEO,
    setBlocks,
    isDirty,
    lastSaved,
    isLoading,
    blocks,
    setLoading,
    setLastSaved,
    addBlock
  } = useEditorStore();

  useEffect(() => {
    if (id) {
      const loadPost = async () => {
        setLoading(true);
        try {
          const post = await blogApi.getPost(id);
          setMetadata({
            title: post.title,
            subtitle: post.subtitle,
            slug: post.slug,
            excerpt: post.excerpt,
            summary: post.summary || '',
            summaryTitle: post.summaryTitle || '',
            status: post.status,
            featured: post.featured,
            featuredOrder: post.featuredOrder,
            coverImage: post.coverImage,
            coverImageAlt: post.coverImageAlt,
            coverImageCaption: post.coverImageCaption,
            categoryIds: post.categories?.map((c: any) => c.id) || [],
            tagIds: post.tags?.map((t: any) => t.id) || [],
            completionQuote: post.completionQuote || '',
            completionQuoteAuthor: post.completionQuoteAuthor || '',
          });
          setSEO({
            seoTitle: post.seoTitle,
            seoDescription: post.seoDescription,
            seoKeywords: post.seoKeywords,
            canonicalUrl: post.canonicalUrl,
            ogTitle: post.ogTitle,
            ogDescription: post.ogDescription,
            ogImage: post.ogImage,
            twitterImage: post.twitterImage,
            schemaType: post.schemaType,
            robotsIndex: post.robotsIndex,
          });
          setBlocks(post.blocks.map((b: any) => ({
            ...b,
            content: typeof b.content === 'string' ? JSON.parse(b.content) : b.content
          })));
          setLastSaved(new Date(post.updatedAt));
        } catch (error) {
          console.error('Failed to load post:', error);
        } finally {
          setLoading(false);
        }
      };
      loadPost();
    }
  }, [id]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    const updates: any = { title: newTitle };

    if (!metadata.slug) {
      updates.slug = newTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }

    setMetadata(updates);
  };

  const handleSave = async (publish: boolean = false) => {
    if ((!isDirty && !publish) || isLoading) return;

    if (!metadata.slug && metadata.title) {
      metadata.slug = metadata.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }

    if (!metadata.slug) {
      alert('A slug is required to save the post.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...metadata,
        ...seo,
        status: publish ? 'PUBLISHED' : metadata.status,
        blocks: blocks.map((b, index) => ({
          ...b,
          orderIndex: index
        })),
        authorId: user?.id,
      };

      if (id) {
        await blogApi.updatePost(id, payload);
      } else {
        const newPost = await blogApi.createPost(payload);
        navigate(`/admin/editor/${newPost.id}`, { replace: true });
      }
      setLastSaved(new Date());
      if (publish) {
        setMetadata({ status: 'PUBLISHED' });
      }
    } catch (error: any) {
      console.error('Failed to save:', error);
      const serverError = error.response?.data;
      if (serverError) {
        alert(`Failed to save: ${serverError.message || serverError.error || 'Unknown Server Error'}`);
      } else {
        alert('Failed to save: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave(false);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        setIsPreviewOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDirty, isLoading, blocks, metadata, seo]);

  return (
    <div className="h-screen flex flex-col bg-slate-50 text-slate-800 dark:bg-[#050814] dark:text-slate-200 overflow-hidden font-sans select-none">
      {/* Editor Header Navigation Bar */}
      <header className="sticky top-0 z-[60] flex h-16 items-center justify-between border-b border-slate-200 dark:border-slate-900 bg-white dark:bg-[#090d16] px-6 select-none">
        {/* Left: Hamburger menu toggle + Logo */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/posts')}
            className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => setShowLeftSidebar(!showLeftSidebar)}
            className={cn(
              "p-2 rounded-lg transition-colors border",
              showLeftSidebar
                ? "text-blue-600 bg-blue-50 border-blue-100 dark:text-blue-500 dark:bg-blue-500/5 dark:border-blue-500/10"
                : "text-slate-500 border-transparent hover:text-slate-950 hover:bg-slate-100 dark:hover:text-slate-200 dark:hover:bg-slate-900"
            )}
          >
            <Menu size={18} />
          </button>
          <div className="h-4 w-px bg-slate-200 dark:bg-slate-900" />
          <span className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-slate-100 font-mono">
            CHRONICLE<span className="text-blue-650 dark:text-blue-500">.LAB</span>
          </span>
        </div>

        {/* Middle: Save Status + Title Input Renaming */}
        <div className="flex items-center gap-4 select-none">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest bg-slate-100 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-900 px-3 py-1 rounded-full">
            {isDirty ? (
              <>
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                Unsaved
              </>
            ) : (
              <>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Saved {lastSaved && `at ${new Date(lastSaved).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
              </>
            )}
          </div>
          <div className="h-4 w-px bg-slate-200 dark:bg-slate-900" />
          <div className="flex items-center gap-2 max-w-xs md:max-w-md">
            <input
              type="text"
              value={metadata.title}
              onChange={handleTitleChange}
              className="bg-transparent border-none text-slate-800 dark:text-slate-200 font-bold text-xs outline-none focus:ring-0 truncate py-0.5"
              placeholder="Untitled blog"
            />
            <Edit3 size={11} className="text-slate-400 dark:text-slate-500" />
          </div>
        </div>

        {/* Right: Device View Selection, Preview modal trigger, sidebar toggle, Save/Publish */}
        <div className="flex items-center gap-3">
          {/* Device Toggles */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-950/80 rounded-lg border border-slate-200 dark:border-slate-900 p-0.5">
            <button
              onClick={() => setDeviceMode('phone')}
              className={cn(
                "p-1.5 rounded-md transition-all",
                deviceMode === 'phone'
                  ? "bg-white text-blue-600 border border-slate-200 dark:bg-slate-900 dark:text-blue-500 dark:border-slate-800 shadow-sm"
                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              )}
              title="Mobile Preview"
            >
              <Smartphone size={14} />
            </button>
            <button
              onClick={() => setDeviceMode('tablet')}
              className={cn(
                "p-1.5 rounded-md transition-all",
                deviceMode === 'tablet'
                  ? "bg-white text-blue-600 border border-slate-200 dark:bg-slate-900 dark:text-blue-500 dark:border-slate-800 shadow-sm"
                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              )}
              title="Tablet Preview"
            >
              <Tablet size={14} />
            </button>
            <button
              onClick={() => setDeviceMode('desktop')}
              className={cn(
                "p-1.5 rounded-md transition-all",
                deviceMode === 'desktop'
                  ? "bg-white text-blue-600 border border-slate-200 dark:bg-slate-900 dark:text-blue-500 dark:border-slate-800 shadow-sm"
                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              )}
              title="Desktop Preview"
            >
              <Monitor size={14} />
            </button>
          </div>

          <div className="h-4 w-px bg-slate-200 dark:bg-slate-900" />

          {/* Preview Trigger */}
          <button
            onClick={() => setIsPreviewOpen(true)}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 dark:border-slate-900 dark:bg-[#090d16]/30 dark:text-slate-400 dark:hover:bg-slate-900 transition-colors px-3.5 py-1.5 text-xs font-semibold"
          >
            <Eye size={14} />
            Preview
          </button>

          {/* Right Sidebar toggle */}
          <button
            onClick={() => setShowRightSidebar(!showRightSidebar)}
            className={cn(
              "flex items-center gap-1.5 rounded-lg border px-3.5 py-1.5 text-xs font-semibold transition-colors",
              showRightSidebar
                ? "border-blue-200 bg-blue-50 text-blue-600 dark:border-blue-500/20 dark:bg-blue-500/5 dark:text-blue-400"
                : "border-slate-200 bg-white text-slate-700 dark:border-slate-900 dark:bg-[#090d16]/30 dark:text-slate-400 dark:hover:bg-slate-900"
            )}
          >
            <SlidersHorizontal size={14} />
            More
          </button>

          <div className="h-4 w-px bg-slate-200 dark:bg-slate-900" />

          {/* Save Draft Button */}
          <button
            onClick={() => handleSave(false)}
            disabled={isLoading}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 dark:border-slate-900 dark:bg-slate-950 dark:text-slate-400 dark:hover:bg-slate-900 px-3.5 py-1.5 text-xs font-semibold disabled:opacity-50 transition-colors cursor-pointer"
          >
            Save Draft
          </button>

          {/* Publish Action Button */}
          <button
            onClick={() => handleSave(true)}
            disabled={isLoading}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-5 py-1.5 text-xs font-black transition-all shadow-lg shadow-blue-500/20 active:scale-95 disabled:opacity-50 border-none cursor-pointer"
          >
            {isLoading ? <Loader2 size={13} className="animate-spin" /> : null}
            {metadata.status === 'PUBLISHED' ? 'Update' : 'Publish'}
          </button>
        </div>
      </header>

      {/* Editor Workspace Panel Layout */}
      <main className="flex-1 flex overflow-hidden">
        {/* Collapsible Left Column Sidebar (Blocks Panel) */}
        <AnimatePresence initial={false}>
          {showLeftSidebar && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 280, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="h-full border-r border-slate-200 dark:border-slate-900 bg-white dark:bg-[#090d16] flex-shrink-0"
            >
              <BlocksPanel
                onClose={() => setShowLeftSidebar(false)}
                onAddBlock={(type, content) => {
                  const id = addBlock(type, undefined, content, activeSubId || undefined);
                  setTimeout(() => {
                    const el = document.getElementById(id);
                    if (el) {
                      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      const focusable = el.querySelector('input, textarea, [contenteditable="true"]') as HTMLElement;
                      if (focusable) focusable.focus();
                    }
                  }, 100);
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Center Workspace Editor Canvas Container */}
        <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-[#050814] flex flex-col relative scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-950 scrollbar-track-transparent">
          {/* Scrollable Outer padding area */}
          <div className="flex-1 p-6 md:p-10 flex flex-col items-center">
            {/* Viewport Frame wrapper for Tablet & Phone preview frames */}
            <div
              className={cn(
                "w-full transition-all duration-300 flex-1 flex flex-col",
                deviceMode === 'phone' && "max-w-[375px] border border-slate-300 dark:border-slate-800 rounded-[2.5rem] bg-white dark:bg-[#050814] shadow-2xl p-6 relative max-h-[80vh] overflow-y-auto no-scrollbar",
                deviceMode === 'tablet' && "max-w-[768px] border border-slate-300 dark:border-slate-800 rounded-[2rem] bg-white dark:bg-[#050814] shadow-2xl p-8 relative max-h-[82vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-950",
                deviceMode === 'desktop' && "max-w-4xl"
              )}
            >
              <EditorCanvas
                activeSubId={activeSubId}
                setActiveSubId={setActiveSubId}
              />
            </div>
          </div>
        </div>

        {/* Collapsible Right Column Sidebar (Settings Panel) */}
        <AnimatePresence initial={false}>
          {showRightSidebar && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 340, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="h-full border-l border-slate-200 dark:border-slate-900 bg-white dark:bg-[#090d16] flex-shrink-0"
            >
              <EditorSidebar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                activeSubId={activeSubId}
                setActiveSubId={setActiveSubId}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <PreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        metadata={metadata}
        blocks={blocks}
      />
    </div>
  );
};
