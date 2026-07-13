import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, useScroll, useSpring } from 'framer-motion';
import { blogApi } from '../api/blog.api';
import { Clock, User, Calendar, ChevronLeft, Share2, Type, Eye, EyeOff, Quote } from 'lucide-react';
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
      title: post.title,
      text: post.subtitle || post.excerpt,
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
        <header className="relative pt-12 md:pt-20 pb-12 md:pb-16 px-4 md:px-6 max-w-7xl mx-auto space-y-6 md:space-y-8 xl:pl-32">
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
        "max-w-[1600px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-16 transition-all duration-700",
        !isFocusMode ? "xl:pl-32 xl:pr-12" : "max-w-3xl py-12 md:py-20"
      )}>
        <div className="space-y-12">
          <div
            id="chronicle-content"
            className={cn(
              "prose prose-xl md:prose-2xl dark:prose-invert max-w-none transition-all duration-500 font-medium",
              fontTheme === 'serif' ? "font-editorial" : "font-sans leading-relaxed"
            )}
          >
            {post.blocks.map((block: any) => (
              <div key={block.id} id={block.id} className="mb-12 scroll-mt-32">
                {renderBlock(block, setActiveImage)}
              </div>
            ))}
          </div>
        </div>

        {/* Sticky Sidebar for desktop */}
        {!isFocusMode && (
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
        1: 'text-4xl sm:text-5xl md:text-7xl font-black mb-4 md:mb-6',
        2: 'text-3xl sm:text-4xl md:text-6xl font-bold mb-4 md:mb-6 pt-10 md:pt-16',
        3: 'text-2xl sm:text-3xl md:text-5xl font-bold mb-3 md:mb-4 pt-6 md:pt-10',
      }[content.level as 1 | 2 | 3] || 'text-xl font-bold';
      return (
        <div className="mb-12">
          <Tag className={cn(classes, "font-editorial italic")} dangerouslySetInnerHTML={{ __html: content.text }} />
          {content.subtext && (
            <p className="text-xl md:text-2xl text-muted-foreground font-medium border-l-4 border-primary/20 pl-8 py-2 mt-4" dangerouslySetInnerHTML={{ __html: content.subtext }} />
          )}
        </div>
      );

    case 'paragraph':
      return <div className="text-lg sm:text-xl md:text-2xl leading-[1.6] mb-10 text-slate-700 dark:text-slate-300" dangerouslySetInnerHTML={{ __html: content.text }} />;

    case 'image':
      return (
        <figure className="my-16 md:my-24">
          <div className="rounded-[2.5rem] md:rounded-[4rem] overflow-hidden shadow-[0_30px_100px_-20px_rgba(0,0,0,0.3)]">
            <img
              src={content.url}
              alt={content.alt}
              className="w-full h-auto cursor-zoom-in hover:scale-[1.02] transition-transform duration-1000 ease-out"
              onClick={() => onImageClick?.({src: content.url, alt: content.alt, caption: content.caption})}
            />
          </div>
          {content.caption && <figcaption className="mt-8 text-center text-sm md:text-base text-slate-400 italic leading-relaxed px-6 font-medium">/ {content.caption}</figcaption>}
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
        <div className="my-12 overflow-x-auto glass rounded-[2rem] border border-white/5 shadow-2xl">
          <table className="w-full border-collapse">
            {content.headers && (
              <thead>
                <tr className="bg-slate-100/50 dark:bg-white/5">
                  {content.headers.map((header, i) => (
                    <th key={i} className="p-10 border-b border-r border-slate-100 dark:border-white/10 text-left font-black text-[10px] uppercase tracking-[0.3em] text-primary" dangerouslySetInnerHTML={{ __html: header }} />
                  ))}
                </tr>
              </thead>
            )}
            <tbody>
              {content.rows.map((row, ri) => (
                <tr key={ri} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                  {row.map((cell, ci) => (
                    <td key={ci} className="p-10 border-b border-r border-slate-100 dark:border-white/10 text-lg md:text-xl text-slate-700 dark:text-slate-300 leading-relaxed font-medium min-w-[300px]">
                        <TableCell content={cell} onImageClick={onImageClick} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    case 'faq':
      return (
        <div className="my-20 space-y-6">
          {content.items.map((item: any, i: number) => (
            <div key={i} className="p-12 rounded-[3rem] bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 shadow-sm group hover:shadow-xl transition-all duration-500">
              <h4 className="text-2xl md:text-3xl font-black mb-6 flex items-start gap-5">
                 <span className="w-10 h-10 flex-shrink-0 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-xs font-black">Q</span>
                 <span dangerouslySetInnerHTML={{ __html: item.question }} />
              </h4>
              <div className="pl-14 text-lg md:text-xl text-slate-500 dark:text-slate-400 leading-relaxed font-medium" dangerouslySetInnerHTML={{ __html: item.answer }} />
            </div>
          ))}
        </div>
      );

    case 'quote':
      return (
        <div className="my-20 relative p-16 rounded-[4rem] bg-primary/5 border border-primary/10 group">
           <Quote className="absolute top-10 left-10 text-primary/20 group-hover:scale-110 transition-transform duration-700" size={80} />
           <div className="relative z-10 text-center space-y-8">
              <p className="text-3xl md:text-5xl font-editorial italic font-black leading-tight tracking-tight text-slate-900 dark:text-white" dangerouslySetInnerHTML={{ __html: content.text }} />
              <div className="space-y-1">
                 <p className="text-sm font-black uppercase tracking-[0.4em] text-primary">— {content.author}</p>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{content.source}</p>
              </div>
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
