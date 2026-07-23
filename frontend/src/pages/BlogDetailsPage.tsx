import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, useScroll, useSpring, useMotionValueEvent, AnimatePresence } from 'framer-motion';
import { blogApi } from '../api/blog.api';
import { Clock, User, Calendar, ChevronLeft, Share2, Type, Eye, EyeOff, Quote, Sparkles, Maximize2, BookOpen, Compass, Home } from 'lucide-react';
import { ReadingNavigator } from '../components/blog/ReadingNavigator';
import { ReadingCompanion } from '../components/blog/ReadingCompanion';
import { useReadingProgress } from '../hooks/useReadingProgress';
import { Lightbox } from '../components/blog/Lightbox';
import { Copy, Check } from 'lucide-react';
import { cn } from '../utils/cn';
import { stripHtml } from '../utils/stripHtml';

// TTS & Glossary Imports
import { highlightGlossary as highlightGlossaryOriginal } from '../utils/glossary';
import { parseNarration } from '../services/narrationParser';
import { useArticleTTS } from '../hooks/useArticleTTS';
import { ArticleAudioPlayer } from '../components/blog/ArticleAudioPlayer';
import { ArticleAudioMiniPlayer } from '../components/blog/ArticleAudioMiniPlayer';
import { useQuery } from '@tanstack/react-query';
import api from '../api/client';
import { Reactions } from '../components/blog/Reactions';
import { CommentSection } from '../components/blog/CommentSection';
import { createPortal } from 'react-dom';
import { KnowledgeGraph } from '../components/blog/KnowledgeGraph';
import { ChronicleCompletion } from '../components/blog/ChronicleCompletion';
import { PostCard } from '../components/PostCard';
import { useAuthStore } from '../store/authStore';
import { X } from 'lucide-react';
import { getUploadUrl } from '../utils/url';
import { SimpleLoadingScreen } from '../components/blog/SimpleLoadingScreen';
import { BlogGallery } from '../components/blog/BlogGallery';
import { buildHierarchyTree } from '../utils/hierarchy';
import { OutlineNavigation } from '../components/blog/OutlineNavigation';

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

let globalGlossaryList: any[] = [];

function highlightGlossary(text: string | null | undefined) {
  return highlightGlossaryOriginal(text, globalGlossaryList);
}

