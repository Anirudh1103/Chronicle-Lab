import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { EditorCanvas } from '../components/editor/EditorCanvas';
import { EditorSidebar } from '../components/editor/EditorSidebar';
import { PreviewModal } from '../components/editor/PreviewModal';
import { useEditorStore } from '../store/useEditorStore';
import { blogApi } from '../api/blog.api';
import { useAuthStore } from '../store/authStore';
import {
  Save,
  Settings,
  Check,
  Clock,
  BarChart3,
  ChevronLeft,
  PanelRightClose,
  PanelRightOpen,
  Trash2,
  RotateCcw,
  Globe,
  Eye,
  EyeOff
} from 'lucide-react';
import { cn } from '../utils/cn';

export const BlogEditorPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
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
            featuredOrder: post.featuredOrder,
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

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    const updates: any = { title: newTitle };

    // Auto-generate slug if it's currently empty
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

    // Final slug validation
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
    } catch (error) {
      console.error('Failed to save:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    if (!confirm('CAUTION: This will permanently purge this chronicle from the laboratory. Proceed?')) return;

    setLoading(true);
    try {
      await blogApi.deletePost(id);
      navigate('/admin/posts');
    } catch (error) {
      console.error('Failed to delete:', error);
      alert('Security Protocol: Failed to delete chronicle.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleVisibility = async () => {
    if (!id) return;
    const isNowHidden = metadata.status === 'PUBLISHED';
    const confirmMsg = isNowHidden
      ? 'Hide this chronicle? It will no longer be visible to the public.'
      : 'Make this chronicle public?';

    if (!confirm(confirmMsg)) return;

    setLoading(true);
    try {
      const { status: newStatus } = await blogApi.togglePostVisibility(id);
      setMetadata({ status: newStatus });
      setLastSaved(new Date());
    } catch (error) {
      console.error('Failed to toggle visibility:', error);
    } finally {
      setLoading(false);
    }
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave(true);
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
          <button
            onClick={() => navigate('/admin/posts')}
            className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
          >
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
            onClick={() => handleSave(false)}
            disabled={!isDirty || isLoading}
            className={cn(
            "flex items-center gap-2 rounded-lg px-4 py-1.5 text-sm font-bold transition-all",
            isDirty
              ? "bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 active:scale-95"
              : "bg-slate-50 text-slate-300 cursor-not-allowed dark:bg-slate-900/50"
          )}>
            {isLoading ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-900 border-t-transparent dark:border-white" />
            ) : (
              <Save size={18} />
            )}
            {isLoading ? 'Saving...' : 'Save Draft'}
          </button>

          <button
            onClick={() => handleSave(true)}
            disabled={isLoading}
            className={cn(
              "flex items-center gap-2 rounded-lg px-4 py-1.5 text-sm font-black transition-all shadow-lg",
              metadata.status === 'PUBLISHED'
                ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-500/20"
                : "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/20 active:scale-95"
            )}
          >
            {metadata.status === 'PUBLISHED' ? (
              <>
                <Globe size={18} /> Published
              </>
            ) : (
              'Publish'
            )}
          </button>

          <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-1" />

          {id && (
            <>
              <button
                onClick={handleToggleVisibility}
                title={metadata.status === 'PUBLISHED' ? "Hide from Public" : "Show to Public"}
                className={cn(
                  "p-2 rounded-lg transition-all flex items-center gap-2 px-3",
                  metadata.status === 'PUBLISHED'
                    ? "text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/10"
                    : "text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                )}
              >
                {metadata.status === 'PUBLISHED' ? <Eye size={20} /> : <EyeOff size={20} />}
                <span className="text-[10px] font-black uppercase tracking-widest hidden md:block">
                  {metadata.status === 'PUBLISHED' ? 'Public' : 'Hidden'}
                </span>
              </button>

              <button
                onClick={handleDelete}
                title="Delete Permanently"
                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-all"
              >
                <Trash2 size={20} />
              </button>
            </>
          )}

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
              onChange={handleTitleChange}
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
