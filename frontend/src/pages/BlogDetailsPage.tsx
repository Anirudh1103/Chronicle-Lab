import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, useScroll, useSpring } from 'framer-motion';
import { blogApi } from '../api/blog.api';
import { Clock, User, Calendar, ChevronLeft, Share2, Type, Eye, EyeOff, Quote, Sparkles, Maximize2 } from 'lucide-react';
import { ReadingNavigator } from '../components/blog/ReadingNavigator';
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
    <div className="my-12 rounded-[2.5rem] overflow-hidden bg-slate-900 shadow-2xl border border-white/5 group">
      <div className="px-8 py-4 bg-slate-800/50 flex justify-between items-center">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
          {content.filename || content.language}
        </span>
        <button
          onClick={handleCopy}
          className="p-2 hover:bg-white/10 rounded-xl transition-all text-slate-400 hover:text-white"
        >
          {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
        </button>
      </div>
      <div className="relative">
        <pre className="p-8 overflow-x-auto text-base font-mono text-slate-300 leading-relaxed scrollbar-thin scrollbar-thumb-slate-800">
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

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await blogApi.getPostBySlug(slug!);
        setPost({
          ...data,
          blocks: data.blocks.map((b: any) => ({
            ...b,
            content: typeof b.content === 'string' ? JSON.parse(b.content) : b.content
          }))
        });
        document.title = `${data.title} | Chronicle Lab`;
      } catch (error) {
        console.error("Error fetching post:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    window.scrollTo(0, 0);
  }, [slug]);

  const handleShare = async () => {
    const shareData = {
      title: post?.title,
      text: post?.subtitle || post?.excerpt,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('Chronicle link copied to clipboard.');
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-2xl animate-pulse">Loading Chronicle...</div>;
  if (!post) return <div className="min-h-screen flex items-center justify-center font-bold text-2xl">Chronicle not found.</div>;

  const personalInsights = post.blocks.filter((b: any) => b.type === 'personalTouch');
  const mainContentBlocks = post.blocks.filter((b: any) => b.type !== 'personalTouch');
  const hasPersonalInsights = personalInsights.length > 0;

  return (
    <div className={cn("min-h-screen bg-background pb-32 transition-all duration-700", isFocusMode && "pt-0")}>
      {!isFocusMode && <ReadingNavigator blocks={post.blocks} />}

      {/* Top Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1.5 bg-primary origin-left z-[200]"
        style={{ scaleX }}
      />

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
        <header className={cn(
          "relative pt-12 md:pt-20 pb-12 md:pb-16 px-4 md:px-6 mx-auto space-y-6 md:space-y-8 transition-all duration-700",
          hasPersonalInsights ? "max-w-7xl xl:pl-32" : "max-w-5xl"
        )}>
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
              <div className="flex flex-wrap items-center gap-4 md:gap-6 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400">
                <span className="flex items-center gap-1.5"><Calendar size={12} className="md:w-3.5 md:h-3.5" /> {new Date(post.createdAt).toLocaleDateString()}</span>
                <span className="flex items-center gap-1.5"><Clock size={12} className="md:w-3.5 md:h-3.5" /> {post.readingTime} Min Read</span>
              </div>

              <button
                onClick={handleShare}
                className="ml-auto p-2 hover:bg-slate-100 rounded-full dark:hover:bg-slate-800 transition-colors"
              >
                <Share2 size={18} className="md:w-5 md:h-5" />
              </button>
            </div>
          </div>
        </header>
      )}

      <main className={cn(
        "mx-auto px-6 transition-all duration-700",
        !isFocusMode
          ? hasPersonalInsights
            ? "max-w-[1800px] grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-16 lg:gap-24 xl:pl-32"
            : "max-w-5xl"
          : "max-w-4xl py-12 md:py-20"
      )}>
        <div className="space-y-12">
          <div
            id="chronicle-content"
            className={cn(
              "prose prose-xl md:prose-2xl dark:prose-invert max-w-none transition-all duration-500 font-medium",
              fontTheme === 'serif' ? "font-editorial" : "font-sans leading-relaxed"
            )}
          >
            {mainContentBlocks.map((block: any) => (
              <div key={block.id} id={block.id} className="mb-12 scroll-mt-32">
                {renderBlock(block, setActiveImage)}
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar for desktop */}
        {!isFocusMode && hasPersonalInsights && (
          <aside className="hidden lg:block">
           <div className="sticky top-32 space-y-12">
              <div className="p-10 rounded-[3rem] bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 space-y-8 shadow-sm backdrop-blur-xl">
                 <div className="flex items-center gap-3 text-primary">
                    <User size={20} />
                    <h4 className="text-xs font-black uppercase tracking-[0.2em]">Author</h4>
                 </div>
                 <div className="space-y-6">
                    <div className="flex items-center gap-4">
                       <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-primary/20">
                          {post.author.name[0]}
                       </div>
                       <div>
                          <p className="font-black text-slate-900 dark:text-white uppercase text-sm tracking-widest">{post.author.name}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Chronicle Lab</p>
                       </div>
                    </div>
                    <p className="text-base text-slate-500 font-medium leading-relaxed border-t border-slate-100 dark:border-white/5 pt-6">
                      {post.excerpt || "A deep dive exploration into the intersection of technology and history."}
                    </p>
                 </div>
              </div>

              {/* Personal Insights Sidebar Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 px-6">
                  <Sparkles size={14} className="text-primary" />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">Personal Insights</span>
                </div>
                {personalInsights.map((insight: any) => (
                  <div key={insight.id} className="p-8 rounded-[2.5rem] bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-white/5 backdrop-blur-xl shadow-sm dark:shadow-xl">
                      <p className="text-base text-slate-600 dark:text-slate-300 font-medium leading-relaxed italic" dangerouslySetInnerHTML={{ __html: insight.content.text }} />
                  </div>
                ))}
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
    case 'subheading':
      const Tag = `h${content.level}` as any;
      const classes = {
        1: 'text-4xl sm:text-5xl md:text-7xl font-black mb-4 md:mb-6',
        2: 'text-3xl sm:text-4xl md:text-6xl font-bold mb-4 md:mb-6 pt-10 md:pt-16',
        3: 'text-2xl sm:text-3xl md:text-5xl font-bold mb-3 md:mb-4 pt-6 md:pt-10',
      }[content.level as 1 | 2 | 3] || 'text-xl font-bold';
      return (
        <div className={cn("mb-12", type === 'subheading' && "pl-4 md:pl-8 border-l-4 border-primary/10 ml-2 md:ml-4")}>
          <Tag className={cn(classes, "font-editorial italic", type === 'subheading' && "text-slate-800 dark:text-slate-200")} dangerouslySetInnerHTML={{ __html: content.text }} />
          {content.subtext && (
            <p className="text-xl md:text-2xl text-muted-foreground font-medium border-l-4 border-primary/20 pl-8 py-2 mt-4" dangerouslySetInnerHTML={{ __html: content.subtext }} />
          )}
        </div>
      );

    case 'paragraph':
      return <div className="text-lg sm:text-xl md:text-2xl leading-[1.6] mb-10 text-slate-700 dark:text-slate-300" dangerouslySetInnerHTML={{ __html: content.text }} />;

    case 'image':
      return (
        <figure className="my-20 md:my-32 relative group">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            {/* Soft Glow Background */}
            <div className="absolute -inset-4 bg-primary/5 blur-3xl rounded-[4rem] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

            <div
              className="relative rounded-[2.5rem] md:rounded-[4rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.4)] border border-white/5 cursor-zoom-in"
              onClick={() => onImageClick?.({src: content.url, alt: content.alt, caption: content.caption})}
            >
              <motion.img
                src={content.url}
                alt={content.alt}
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                className="w-full h-auto"
              />

              {/* Interactive Overlay */}
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                <div className="p-5 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 text-white scale-90 group-hover:scale-100 transition-transform duration-500">
                  <Maximize2 size={32} strokeWidth={1.5} />
                </div>
              </div>
            </div>

            {content.caption && (
              <div className="mt-8 flex flex-col items-center">
                <div className="h-px w-12 bg-primary/30 mb-6" />
                <figcaption className="text-center max-w-2xl px-6">
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary block mb-2 opacity-50">Visual Asset</span>
                  <p className="text-base md:text-lg text-slate-400 font-editorial italic leading-relaxed">
                    {content.caption}
                  </p>
                </figcaption>
              </div>
            )}
          </motion.div>
        </figure>
      );

    case 'code':
      return <CodeBlockDetails content={content} />;

    case 'callout':
      const colors = {
        info: 'bg-blue-50/50 border-blue-200 text-blue-900 dark:bg-blue-900/10 dark:border-blue-900/30',
        warning: 'bg-amber-50/50 border-amber-100 text-amber-900 dark:bg-amber-900/10 dark:border-amber-900/30',
        success: 'bg-emerald-50/50 border-emerald-200 text-emerald-900 dark:bg-emerald-900/10 dark:border-emerald-900/30',
        error: 'bg-red-50/50 border-red-100 text-red-900 dark:bg-red-900/10 dark:border-red-900/30',
        tip: 'bg-purple-50/50 border-purple-100 text-purple-900 dark:bg-purple-900/10 dark:border-purple-900/30',
      };
      return (
        <div className={cn("p-10 rounded-[3rem] border-l-[6px] my-16 shadow-sm", colors[content.type as keyof typeof colors])}>
           <p className="font-bold text-xl md:text-2xl leading-relaxed" dangerouslySetInnerHTML={{ __html: content.text }} />
        </div>
      );

    case 'timeline':
      return (
        <div className="my-20 relative space-y-16 before:absolute before:left-[15px] before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-100 dark:before:bg-white/5">
          {content.items.map((item: any, i: number) => (
            <div key={i} className="relative pl-16 group">
              <div className="absolute left-0 top-2 w-8 h-8 rounded-full bg-background border-4 border-primary shadow-[0_0_15px_rgba(59,130,246,0.5)] group-hover:scale-125 transition-transform" />
              <div className="space-y-2">
                <span className="text-xs font-black uppercase tracking-[0.3em] text-primary" dangerouslySetInnerHTML={{ __html: item.date }} />
                <h4 className="text-2xl md:text-3xl font-black tracking-tight" dangerouslySetInnerHTML={{ __html: item.title }} />
                <p className="text-slate-500 text-lg md:text-xl font-medium leading-relaxed" dangerouslySetInnerHTML={{ __html: item.description }} />
              </div>
            </div>
          ))}
        </div>
      );

    case 'reference':
      return (
        <div className="mt-32 pt-16 border-t border-slate-100 dark:border-white/5">
           <h4 className="text-xs font-black uppercase tracking-[0.4em] text-slate-400 mb-12">Archived Evidence & Sources</h4>
           <ol className="space-y-10">
              {content.items.map((item: any, i: number) => (
                <li key={i} className="flex gap-6 group">
                  <span className="flex-shrink-0 w-10 h-10 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-[10px] font-black text-slate-400 group-hover:bg-primary group-hover:text-white transition-all">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div className="text-base md:text-lg">
                    <p className="font-bold text-slate-700 dark:text-slate-300 leading-snug" dangerouslySetInnerHTML={{ __html: item.citation }} />
                    {item.url && <a href={item.url} target="_blank" className="text-primary hover:underline block mt-2 opacity-70 hover:opacity-100 transition-opacity truncate max-w-xl">{item.url}</a>}
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
          content.type === 'bullet' ? "list-disc pl-10" : "list-decimal pl-10"
        )}>
          {content.items.map((item: string, i: number) => (
            <li key={i} className="text-lg md:text-2xl text-slate-700 dark:text-slate-300 leading-relaxed pl-2" dangerouslySetInnerHTML={{ __html: item }} />
          ))}
        </ListTag>
      );

    case 'table':
      return (
        <div className="my-12 overflow-x-auto glass rounded-[1.5rem] md:rounded-[2rem] border border-slate-200 dark:border-white/5 shadow-2xl no-scrollbar">
          <table className="w-full border-collapse min-w-[600px] md:min-w-full">
            {content.headers && (
              <thead>
                <tr className="bg-slate-100/50 dark:bg-white/5">
                  {content.headers.map((header: string, i: number) => (
                    <th key={i} className="p-4 md:p-10 border-b border-r border-slate-200 dark:border-white/10 text-left font-black text-[9px] md:text-[10px] uppercase tracking-[0.2em] md:tracking-[0.3em] text-primary" dangerouslySetInnerHTML={{ __html: header }} />
                  ))}
                </tr>
              </thead>
            )}
            <tbody>
              {content.rows.map((row: any[], ri: number) => (
                <tr key={ri} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                  {row.map((cell: any, ci: number) => (
                    <td key={ci} className="p-4 md:p-10 border-b border-r border-slate-200 dark:border-white/10 text-base md:text-xl text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                        <TableCell content={cell} onImageClick={onImageClick} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    case 'divider':
      return (
        <div className="py-16 flex items-center justify-center">
          <div className="w-full h-px bg-slate-100 dark:bg-white/5 relative">
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-6">
              <div className="flex gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary/20" />
                <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                <div className="w-1.5 h-1.5 rounded-full bg-primary/20" />
              </div>
            </div>
          </div>
        </div>
      );

    case 'video':
      const getEmbedUrl = (url: string) => {
        if (!url) return '';
        const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/))([\w-]{11})/);
        if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
        const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
        if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
        return url;
      };
      const embedUrl = getEmbedUrl(content.url);
      if (!embedUrl) return null;
      return (
        <figure className="my-16 md:my-24 space-y-6">
          <div className="relative aspect-video rounded-[2.5rem] md:rounded-[3.5rem] overflow-hidden shadow-2xl border border-white/5">
            <iframe
              src={embedUrl}
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          {content.caption && <figcaption className="text-center text-sm text-slate-400 italic">/ {content.caption}</figcaption>}
        </figure>
      );

    case 'button':
      return (
        <div className={cn(
          "my-12 flex",
          content.alignment === 'left' && "justify-start",
          content.alignment === 'center' && "justify-center",
          content.alignment === 'right' && "justify-end"
        )}>
          <a
            href={content.url}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-sm transition-all hover:scale-105 active:scale-95 shadow-xl shadow-primary/20 bg-primary text-white"
            )}
          >
            {content.text}
          </a>
        </div>
      );

    case 'quote':
      return (
        <div className="my-20 relative p-16 rounded-[4rem] bg-primary/5 border border-primary/10 group">
           <Quote className="absolute top-10 left-10 text-primary/20 group-hover:scale-110 transition-transform duration-700" size={80} />
           <div className="relative z-10 text-center space-y-8">
              <p className="text-3xl md:text-5xl font-sans font-black leading-[1.1] tracking-tighter text-slate-900 dark:text-white" dangerouslySetInnerHTML={{ __html: content.text }} />
              {(content.author || content.source) && (
                <div className="space-y-1">
                  {content.author && <p className="text-sm font-black uppercase tracking-[0.4em] text-primary">— <span dangerouslySetInnerHTML={{ __html: content.author }} /></p>}
                  {content.source && <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest" dangerouslySetInnerHTML={{ __html: content.source }} />}
                </div>
              )}
           </div>
        </div>
      );

    default:
      return null;
  }
}

function TableCell({ content, onImageClick }: { content: string, onImageClick?: (img: any) => void }) {
    const hasImage = content.includes('<img');

    if (hasImage) {
      const srcMatch = content.match(/src="([^"]+)"/);
      const altMatch = content.match(/alt="([^"]+)"/);
      const src = srcMatch ? srcMatch[1] : '';
      const alt = altMatch ? altMatch[1] : '';

      return (
        <button
          onClick={() => onImageClick?.({ src, alt })}
          className="w-full flex justify-center hover:scale-105 transition-transform duration-300 cursor-zoom-in"
        >
          <div dangerouslySetInnerHTML={{ __html: content }} className="flex justify-center" />
        </button>
      );
    }

    return <div dangerouslySetInnerHTML={{ __html: content }} />;
  }
