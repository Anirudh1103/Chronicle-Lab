import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  Maximize2, 
  X, 
  Play, 
  Pause,
  Info
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { getUploadUrl } from '../../utils/url';

interface GalleryImage {
  url: string;
  title?: string;
  caption?: string;
  credit?: string;
  alt?: string;
}

interface BlogGalleryProps {
  content: {
    images: GalleryImage[];
    layout: 'grid' | 'carousel';
    transitionEffect?: 'crossfade' | 'fade' | 'kenburns';
    displayDuration?: number;
    transitionDuration?: number;
    autoPlay?: boolean;
    showCaptions?: boolean;
    showIndex?: boolean;
    lazyLoad?: boolean;
    preloadNext?: boolean;
  };
}

export const BlogGallery: React.FC<BlogGalleryProps> = ({ content }) => {
  const {
    images = [],
    transitionEffect = 'crossfade',
    displayDuration = 5,
    transitionDuration = 1000,
    autoPlay = true,
    showCaptions = true,
    showIndex = true,
    lazyLoad = true,
    preloadNext = true
  } = content;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isTouchHolding, setIsTouchHolding] = useState(false);
  
  const timerRef = useRef<any>(null);
  const touchStartRef = useRef<number>(0);
  const touchHoldTimerRef = useRef<any>(null);

  // Safe Index Helpers
  const nextSlide = useCallback(() => {
    if (images.length <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const prevSlide = useCallback(() => {
    if (images.length <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  // Slideshow Timer Effect
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    
    // Check if autoPlay is active and user is not hovering/holding
    const shouldPlay = isPlaying && !isHovered && !isTouchHolding;
    
    if (shouldPlay && images.length > 1) {
      timerRef.current = setInterval(() => {
        nextSlide();
      }, displayDuration * 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, isHovered, isTouchHolding, displayDuration, images.length, nextSlide]);

  // Image preloading logic
  useEffect(() => {
    if (preloadNext && images.length > 1) {
      const nextIdx = (currentIndex + 1) % images.length;
      if (images[nextIdx]?.url) {
        const img = new Image();
        img.src = getUploadUrl(images[nextIdx].url);
      }
    }
  }, [currentIndex, images, preloadNext]);

  // Keyboard navigation for fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isFullscreen) return;
      if (e.key === 'ArrowRight') nextSlide();
      if (e.key === 'ArrowLeft') prevSlide();
      if (e.key === 'Escape') setIsFullscreen(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, nextSlide, prevSlide]);

  if (images.length === 0) return null;

  const currentImage = images[currentIndex];
  
  // Slide animation variants
  const getVariants = () => {
    if (transitionEffect === 'kenburns') {
      return {
        initial: { scale: 1, opacity: 0 },
        animate: { 
          scale: 1.06, 
          opacity: 1, 
          transition: {
            scale: { duration: displayDuration, ease: 'linear' },
            opacity: { duration: transitionDuration / 1000, ease: 'easeInOut' }
          } 
        },
        exit: { 
          opacity: 0, 
          transition: { duration: transitionDuration / 1000, ease: 'easeInOut' } 
        }
      };
    }
    
    // Crossfade/Fade
    return {
      initial: { opacity: 0 },
      animate: { 
        opacity: 1, 
        transition: { duration: transitionDuration / 1000, ease: 'easeInOut' } 
      },
      exit: { 
        opacity: 0, 
        transition: { duration: transitionDuration / 1000, ease: 'easeInOut' } 
      }
    };
  };

  // Swipe gesture handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = e.touches[0].clientX;
    
    // Touch hold to pause logic
    if (touchHoldTimerRef.current) clearTimeout(touchHoldTimerRef.current);
    touchHoldTimerRef.current = setTimeout(() => {
      setIsTouchHolding(true);
    }, 250); // Pause if held longer than 250ms
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchHoldTimerRef.current) clearTimeout(touchHoldTimerRef.current);
    setIsTouchHolding(false);

    const diff = touchStartRef.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
  };

  return (
    <div className="w-full my-12 relative select-none">
      
      {/* Inline Carousel Viewport */}
      <div 
        className="w-full aspect-[16/10] sm:aspect-[16/9] rounded-[2.5rem] overflow-hidden bg-slate-950 border border-slate-200/50 dark:border-white/5 shadow-2xl relative group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <AnimatePresence mode="popLayout">
          <motion.div
            key={currentIndex}
            variants={getVariants()}
            initial="initial"
            animate="animate"
            exit="exit"
            className="absolute inset-0 w-full h-full flex items-center justify-center"
          >
            <img
              src={getUploadUrl(currentImage.url)}
              alt={currentImage.alt || 'Slideshow image'}
              className="w-full h-full object-cover"
              loading={lazyLoad ? 'lazy' : 'eager'}
              decoding="async"
            />
          </motion.div>
        </AnimatePresence>

        {/* Overlays / Indicators */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent pointer-events-none" />

        {/* Top Indicators Row */}
        <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-10">
          {showIndex && (
            <div className="px-3.5 py-1.5 bg-slate-950/50 backdrop-blur-md border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-200 shadow-lg">
              {currentIndex + 1} / {images.length}
            </div>
          )}

          <div className="flex items-center gap-2">
            {/* Play/Pause state */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsPlaying(!isPlaying);
              }}
              className="p-2.5 bg-slate-950/50 backdrop-blur-md border border-white/10 rounded-full text-slate-200 hover:text-white hover:scale-105 active:scale-95 shadow-lg transition-all"
            >
              {isPlaying && !isHovered && !isTouchHolding ? <Pause size={14} /> : <Play size={14} />}
            </button>
            <button
              onClick={() => setIsFullscreen(true)}
              className="p-2.5 bg-slate-950/50 backdrop-blur-md border border-white/10 rounded-full text-slate-200 hover:text-white hover:scale-105 active:scale-95 shadow-lg transition-all"
            >
              <Maximize2 size={14} />
            </button>
          </div>
        </div>

        {/* Previous / Next Inline Controls (Desktop Visible on Hover) */}
        {images.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                prevSlide();
              }}
              className="absolute left-6 top-1/2 -translate-y-1/2 p-3 bg-slate-950/40 hover:bg-slate-950/60 backdrop-blur-md border border-white/10 rounded-full text-white opacity-0 group-hover:opacity-100 active:scale-95 transition-all shadow-xl z-10"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                nextSlide();
              }}
              className="absolute right-6 top-1/2 -translate-y-1/2 p-3 bg-slate-950/40 hover:bg-slate-950/60 backdrop-blur-md border border-white/10 rounded-full text-white opacity-0 group-hover:opacity-100 active:scale-95 transition-all shadow-xl z-10"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}

        {/* Slide Progress Dots */}
        {images.length > 1 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  currentIndex === i ? "w-5 bg-white" : "w-1.5 bg-white/40 hover:bg-white/70"
                )}
              />
            ))}
          </div>
        )}
      </div>

      {/* Caption & Credits (Inline Under Slider) */}
      {showCaptions && (currentImage.title || currentImage.caption || currentImage.credit) && (
        <div className="mt-4 px-2 space-y-1 text-left">
          {currentImage.title && (
            <h5 className="text-sm font-black text-slate-800 dark:text-slate-100 tracking-tight">
              {currentImage.title}
            </h5>
          )}
          {currentImage.caption && (
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
              {currentImage.caption}
            </p>
          )}
          {currentImage.credit && (
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 block pt-0.5">
              Photo Credit: {currentImage.credit}
            </span>
          )}
        </div>
      )}

      {/* Fullscreen Lightbox Portal */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-between p-6 bg-slate-950/98 backdrop-blur-xl select-none"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Lightbox Header */}
            <div className="w-full max-w-6xl flex items-center justify-between text-slate-400">
              <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                Fullscreen Image Gallery ({currentIndex + 1} / {images.length})
              </span>
              <button
                onClick={() => setIsFullscreen(false)}
                className="p-2.5 bg-slate-900/60 hover:bg-slate-900 border border-white/5 hover:border-white/10 text-white rounded-full transition-all active:scale-95 shadow-2xl"
              >
                <X size={18} />
              </button>
            </div>

            {/* Lightbox Image Container */}
            <div className="flex-1 w-full max-w-6xl flex items-center justify-between gap-4 relative">
              {/* Prev */}
              {images.length > 1 && (
                <button
                  onClick={prevSlide}
                  className="p-3 bg-slate-900/80 hover:bg-slate-900 border border-white/5 text-white rounded-full transition-all active:scale-95 shadow-2xl"
                >
                  <ChevronLeft size={24} />
                </button>
              )}

              {/* Center Image */}
              <div className="flex-1 h-full flex items-center justify-center p-4">
                <img
                  src={getUploadUrl(currentImage.url)}
                  alt={currentImage.alt || 'Fullscreen slide'}
                  className="max-w-full max-h-[75vh] object-contain rounded-2xl shadow-2xl border border-white/5"
                />
              </div>

              {/* Next */}
              {images.length > 1 && (
                <button
                  onClick={nextSlide}
                  className="p-3 bg-slate-900/80 hover:bg-slate-900 border border-white/5 text-white rounded-full transition-all active:scale-95 shadow-2xl"
                >
                  <ChevronRight size={24} />
                </button>
              )}
            </div>

            {/* Lightbox Footer (Metadata card) */}
            <div className="w-full max-w-4xl p-6 bg-slate-900/60 border border-white/5 rounded-3xl backdrop-blur-md text-left flex items-start gap-4 shadow-2xl mb-4">
              <div className="p-2.5 rounded-2xl bg-blue-500/10 text-blue-500 shrink-0">
                <Info size={18} />
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                {currentImage.title && (
                  <h6 className="text-sm font-black text-slate-100 uppercase tracking-wider">
                    {currentImage.title}
                  </h6>
                )}
                {currentImage.caption && (
                  <p className="text-xs text-slate-400 font-medium leading-relaxed">
                    {currentImage.caption}
                  </p>
                )}
                {currentImage.credit && (
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 block pt-0.5">
                    Credit: {currentImage.credit}
                  </span>
                )}
              </div>
              
              {/* Play / Pause indicator inside fullscreen */}
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-2.5 bg-white/5 hover:bg-white/10 rounded-full text-slate-300 hover:text-white transition-all shrink-0"
              >
                {isPlaying && !isHovered ? <Pause size={14} /> : <Play size={14} />}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
