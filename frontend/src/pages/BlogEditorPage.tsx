import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { EditorCanvas } from '../components/editor/EditorCanvas';
import { EditorSidebar } from '../components/editor/EditorSidebar';
import { PreviewModal } from '../components/editor/PreviewModal';
import { useEditorStore } from '../store/useEditorStore';
import { blogApi } from '../api/blog.api';
import {
  Save,
  Eye,
  Settings,
  Check,
  Clock,
  BarChart3,
  ChevronLeft,
  PanelRightClose,
  PanelRightOpen
} from 'lucide-react';
import { cn } from '../utils/cn';

export const BlogEditorPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showSidebar, setShowSidebar] = useState(true);
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
    setLastSaved
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
            status: post.status,
            featured: post.featured,
            coverImage: post.coverImage,
            coverImageAlt: post.coverImageAlt,
            coverImageCaption: post.coverImageCaption,
            categoryId: post.categoryId,
            tagIds: post.tags?.map((t: any) => t.id) || [],
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

  const handleSave = async () => {
    if (!isDirty || isLoading) return;

    setLoading(true);
    try {
      const payload = {
        ...metadata,
        ...seo,
        blocks: blocks.map((b, index) => ({
          ...b,
          orderIndex: index
        })),
        authorId: 'clw1234567890', // TODO: Get from auth store
      };

      if (id) {
        await blogApi.updatePost(id, payload);
      } else {
        const newPost = await blogApi.createPost(payload);
        navigate(`/admin/editor/${newPost.id}`, { replace: true });
      }
      setLastSaved(new Date());
    } catch (error) {
      console.error('Failed to save:', error);
    } finally {
      setLoading(false);
    }
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        setIsPreviewOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDirty, isLoading, blocks, metadata, seo]);

  const wordCount = blocks.reduce((acc, block) => {
    if (block.type === 'paragraph' || block.type === 'heading') {
      return acc + (block.content.text?.replace(/<[^>]*>/g, '').split(/\s+/).length || 0);
    }
    return acc;
  }, 0);

  const readingTime = Math.ceil(wordCount / 200);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Editor Header */}
      <header className="sticky top-0 z-[60] flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 px-6 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80">
        <div className="flex items-center gap-4">
          <button className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100">
            <ChevronLeft size={20} />
          </button>
          <div className="h-4 w-px bg-slate-200 dark:bg-slate-800" />
          <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
            {metadata.title || 'Untitled Blog'}
          </span>
          {isDirty && (
            <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-500">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
              Unsaved Changes
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="mr-4 flex items-center gap-4 text-slate-400 text-xs font-medium">
            <span className="flex items-center gap-1">
              <BarChart3 size={14} />
              {wordCount} words
            </span>
            <span className="flex items-center gap-1">
              <Clock size={14} />
              {readingTime} min read
            </span>
          </div>

          <button
            onClick={() => setIsPreviewOpen(true)}
            className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400"
          >
            <Eye size={18} />
            Preview
          </button>

          <button
            onClick={handleSave}
            disabled={!isDirty || isLoading}
            className={cn(
            "flex items-center gap-2 rounded-lg px-4 py-1.5 text-sm font-bold transition-all shadow-lg shadow-blue-500/20",
            isDirty
              ? "bg-blue-600 text-white hover:bg-blue-700 active:scale-95"
              : "bg-slate-100 text-slate-400 cursor-not-allowed dark:bg-slate-800"
          )}>
            {isLoading ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <Save size={18} />
            )}
            {isLoading ? 'Saving...' : 'Save Draft'}
          </button>

          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className={cn(
              "p-2 rounded-lg transition-colors",
              showSidebar ? "text-blue-600 bg-blue-50 dark:bg-blue-900/20" : "text-slate-500 hover:text-slate-900"
            )}
          >
            {showSidebar ? <PanelRightClose size={20} /> : <PanelRightOpen size={20} />}
          </button>
        </div>
      </header>

      <main className="flex h-[calc(100vh-64px)] overflow-hidden">
        {/* Main Editor */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
          {/* Hero Section Edit */}
          <div className="mx-auto max-w-4xl px-12 pt-20">
            <input
              type="text"
              value={metadata.title}
              onChange={(e) => setMetadata({ title: e.target.value })}
              placeholder="Post Title"
              className="w-full bg-transparent text-5xl font-black outline-none placeholder:text-slate-200 dark:text-white dark:placeholder:text-slate-800"
            />
            <textarea
              value={metadata.subtitle}
              onChange={(e) => setMetadata({ subtitle: e.target.value })}
              placeholder="Add a subtitle..."
              className="mt-4 w-full resize-none bg-transparent text-xl font-medium text-slate-500 outline-none placeholder:text-slate-200 dark:text-slate-400 dark:placeholder:text-slate-800"
              rows={2}
            />
            <div className="mt-8 h-1 w-20 bg-blue-500 rounded-full" />
          </div>

          <EditorCanvas />
        </div>

        {/* Sidebar for SEO & Settings */}
        {showSidebar && <EditorSidebar />}
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
