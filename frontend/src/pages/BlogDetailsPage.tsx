import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { blogApi } from '../api/blog.api';
import { Clock, User, Calendar, ChevronLeft, Share2, Type, Eye, EyeOff } from 'lucide-react';
import { ReadingNavigator } from '../components/blog/ReadingNavigator';
import { Reactions } from '../components/blog/Reactions';
import { Lightbox } from '../components/blog/Lightbox';
import { Copy, Check } from 'lucide-react';
import { cn } from '../utils/cn';

const CodeBlockDetails: React.FC<{ content: any }> = ({ content }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-8 rounded-2xl overflow-hidden bg-slate-900 shadow-xl border border-white/5 group">
      <div className="px-6 py-3 bg-slate-800/50 flex justify-between items-center">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          {content.filename || content.language}
        </span>
        <button
          onClick={handleCopy}
          className="p-1.5 hover:bg-white/10 rounded-md transition-all text-slate-400 hover:text-white"
        >
          {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
        </button>
      </div>
      <div className="relative">
        <pre className="p-6 overflow-x-auto text-sm font-mono text-slate-300 leading-relaxed scrollbar-thin scrollbar-thumb-slate-800">
          <code>{content.code}</code>
        </pre>
      </div>
    </div>
  );
};

export const BlogDetailsPage: React.FC = () => {
  const { slug } = useParams();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [fontTheme, setFontTheme] = useState<'serif' | 'sans'>('serif');
  const [activeImage, setActiveImage] = useState<{src: string, alt?: string, caption?: string} | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const data = await blogApi.getPostBySlug(slug!);
        setPost({
          ...data,
          blocks: data.blocks.map((b: any) => ({
            ...b,
            content: typeof b.content === 'string' ? JSON.parse(b.content) : b.content
          }))
        });
      } catch (error) {
        console.error("Error fetching post:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [slug]);

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-2xl animate-pulse">Loading Chronicle...</div>;
  if (!post) return <div className="min-h-screen flex items-center justify-center font-bold text-2xl">Chronicle not found.</div>;

  return (
    <div className={cn("min-h-screen bg-background pb-32 transition-all duration-700", isFocusMode && "pt-0")}>
      {!isFocusMode && <ReadingNavigator blocks={post.blocks} />}

      <Lightbox
        src={activeImage?.src || ''}
        alt={activeImage?.alt}
        caption={activeImage?.caption}
        isOpen={!!activeImage}
        onClose={() => setActiveImage(null)}
      />

      {/* Reader Controls Toolbar */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[150] flex items-center gap-2 p-2 glass rounded-2xl border border-white/10 shadow-2xl">
         <button
          onClick={() => setIsFocusMode(!isFocusMode)}
          className={cn("p-2 rounded-xl transition-all", isFocusMode ? "bg-primary text-white" : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500")}
          title={isFocusMode ? "Exit Focus Mode" : "Enter Focus Mode"}
         >
           {isFocusMode ? <EyeOff size={18} /> : <Eye size={18} />}
         </button>
         <div className="w-px h-4 bg-slate-200 dark:bg-slate-800" />
         <button
          onClick={() => setFontTheme(fontTheme === 'serif' ? 'sans' : 'serif')}
          className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-all flex items-center gap-2 px-3"
         >
           <Type size={18} />
           <span className="text-[10px] font-black uppercase tracking-widest">{fontTheme}</span>
         </button>
      </div>

      {/* Hero Header */}
      {!isFocusMode && (
        <header className="relative pt-12 md:pt-20 pb-12 md:pb-16 px-4 md:px-6 max-w-5xl mx-auto space-y-6 md:space-y-8">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-primary transition-colors mb-2">
          <ChevronLeft size={16} /> <span className="hidden sm:inline">Back to Chronicles</span><span className="sm:hidden">Back</span>
        </Link>

        <div className="space-y-4 md:space-y-6">
          <div className="flex flex-wrap items-center gap-2 md:gap-3">
             <span className="px-2 md:px-3 py-1 bg-primary/10 text-primary text-[9px] md:text-[10px] font-black uppercase tracking-widest rounded-full">
                {post.category?.name}
             </span>
             {post.featured && (
               <span className="px-2 md:px-3 py-1 bg-amber-500/10 text-amber-500 text-[9px] md:text-[10px] font-black uppercase tracking-widest rounded-full">
                 Featured
               </span>
             )}
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-editorial italic font-black text-slate-900 dark:text-white leading-[1.1] tracking-tighter">
            {post.title}
          </h1>

          <p className="text-lg md:text-2xl text-muted-foreground font-medium leading-relaxed max-w-3xl">
            {post.subtitle}
          </p>

          <div className="flex flex-wrap items-center gap-4 md:gap-8 pt-4 border-t border-slate-100 dark:border-slate-800 pt-6 md:pt-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-500 text-sm md:text-base">
                {post.author.name[0]}
              </div>
              <div>
                <p className="text-[10px] md:text-xs font-black uppercase tracking-widest">{post.author.name}</p>
                <p className="text-[8px] md:text-[10px] text-slate-400 font-bold uppercase tracking-widest">Lead Investigator</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 md:gap-6 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400">
              <span className="flex items-center gap-1.5"><Calendar size={12} className="md:w-3.5 md:h-3.5" /> {new Date(post.createdAt).toLocaleDateString()}</span>
              <span className="flex items-center gap-1.5"><Clock size={12} className="md:w-3.5 md:h-3.5" /> {post.readingTime} Min Read</span>
            </div>

            <button className="ml-auto p-2 hover:bg-slate-100 rounded-full dark:hover:bg-slate-800 transition-colors">
              <Share2 size={18} className="md:w-5 md:h-5" />
            </button>
          </div>
        </div>

        {post.coverImage && (
          <div className="mt-8 md:mt-12 rounded-2xl md:rounded-[3rem] overflow-hidden shadow-2xl">
            <img src={post.coverImage} className="w-full h-auto object-cover max-h-[400px] md:max-h-[600px]" alt={post.coverImageAlt || post.title} />
            {post.coverImageCaption && (
              <p className="py-3 md:py-4 px-4 text-center text-xs md:text-sm text-slate-400 italic leading-relaxed">{post.coverImageCaption}</p>
            )}
          </div>
        )}
      </header>
      )}

      <main className={cn(
        "max-w-4xl mx-auto px-4 md:px-6 grid grid-cols-1 gap-12 transition-all duration-700",
        !isFocusMode ? "lg:grid-cols-[1fr_250px]" : "max-w-3xl py-12 md:py-20"
      )}>
        <div className="space-y-8">
          <div className={cn(
            "prose lg:prose-xl dark:prose-invert max-w-none transition-all duration-500 font-medium",
            fontTheme === 'serif' ? "font-editorial" : "font-sans leading-relaxed"
          )}>
            {post.blocks.map((block: any) => (
              <div key={block.id} id={block.id} className="mb-8">
                {renderBlock(block, setActiveImage)}
              </div>
            ))}
          </div>

          <Reactions
            postId={post.id}
            initialCounts={{
              Historic: post.reactionHistoric,
              Brilliant: post.reactionBrilliant,
              Insightful: post.reactionInsightful
            }}
          />
        </div>

        {/* Sticky Sidebar for desktop */}
        {!isFocusMode && (
          <aside className="hidden lg:block">
           <div className="sticky top-32 space-y-12">
              <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 space-y-4">
                 <h4 className="text-xs font-black uppercase tracking-widest text-primary">About this Chronicle</h4>
                 <p className="text-sm text-slate-500 font-medium leading-relaxed">
                   {post.excerpt || "A deep dive exploration into the intersection of technology and history."}
                 </p>
              </div>
           </div>
        </aside>
        )}
      </main>
    </div>
  );
};

function renderBlock(block: any, onImageClick?: (img: any) => void) {
  const { type, content } = block;
  switch (type) {
    case 'heading':
      const Tag = `h${content.level}` as any;
      const classes = {
        1: 'text-3xl sm:text-4xl md:text-5xl font-black mb-6 md:mb-8',
        2: 'text-2xl sm:text-3xl md:text-4xl font-bold mb-4 md:mb-6 pt-6 md:pt-8',
        3: 'text-xl sm:text-2xl md:text-3xl font-bold mb-3 md:mb-4 pt-3 md:pt-4',
      }[content.level as 1 | 2 | 3] || 'text-lg font-bold';
      return <Tag className={cn(classes, "font-editorial italic")}>{content.text}</Tag>;

    case 'paragraph':
      return <div className="text-base sm:text-lg md:text-xl leading-relaxed mb-6" dangerouslySetInnerHTML={{ __html: content.text }} />;

    case 'image':
      return (
        <figure className="my-8 md:my-12">
          <img
            src={content.url}
            alt={content.alt}
            className="rounded-2xl md:rounded-3xl w-full shadow-lg cursor-zoom-in hover:scale-[1.01] md:hover:scale-[1.02] transition-transform duration-500"
            onClick={() => onImageClick?.({src: content.url, alt: content.alt, caption: content.caption})}
          />
          {content.caption && <figcaption className="mt-3 md:mt-4 text-center text-xs md:text-sm text-slate-400 italic leading-relaxed px-4">{content.caption}</figcaption>}
        </figure>
      );

    case 'code':
      return <CodeBlockDetails content={content} />;

    case 'callout':
      const colors = {
        info: 'bg-blue-50 border-blue-100 text-blue-900 dark:bg-blue-900/20 dark:border-blue-900/50',
        warning: 'bg-amber-50 border-amber-100 text-amber-900 dark:bg-amber-900/20 dark:border-amber-900/50',
        success: 'bg-emerald-50 border-emerald-100 text-emerald-900 dark:bg-emerald-900/20 dark:border-emerald-900/50',
        error: 'bg-red-50 border-red-100 text-red-900 dark:bg-red-900/20 dark:border-red-900/50',
        tip: 'bg-purple-50 border-purple-100 text-purple-900 dark:bg-purple-900/20 dark:border-purple-900/50',
      };
      return (
        <div className={cn("p-6 rounded-2xl border-l-4 my-8", colors[content.type as keyof typeof colors])}>
           <p className="font-bold text-lg">{content.text}</p>
        </div>
      );

    case 'timeline':
      return (
        <div className="my-12 relative space-y-12 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100 dark:before:bg-slate-800">
          {content.items.map((item: any, i: number) => (
            <div key={i} className="relative pl-12">
              <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-white dark:bg-slate-900 border-4 border-primary shadow-sm" />
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-primary">{item.date}</span>
                <h4 className="text-xl font-bold">{item.title}</h4>
                <p className="text-slate-500 text-lg">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      );

    case 'reference':
      return (
        <div className="mt-20 pt-12 border-t border-slate-100 dark:border-slate-800">
           <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-8">Data Sources & Bibliography</h4>
           <ol className="space-y-6">
              {content.items.map((item: any, i: number) => (
                <li key={i} className="flex gap-4">
                  <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-[10px] font-black text-slate-400">
                    {i + 1}
                  </span>
                  <div className="text-sm">
                    <p className="font-bold text-slate-700 dark:text-slate-300">{item.citation}</p>
                    {item.url && <a href={item.url} target="_blank" className="text-primary hover:underline block mt-1">{item.url}</a>}
                  </div>
                </li>
              ))}
           </ol>
        </div>
      );

    case 'list':
      const ListTag = content.type === 'bullet' ? 'ul' : 'ol';
      return (
        <ListTag className={cn(
          "space-y-4 my-8",
          content.type === 'bullet' ? "list-disc pl-6" : "list-decimal pl-6"
        )}>
          {content.items.map((item: string, i: number) => (
            <li key={i} className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed pl-2">
              {item}
            </li>
          ))}
        </ListTag>
      );

    default:
      return null;
  }
}