export const BlogDetailsPage: React.FC = () => {
  const { slug } = useParams();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isLoaderFinished, setIsLoaderFinished] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [fontTheme, setFontTheme] = useState<'serif' | 'sans'>('serif');
  const [activeImage, setActiveImage] = useState<{src: string, alt?: string, caption?: string} | null>(null);

  const { user } = useAuthStore();
  const [selectedGlossaryTerm, setSelectedGlossaryTerm] = useState<{ term: string; definition: string } | null>(null);
  const [activeReadingSeconds, setActiveReadingSeconds] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        setActiveReadingSeconds(prev => prev + 1);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Glossary states
  const [activeTerm, setActiveTerm] = useState<{ term: string; definition: string } | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Load dynamic glossary terms from database
  const { data: glossaryList = [] } = useQuery<any[]>({
    queryKey: ['glossary'],
    queryFn: async () => {
      const { data } = await api.get('glossary');
      return data;
    }
  });

  globalGlossaryList = glossaryList;

  // Load related posts from database
  const { data: allPosts = [] } = useQuery<any[]>({
    queryKey: ['posts'],
    queryFn: async () => {
      return blogApi.getAllPosts();
    }
  });

  const relatedPosts = useMemo(() => {
    if (!post) return [];
    return allPosts
      .filter((p: any) => p.id !== post.id && p.status === 'published' && p.category?.id === post.category?.id)
      .slice(0, 3); // Display 3 related articles
  }, [allPosts, post]);

  // Scroll variables
  const [percent, setPercent] = useState(0);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    setPercent(Math.round(latest * 100));
  });

  // Reading Companion Hooks
  const { activeId } = useReadingProgress(post?.blocks || []);

  const allHeadings = useMemo(() =>
    (post?.blocks || []).filter((b: any) => (b.type === 'heading' || b.type === 'subheading') && b.content.level > 1 && stripHtml(b.content.text) !== ''),
    [post?.blocks]
  );

  const activeHeadingBlock = useMemo(() => {
    if (!activeId) return allHeadings[0] || null;
    return allHeadings.find((h: any) => h.id === activeId) || allHeadings[0] || null;
  }, [activeId, allHeadings]);

  const remainingTimeMinutes = useMemo(() => {
    const blocks = post?.blocks || [];
    if (blocks.length === 0) return 0;

    let activeBlockIndex = 0;
    if (activeId) {
      activeBlockIndex = blocks.findIndex((b: any) => b.id === activeId);
      if (activeBlockIndex === -1) activeBlockIndex = 0;
    }

    let totalWords = 0;
    for (let i = activeBlockIndex; i < blocks.length; i++) {
      const block = blocks[i];
      if (block.content && typeof block.content.text === 'string') {
        const cleanText = stripHtml(block.content.text);
        const words = cleanText.split(/\s+/).filter(Boolean).length;
        totalWords += words;
      }
    }

    return Math.max(1, Math.ceil(totalWords / 200));
  }, [post?.blocks, activeId]);

  // TTS Narration Parsing
  const narrationChunks = useMemo(() => {
    if (!post) return [];
    return parseNarration(post.title, post.subtitle, post.blocks || [], post.summary, post.summaryTitle);
  }, [post]);

  const {
    status: ttsStatus,
    currentChunkIndex,
    spokenWordRange,
    currentBlockId,
    voices,
    selectedVoiceName,
    rate: ttsRate,
    play: playTTS,
    pause: pauseTTS,
    stop: stopTTS,
    skipForward: skipForwardTTS,
    skipBackward: skipBackwardTTS,
    setRate: setRateTTS,
    setVoice: setVoiceTTS
  } = useArticleTTS({ chunks: narrationChunks });

  const [miniPlayerVisible, setMiniPlayerVisible] = useState(false);
  const [autoFollow, setAutoFollow] = useState(true);
  const lastAutoScrollTime = useRef(0);
  const playerRef = useRef<HTMLDivElement>(null);

  // Intersection observer to toggle floating mini-player
  useEffect(() => {
    if (ttsStatus === 'idle' || ttsStatus === 'completed') {
      setMiniPlayerVisible(false);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        setMiniPlayerVisible(!entry.isIntersecting);
      },
      { threshold: 0 }
    );
    const element = playerRef.current;
    if (element) {
      observer.observe(element);
    }
    return () => {
      if (element) observer.unobserve(element);
    };
  }, [ttsStatus]);

  // Scroll listener to temporarily disable auto-follow if manually scrolling
  useEffect(() => {
    const handleScroll = () => {
      if (Date.now() - lastAutoScrollTime.current > 1000) {
        setAutoFollow(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Smooth scroll current sentence into view
  useEffect(() => {
    if (narrationChunks[currentChunkIndex] && autoFollow) {
      const activeChunkId = narrationChunks[currentChunkIndex].id;
      const element = document.getElementById(activeChunkId);
      if (element) {
        lastAutoScrollTime.current = Date.now();
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [currentChunkIndex, autoFollow, narrationChunks]);

  const parts = useMemo(() => buildHierarchyTree(post?.blocks || []), [post?.blocks]);
  const hasParts = parts.length > 0;

  const handleGlossaryInteraction = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const isGlossaryTerm = target.classList.contains('glossary-term');
    
    if (isGlossaryTerm) {
      const termKey = target.getAttribute('data-term');
      if (termKey) {
        const match = glossaryList.find(item => item.term.toLowerCase() === termKey.toLowerCase());
        if (match) {
          const rect = target.getBoundingClientRect();
          setTooltipPos({
            x: rect.left + rect.width / 2,
            y: rect.top - 10,
          });
          setActiveTerm({ term: match.term, definition: match.definition });
          return;
        }
      }
    }
    setActiveTerm(null);
  };

  const scrollToPlayer = () => {
    if (playerRef.current) {
      playerRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await blogApi.getPostBySlug(slug!);
        if (data) {
          const rawBlocks = Array.isArray(data.blocks) ? data.blocks : [];
          const processedBlocks = rawBlocks.map((b: any) => {
            let content = b.content;
            if (typeof content === 'string') {
              try {
                content = JSON.parse(content);
              } catch {
                // Keep original content if not JSON
              }
            }
            return { ...b, content };
          });

          setPost({
            ...data,
            blocks: processedBlocks,
          });
          document.title = `${data.title || 'Chronicle'} | Chronicle Lab`;
          // Record page view dynamically in background using sendBeacon for 0ms network impact
          const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
          const beaconUrl = `${apiUrl}/analytics/view`;
          const payload = JSON.stringify({ slug: slug! });
          if (navigator.sendBeacon) {
            const blob = new Blob([payload], { type: 'application/json' });
            navigator.sendBeacon(beaconUrl, blob);
          } else {
            fetch(beaconUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: payload,
              keepalive: true,
            }).catch(() => {});
          }
        }
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
      if (post?.id) {
        await blogApi.sharePost(post.id);
      }
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

  if (loading) return <SimpleLoadingScreen />;
  if (!post) return <div className="min-h-screen flex items-center justify-center font-bold text-2xl">Chronicle not found.</div>;

  const personalInsights = post.blocks.filter((b: any) => b.type === 'personalTouch');
  const mainContentBlocks = post.blocks.filter((b: any) => b.type !== 'personalTouch');
  const hasPersonalInsights = personalInsights.length > 0;

  const handleNavigate = (blockId: string, slug: string) => {
    window.location.hash = slug;
    const element = document.getElementById(blockId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className={cn("min-h-screen bg-background pb-32 transition-all duration-700", isFocusMode && "pt-0")}>
      {!isFocusMode && (
        hasParts ? (
          <OutlineNavigation
            postId={post.id}
            parts={parts}
            activeBlockId={activeId}
            onNavigate={handleNavigate}
          />
        ) : (
          <ReadingNavigator blocks={post.blocks} />
        )
      )}

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
         <div className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-xl font-mono text-[10px] font-black tracking-wider select-none shrink-0">
           <Clock size={11} className="animate-spin" style={{ animationDuration: '8s' }} />
           <span>{formatTimer(activeReadingSeconds)}</span>
         </div>
         <div className="w-px h-4 bg-slate-200 dark:bg-slate-800" />
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
        <header className="relative pt-12 md:pt-20 pb-12 md:pb-16 px-4 md:px-6 mx-auto space-y-6 md:space-y-8 transition-all duration-700 max-w-[1700px] lg:pr-[380px] xl:pr-[420px]">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-primary transition-colors mb-2">
            <ChevronLeft size={16} /> <span className="hidden sm:inline">Back to Chronicles</span><span className="sm:hidden">Back</span>
          </Link>

          <div className="space-y-4 md:space-y-6">
            <div className="flex flex-wrap items-center gap-2 md:gap-3">
               {post.categories?.map((cat: any) => (
                 <span key={cat.id} className="px-2 md:px-3 py-1 bg-primary/10 text-primary text-[9px] md:text-[10px] font-black uppercase tracking-widest rounded-full">
                    {cat.name}
                 </span>
               ))}
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

            {post.coverImage && (
              <div className="my-6 rounded-[2.5rem] overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/5 shadow-2xl">
                <img
                  src={getUploadUrl(post.coverImage)}
                  alt={post.title}
                  className="w-full h-auto max-h-[550px] object-cover"
                  decoding="async"
                />
              </div>
            )}

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

            {/* Mobile/Tablet Reading Companion (Hidden on desktop) */}
            <div className="block lg:hidden mt-6 p-6 rounded-3xl bg-slate-50 dark:bg-slate-900/30 border border-slate-150 dark:border-white/5 space-y-4 text-left">
              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                <span className="text-amber-500">Active Reading Companion</span>
                <span>{percent}% Read</span>
              </div>
              <div className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: `${percent}%` }} />
              </div>
              <div className="flex flex-col gap-2 pt-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                <div>
                  <span className="text-slate-400 dark:text-slate-500 uppercase text-[9px] tracking-widest block mb-0.5">Current Section</span>
                  <span className="text-slate-900 dark:text-white font-editorial italic text-sm">{activeHeadingBlock ? stripHtml(activeHeadingBlock.content.text) : 'Introduction'}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-white/5 mt-1">
                  <span>Remaining Time:</span>
                  <span className="font-black text-slate-900 dark:text-white">{remainingTimeMinutes} min left</span>
                </div>
              </div>
            </div>
          </div>
        </header>
      )}

      <main className={cn(
        "mx-auto px-6 md:px-12 transition-all duration-700",
        !isFocusMode
          ? "w-full max-w-[1700px] grid grid-cols-1 gap-16 lg:gap-20 lg:grid-cols-[1fr_380px] xl:grid-cols-[1fr_420px]"
          : "max-w-5xl py-12 md:py-20"
      )}>
        <div className="w-full">
          {/* Main Audio Narration Player */}
          {!isFocusMode && (
            <div ref={playerRef}>
              <ArticleAudioPlayer
                status={ttsStatus}
                currentChunkIndex={currentChunkIndex}
                spokenWordRange={spokenWordRange}
                rate={ttsRate}
                voices={voices}
                selectedVoiceName={selectedVoiceName}
                chunks={narrationChunks}
                readingTime={post.readingTime}
                play={playTTS}
                pause={pauseTTS}
                stop={stopTTS}
                skipForward={skipForwardTTS}
                skipBackward={skipBackwardTTS}
                setRate={setRateTTS}
                setVoice={setVoiceTTS}
              />
            </div>
          )}

          {post.summary && (
            <div className="mb-12 p-8 md:p-10 rounded-[2.5rem] bg-gradient-to-br from-primary/5 via-slate-50/50 to-primary/5 dark:from-primary/10 dark:via-slate-900/30 dark:to-primary/10 border border-primary/10 dark:border-white/5 relative overflow-hidden shadow-sm">
               <div className="absolute -top-6 -right-6 text-primary/5 pointer-events-none">
                 <Sparkles size={120} />
               </div>
               
               <div className="flex items-center gap-3 mb-6">
                 <div className="p-2.5 rounded-2xl bg-primary/10 text-primary">
                   <BookOpen size={20} />
                 </div>
                 <div>
                   <div className="text-lg font-sans font-black uppercase tracking-widest text-slate-900 dark:text-white">
                     {post.summaryTitle || 'Quick Read'}
                   </div>
                 </div>
               </div>

               <div className="text-base md:text-lg text-slate-700 dark:text-slate-300 font-medium leading-relaxed whitespace-pre-line space-y-3">
                  {post.summary}
               </div>
            </div>
          )}

          <div
            id="chronicle-content"
            className={cn(
              "prose prose-xl md:prose-2xl dark:prose-invert transition-all duration-500 font-medium max-w-none",
              fontTheme === 'serif' ? "font-editorial" : "font-sans leading-relaxed",
              hasPersonalInsights ? "lg:max-w-[1200px] xl:max-w-[1300px]" : "max-w-[1450px]"
            )}
            onMouseOver={handleGlossaryInteraction}
            onMouseLeave={() => setActiveTerm(null)}
            onClick={handleGlossaryInteraction}
          >
            {mainContentBlocks.map((block: any) => {
              const isActive = block.id === currentBlockId;
              return (
                <div
                  key={block.id}
                  id={block.id}
                  className={cn(
                    "mb-12 scroll-mt-32 transition-all duration-500 rounded-3xl",
                    isActive 
                      ? "border-l-4 border-primary pl-6 dark:border-primary opacity-100"
                      : "opacity-90 hover:opacity-100"
                  )}
                >
                  {renderBlock(block, setActiveImage, post.blocks)}
                </div>
              );
            })}

          </div>
 
          {/* Relocated Author and Personal Insights at the end of article content - Visible only on mobile/tablet since it is in the sidebar on desktop */}
          {!isFocusMode && (
            <div className="mt-16 pt-12 border-t border-slate-100 dark:border-white/5 grid grid-cols-1 md:grid-cols-2 gap-8 text-left max-w-5xl mx-auto select-none lg:hidden">
              {/* Author Card */}
              <div className="p-8 rounded-[2.5rem] bg-slate-50 dark:bg-slate-900/30 border border-slate-150 dark:border-white/5 space-y-6 shadow-sm">
                <div className="flex items-center gap-3 text-primary">
                  <User size={18} />
                  <h4 className="text-xs font-black uppercase tracking-[0.25em]">Author</h4>
                </div>
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-primary/20">
                      {post.author.name[0]}
                    </div>
                    <div>
                      <p className="font-black text-slate-900 dark:text-white uppercase text-sm tracking-widest">{post.author.name}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Chronicle Lab Researcher</p>
                    </div>
                  </div>
                  <p className="text-base text-slate-500 font-medium leading-relaxed border-t border-slate-100 dark:border-white/5 pt-6">
                    {post.excerpt || "A deep dive exploration into the intersection of technology and history."}
                  </p>
                </div>
              </div>

              {/* Personal Insights */}
              {hasPersonalInsights ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 px-6">
                    <Sparkles size={14} className="text-primary" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">Personal Insights</span>
                  </div>
                  <div className="space-y-4">
                    {personalInsights.map((insight: any) => (
                      <div key={insight.id} className="pl-6 py-4 border-l-4 border-primary bg-primary/5 dark:bg-primary/10 rounded-r-3xl rounded-l-none shadow-sm">
                        <p className="text-sm md:text-base text-slate-850 dark:text-slate-100 font-bold leading-relaxed italic" dangerouslySetInnerHTML={{ __html: insight.content.text }} />
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-8 rounded-[2.5rem] bg-slate-50 dark:bg-slate-900/30 border border-slate-150 dark:border-white/5 flex flex-col justify-center items-center text-center">
                  <span className="text-slate-400 dark:text-slate-500 font-bold text-xs uppercase tracking-widest mb-2">Chronicle Lab Archives</span>
                  <p className="text-sm text-slate-500 max-w-xs leading-relaxed">
                    This post is archived under {post.category?.name || 'History & Tech'}. Explore more archives in the main library collection.
                  </p>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Sidebar for desktop */}
        {!isFocusMode && (
          <aside className="hidden lg:block w-80 xl:w-96 flex-shrink-0 text-left">
            <div className="sticky top-32 space-y-8">
              <AnimatePresence mode="wait">
                {percent < 10 ? (
                  <motion.div
                    key="phase1"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-8"
                  >
                    {/* Author Card */}
                    <div className="p-8 rounded-[2.5rem] bg-slate-50 dark:bg-slate-900/30 border border-slate-150 dark:border-white/5 space-y-6 shadow-sm">
                      <div className="flex items-center gap-3 text-primary">
                        <User size={18} />
                        <h4 className="text-xs font-black uppercase tracking-[0.25em]">Author</h4>
                      </div>
                      <div className="space-y-6">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-primary/20">
                            {post.author.name[0]}
                          </div>
                          <div>
                            <p className="font-black text-slate-900 dark:text-white uppercase text-sm tracking-widest">{post.author.name}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Chronicle Lab Researcher</p>
                          </div>
                        </div>
                        <p className="text-base text-slate-500 font-medium leading-relaxed border-t border-slate-100 dark:border-white/5 pt-6">
                          {post.excerpt || "A deep dive exploration into the intersection of technology and history."}
                        </p>
                      </div>
                    </div>

                    {/* Personal Insights Card */}
                    {hasPersonalInsights && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 px-6">
                          <Sparkles size={14} className="text-primary" />
                          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">Personal Insights</span>
                        </div>
                        {personalInsights.map((insight: any) => (
                          <div key={insight.id} className="pl-6 py-4 border-l-4 border-primary bg-primary/5 dark:bg-primary/10 rounded-r-3xl rounded-l-none shadow-sm">
                            <p className="text-sm md:text-base text-slate-850 dark:text-slate-100 font-bold leading-relaxed italic" dangerouslySetInnerHTML={{ __html: insight.content.text }} />
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="phase2"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-8"
                  >
                    <ReadingCompanion
                      blocks={post.blocks}
                      activeId={activeId}
                      percent={percent}
                    />

                    {/* Near the end: Related Articles inside sidebar */}
                    {percent >= 85 && relatedPosts.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-6 rounded-[2rem] bg-slate-50 dark:bg-slate-900/30 border border-slate-150 dark:border-white/5 space-y-4"
                      >
                        <div className="space-y-1">
                          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Continue Exploring</span>
                          <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">Related Chronicles</h4>
                        </div>
                        <div className="space-y-3">
                          {relatedPosts.slice(0, 2).map((rPost: any) => (
                            <Link
                              key={rPost.id}
                              to={`/blog/${rPost.slug}`}
                              className="block p-3.5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-150 dark:border-white/5 hover:border-primary transition-all text-left"
                            >
                              <span className="text-[9px] font-black uppercase tracking-widest text-primary block mb-1">
                                {rPost.category?.name || 'Archive'}
                              </span>
                              <h5 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                                {rPost.title}
                              </h5>
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </aside>
        )}
      </main>

      {/* Chronicle Reading Completion Experience */}
      {!isFocusMode && (
        <div className="max-w-7xl mx-auto px-6 mt-16 space-y-16">
          <ChronicleCompletion
            post={post}
            user={user}
            activeSeconds={activeReadingSeconds}
          />

          {/* Unified Reactions and Comments Section at the Bottom */}
          <div className="p-8 md:p-12 rounded-[2.5rem] bg-slate-50 dark:bg-slate-900/30 border border-slate-150 dark:border-white/5 space-y-8 max-w-4xl mx-auto">
            <Reactions postId={post.id} />
            <div className="border-t border-slate-150 dark:border-white/5 pt-8 text-left">
              <CommentSection postId={post.id} />
            </div>
          </div>

          {/* Related Articles - Continue Exploring */}
          {relatedPosts.length > 0 && (
            <div className="space-y-8 pt-8 border-t border-slate-100 dark:border-white/5 text-left max-w-5xl mx-auto select-none">
              <div className="space-y-1">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">Related Chronicles</h3>
                <h2 className="text-2xl font-editorial italic font-black text-slate-900 dark:text-white">Continue Exploring</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                {relatedPosts.map((rPost, idx) => (
                  <PostCard key={rPost.id} post={rPost} index={idx} />
                ))}
              </div>
            </div>
          )}

          {/* Relocated Goodbye Book Ending Footer */}
          <div className="pt-8 text-center space-y-8 pb-10 max-w-xl mx-auto select-none">
            <h3 className="font-editorial italic text-xl md:text-2xl font-black text-slate-900 dark:text-white leading-relaxed">
              "Every chronicle ends, but curiosity never should."
            </h3>
            <div className="flex justify-center gap-4">
              <Link
                to="/library"
                className="px-6 py-3.5 rounded-2xl border border-slate-200 dark:border-white/5 hover:border-primary text-slate-805 dark:text-white hover:text-primary text-xs font-black uppercase tracking-wider bg-white/30 dark:bg-slate-900/30 transition-all flex items-center gap-2"
              >
                <Compass size={14} /> Explore the Library
              </Link>
              <Link
                to="/"
                className="px-6 py-3.5 rounded-2xl bg-primary hover:bg-primary/95 text-white text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 shadow"
              >
                <Home size={14} /> Return Home
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Selected Glossary Modal */}
      {selectedGlossaryTerm && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[9999] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="glass max-w-lg w-full p-8 rounded-[3rem] border border-slate-200 dark:border-white/10 relative shadow-2xl space-y-6 animate-in zoom-in-95 duration-200 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">
            <button
              onClick={() => setSelectedGlossaryTerm(null)}
              className="absolute top-6 right-6 p-2.5 rounded-full bg-slate-100 dark:bg-white/5 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all hover:bg-slate-200 dark:hover:bg-white/10"
            >
              <X size={16} />
            </button>
            <div className="flex items-center gap-3 text-primary">
              <BookOpen size={24} />
              <h4 className="font-black text-xs uppercase tracking-[0.2em]">Glossary Definition</h4>
            </div>
            <div className="space-y-3">
              <h3 className="text-3xl font-editorial italic font-black text-slate-900 dark:text-white">{selectedGlossaryTerm.term}</h3>
              <p className="text-slate-650 dark:text-slate-300 leading-relaxed font-medium">
                {selectedGlossaryTerm.definition}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Sticky Mini Player */}
      <ArticleAudioMiniPlayer
        status={ttsStatus}
        currentChunkIndex={currentChunkIndex}
        chunks={narrationChunks}
        play={playTTS}
        pause={pauseTTS}
        stop={stopTTS}
        skipForward={skipForwardTTS}
        skipBackward={skipBackwardTTS}
        visible={miniPlayerVisible}
        scrollToPlayer={scrollToPlayer}
      />

      {/* Resume following overlay */}
      {!autoFollow && ttsStatus === 'playing' && (
        <div
          onClick={() => setAutoFollow(true)}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[140] px-5 py-2.5 bg-primary hover:bg-primary/95 text-white text-xs font-black uppercase tracking-widest rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
          <span>Resume Speaker Follow</span>
        </div>
      )}

      {/* Floating Glossary Tooltip Popover */}
      {activeTerm && createPortal(
        <div
          style={{
            position: 'fixed',
            left: `${tooltipPos.x}px`,
            top: `${tooltipPos.y}px`,
            transform: 'translate(-50%, -100%)',
          }}
          className="z-[9999] w-72 p-5 bg-slate-950/95 dark:bg-slate-900/95 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-md text-slate-100 pointer-events-none space-y-2 animate-in fade-in zoom-in-95 duration-200"
        >
          <div className="flex items-center gap-2 text-primary">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            <h4 className="font-black text-[10px] uppercase tracking-widest">{activeTerm.term}</h4>
          </div>
          <p className="text-xs text-slate-350 dark:text-slate-300 leading-relaxed font-medium">
            {activeTerm.definition}
          </p>
        </div>,
        document.body
      )}
    </div>
  );
};



function renderBlock(block: any, onImageClick?: (img: any) => void, blocks: any[] = []) {
  const { type, content } = block;
  switch (type) {
    case 'part': {
      const accentColor = content.metadata?.accentColor || '#f97316';
      return (
        <div
          id={block.id}
          className="relative my-24 w-full text-center py-20 px-8 rounded-[3.5rem] bg-gradient-to-b from-[#070c1d]/95 to-[#030611]/98 border border-slate-800/80 shadow-2xl select-none"
          style={{ borderTopColor: accentColor, borderTopWidth: '4px' }}
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full flex items-center justify-center border shadow-xl bg-[#070c1d]" style={{ borderColor: accentColor }}>
            <BookOpen className="w-6 h-6" style={{ color: accentColor }} />
          </div>
          <span className="text-[10px] font-black tracking-[0.4em] uppercase opacity-60 block mb-3" style={{ color: accentColor }}>
            Book Section
          </span>
          <h2 className="text-4xl md:text-6xl font-editorial italic font-black text-white leading-tight">
            {content.title}
          </h2>
          {content.description && (
            <p className="text-slate-400 max-w-xl mx-auto mt-6 text-sm md:text-base leading-relaxed font-medium">
              {content.description}
            </p>
          )}
        </div>
      );
    }

    case 'chapter': {
      const chapIndex = blocks.filter((b: any) => b.type === 'chapter').findIndex((b: any) => b.id === block.id) + 1;
      return (
        <div id={block.id} className="pt-16 pb-6 border-b border-slate-200/50 dark:border-white/5 mb-12 select-none text-left">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#f97316] block mb-2">
            Chapter {chapIndex.toString().padStart(2, '0')}
          </span>
          <h3 className="text-3xl md:text-5xl font-editorial italic font-black text-slate-900 dark:text-white leading-snug">
            {content.title}
          </h3>
          {content.description && (
            <p className="text-slate-500 dark:text-slate-400 mt-4 text-base md:text-lg leading-relaxed font-medium max-w-2xl">
              {content.description}
            </p>
          )}
        </div>
      );
    }

    case 'heading':
    case 'subheading': {
      const level = content.level || (type === 'subheading' ? 3 : 2);
      const Tag = `h${level}` as any;
      const classes = {
        1: 'text-4xl sm:text-5xl md:text-7xl font-black mb-4 md:mb-6',
        2: 'text-3xl sm:text-4xl md:text-6xl font-bold mb-4 md:mb-6 pt-10 md:pt-16',
        3: 'text-2xl sm:text-3xl md:text-5xl font-bold mb-3 md:mb-4 pt-6 md:pt-10',
      }[level as 1 | 2 | 3] || 'text-xl font-bold';
      const titleText = content.title || content.text || '';
      return (
        <div id={block.id} className={cn("mb-12 scroll-mt-32", type === 'subheading' && "pl-4 md:pl-8 border-l-4 border-primary/10 ml-2 md:ml-4")}>
          <Tag className={cn(classes, "font-editorial italic", type === 'subheading' && "text-slate-800 dark:text-slate-200")} dangerouslySetInnerHTML={{ __html: highlightGlossary(titleText) }} />
          {content.subtext && (
            <p className="text-xl md:text-2xl text-muted-foreground font-medium border-l-4 border-primary/20 pl-8 py-2 mt-4" dangerouslySetInnerHTML={{ __html: highlightGlossary(content.subtext) }} />
          )}
        </div>
      );
    }

    case 'paragraph':
      return <div id={block.id} className="text-lg sm:text-xl md:text-2xl leading-[1.6] mb-10 text-slate-700 dark:text-slate-300 text-left scroll-mt-32" dangerouslySetInnerHTML={{ __html: highlightGlossary(content.text) }} />;

    case 'image':
      const isWideImage = content.alt?.toLowerCase().includes('map') || 
                          content.alt?.toLowerCase().includes('diagram') || 
                          content.alt?.toLowerCase().includes('infographic') || 
                          content.alt?.toLowerCase().includes('timeline') || 
                          content.alt?.toLowerCase().includes('wide') ||
                          content.caption?.toLowerCase().includes('map') ||
                          content.caption?.toLowerCase().includes('diagram');

      // Caption parser helper
      const parseCaption = (caption: string) => {
        if (!caption) return null;
        const parts = caption.split('|').map(p => p.trim());
        if (parts.length >= 3) {
          return {
            figure: parts[0],
            title: parts[1],
            description: parts[2]
          };
        }
        if (parts.length === 2) {
          return {
            figure: 'Exhibit Label',
            title: parts[0],
            description: parts[1]
          };
        }
        return {
          figure: 'Historical Artifact',
          title: caption,
          description: ''
        };
      };

      const parsedCaption = parseCaption(content.caption);

      return (
        <figure className={cn(
          "my-16 md:my-24 relative group mx-auto w-full select-none",
          isWideImage ? "max-w-none xl:max-w-5xl" : "max-w-3xl"
        )}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-6"
          >
            {/* Museum Exhibit Card Container */}
            <div 
              className="p-4 md:p-6 bg-slate-50/50 dark:bg-slate-900/10 border border-slate-150 dark:border-white/5 rounded-[2.5rem] md:rounded-[3rem] shadow-sm cursor-zoom-in relative overflow-hidden group/image"
              onClick={() => onImageClick?.({src: getUploadUrl(content.url), alt: content.alt, caption: content.caption})}
            >
              <div className="relative rounded-2xl md:rounded-[2rem] overflow-hidden bg-slate-100 dark:bg-slate-950">
                <motion.img
                  src={getUploadUrl(content.url)}
                  alt={content.alt}
                  className="w-full h-auto object-cover transition-transform duration-700 ease-out group-hover/image:scale-[1.03]"
                  loading="lazy"
                  decoding="async"
                />

                {/* Dark Overlay & View Fullscreen Button */}
                <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover/image:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <span className="flex items-center gap-2 px-5 py-2.5 bg-slate-900/90 dark:bg-white/90 text-white dark:text-slate-950 rounded-full font-black text-[10px] uppercase tracking-wider shadow-lg opacity-0 group-hover/image:opacity-100 scale-90 group-hover/image:scale-100 transition-all duration-300 active:scale-95">
                    <Maximize2 size={11} className="stroke-[3]" />
                    <span>View Fullscreen</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Captions Layout */}
            {parsedCaption && (
              <div className="mt-6 flex flex-col items-center text-center px-4">
                <div className="h-px w-10 bg-primary/20 mb-4" />
                <figcaption className="max-w-2xl space-y-1.5">
                  <span className="text-[9px] font-black uppercase tracking-[0.35em] text-primary block">{parsedCaption.figure}</span>
                  <h5 className="text-slate-900 dark:text-white font-black text-xs md:text-sm uppercase tracking-wider">{parsedCaption.title}</h5>
                  {parsedCaption.description && (
                    <p className="text-[11px] md:text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-lg mx-auto">
                      {parsedCaption.description}
                    </p>
                  )}
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
           <p className="font-bold text-xl md:text-2xl leading-relaxed" dangerouslySetInnerHTML={{ __html: highlightGlossary(content.text) }} />
        </div>
      );

    case 'timeline':
      return (
        <div className="my-20 relative space-y-16 before:absolute before:left-[15px] before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-100 dark:before:bg-white/5">
          {content.items.map((item: any, i: number) => (
            <div key={i} className="relative pl-16 group">
              <div className="absolute left-0 top-2 w-8 h-8 rounded-full bg-background border-4 border-primary shadow-[0_0_15px_rgba(59,130,246,0.5)] group-hover:scale-125 transition-transform" />
              <div className="space-y-2">
                <span className="text-xs font-black uppercase tracking-[0.3em] text-primary" dangerouslySetInnerHTML={{ __html: highlightGlossary(item.date) }} />
                <h4 className="text-2xl md:text-3xl font-black tracking-tight" dangerouslySetInnerHTML={{ __html: highlightGlossary(item.title) }} />
                <p className="text-slate-500 text-lg md:text-xl font-medium leading-relaxed" dangerouslySetInnerHTML={{ __html: highlightGlossary(item.description) }} />
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
                    <p className="font-bold text-slate-700 dark:text-slate-300 leading-snug" dangerouslySetInnerHTML={{ __html: highlightGlossary(item.citation) }} />
                    {item.url && <a href={item.url} target="_blank" className="text-primary hover:underline block mt-2 opacity-70 hover:opacity-100 transition-opacity truncate max-w-xl">{item.url}</a>}
                  </div>
                </li>
              ))}
           </ol>
        </div>
      );

    case 'list': {
      const ListTag = content.type === 'bullet' ? 'ul' : 'ol';
      return (
        <ListTag className={cn(
          "space-y-4 my-8",
          content.type === 'bullet' ? "list-disc pl-10" : "list-decimal pl-10"
        )}>
          {content.items.map((item: string, i: number) => (
            <li key={i} className="text-lg md:text-2xl text-slate-700 dark:text-slate-300 leading-relaxed pl-2 text-left" dangerouslySetInnerHTML={{ __html: highlightGlossary(item) }} />
          ))}
        </ListTag>
      );
    }

    case 'table':
      return (
        <div className="my-8 md:my-12 overflow-x-auto glass rounded-[1.25rem] md:rounded-[2rem] border border-slate-200 dark:border-white/5 shadow-2xl no-scrollbar w-full">
          <table className="w-full border-collapse table-auto md:table-fixed text-xs sm:text-base">
            {content.headers && (
              <thead>
                <tr className="bg-slate-100/50 dark:bg-white/5">
                  {content.headers.map((header: string, i: number) => (
                    <th key={i} className="p-2 sm:p-4 md:p-10 border-b border-r border-slate-200 dark:border-white/10 text-left font-black text-[8px] md:text-[10px] uppercase tracking-[0.1em] md:tracking-[0.3em] text-primary" dangerouslySetInnerHTML={{ __html: header }} />
                  ))}
                </tr>
              </thead>
            )}
            <tbody>
              {content.rows.map((row: any[], ri: number) => (
                <tr key={ri} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                  {row.map((cell: any, ci: number) => (
                    <td key={ci} className="p-2 sm:p-4 md:p-10 border-b border-r border-slate-200 dark:border-white/10 text-[10px] sm:text-base md:text-xl text-slate-700 dark:text-slate-300 leading-normal sm:leading-relaxed font-medium break-words">
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
              <p className="text-3xl md:text-5xl font-sans font-black leading-[1.1] tracking-tighter text-slate-900 dark:text-white" dangerouslySetInnerHTML={{ __html: highlightGlossary(content.text) }} />
              {(content.author || content.source) && (
                <div className="space-y-1">
                  {content.author && <p className="text-sm font-black uppercase tracking-[0.4em] text-primary">— <span dangerouslySetInnerHTML={{ __html: content.author }} /></p>}
                  {content.source && <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest" dangerouslySetInnerHTML={{ __html: content.source }} />}
                </div>
              )}
           </div>
        </div>
      );

    case 'translationquote':
    case 'translationQuote':
      return (
        <div className="my-20 relative p-16 rounded-[4rem] bg-primary/5 border border-primary/10 group overflow-hidden">
           <Quote className="absolute top-10 left-10 text-primary/20 group-hover:scale-110 transition-transform duration-700" size={80} />
           <div className="relative z-10 space-y-8 text-center">
              <p className="text-3xl md:text-5xl font-sans font-black leading-[1.1] tracking-tighter text-slate-900 dark:text-white" dangerouslySetInnerHTML={{ __html: highlightGlossary(content.text) }} />
              
              {content.translation && (
                <div className="pt-6 border-t border-slate-200/50 dark:border-white/10 max-w-2xl mx-auto">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 block mb-2">Translation</span>
                  <p className="text-xl md:text-2xl font-serif italic text-slate-650 dark:text-slate-300 leading-relaxed" dangerouslySetInnerHTML={{ __html: highlightGlossary(content.translation) }} />
                </div>
              )}

              {content.meaning && (
                <div className="pt-6 border-t border-slate-200/50 dark:border-white/10 max-w-2xl mx-auto">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 block mb-2">Meaning</span>
                  <p className="text-lg md:text-xl text-slate-500 dark:text-slate-400 leading-relaxed font-medium" dangerouslySetInnerHTML={{ __html: highlightGlossary(content.meaning) }} />
                </div>
              )}

              {(content.author || content.source) && (
                <div className="pt-4 space-y-1">
                  {content.author && <p className="text-sm font-black uppercase tracking-[0.4em] text-primary">— <span dangerouslySetInnerHTML={{ __html: content.author }} /></p>}
                  {content.source && <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest" dangerouslySetInnerHTML={{ __html: content.source }} />}
                </div>
              )}
           </div>
        </div>
      );

    case 'gallery':
      return <BlogGallery content={content} />;

    case 'keyInsight':
      return (
        <div className="my-16 p-10 md:p-16 rounded-[4rem] bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 relative overflow-hidden">
           <Sparkles className="absolute -top-4 -right-4 text-primary/10 w-40 h-40" />
           <div className="relative z-10 space-y-10">
              <h4 className="text-xl font-black uppercase tracking-[0.3em] text-primary">{content.title}</h4>
              <div className="space-y-6">
                {content.points.map((point: string, i: number) => (
                  <div key={i} className="flex gap-6 items-start">
                    <span className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-xs font-black flex-shrink-0">{(i+1).toString().padStart(2, '0')}</span>
                    <p className="text-xl md:text-2xl font-medium text-slate-700 dark:text-slate-200 leading-relaxed" dangerouslySetInnerHTML={{ __html: point }} />
                  </div>
                ))}
              </div>
           </div>
        </div>
      );

    case 'summary':
      return (
        <div className="mb-12 p-8 md:p-10 rounded-[2.5rem] bg-gradient-to-br from-primary/5 via-slate-50/50 to-primary/5 dark:from-primary/10 dark:via-slate-900/30 dark:to-primary/10 border border-primary/10 dark:border-white/5 relative overflow-hidden shadow-sm">
           <div className="absolute -top-6 -right-6 text-primary/5 pointer-events-none">
             <Sparkles className="w-40 h-40" />
           </div>
           
           <div className="flex items-center gap-3 mb-6 select-none">
             <div className="p-2.5 rounded-2xl bg-primary/10 text-primary">
               <BookOpen size={20} />
             </div>
             <div>
               <div className="text-lg font-sans font-black uppercase tracking-widest text-slate-900 dark:text-white">
                 {content.title || 'Quick Read'}
               </div>
             </div>
           </div>

           <div className="text-base md:text-lg text-slate-700 dark:text-slate-300 font-medium leading-relaxed" dangerouslySetInnerHTML={{ __html: highlightGlossary(content.text) }} />
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

      const resolvedSrc = getUploadUrl(src);
      const updatedContent = content.replace(src, resolvedSrc);

      return (
        <button
          onClick={() => onImageClick?.({ src: resolvedSrc, alt })}
          className="w-full flex justify-center hover:scale-105 transition-transform duration-300 cursor-zoom-in"
        >
          <div dangerouslySetInnerHTML={{ __html: updatedContent }} className="flex justify-center" />
        </button>
      );
    }

    return <div dangerouslySetInnerHTML={{ __html: content }} />;
  }
