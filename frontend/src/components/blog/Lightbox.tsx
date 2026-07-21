import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface LightboxProps {
  src: string;
  alt?: string;
  caption?: string;
  isOpen: boolean;
  onClose: () => void;
}

export const Lightbox: React.FC<LightboxProps> = ({ src, alt, caption, isOpen, onClose }) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  
  const imgRef = useRef<HTMLImageElement>(null);
  const dragStart = useRef({ x: 0, y: 0 });
  const initialTouchDistance = useRef(0);
  const initialScale = useRef(1);

  // Reset state on open/close
  useEffect(() => {
    if (isOpen) {
      setScale(1);
      setPosition({ x: 0, y: 0 });
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Keyboard navigation & zoom keys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === '=' || e.key === '+') {
        setScale(prev => Math.min(prev + 0.25, 5));
      } else if (e.key === '-' || e.key === '_') {
        setScale(prev => {
          const next = Math.max(prev - 0.25, 1);
          if (next === 1) setPosition({ x: 0, y: 0 });
          return next;
        });
      } else if (e.key === '0') {
        setScale(1);
        setPosition({ x: 0, y: 0 });
      } else if (scale > 1) {
        // Pan with arrow keys
        if (e.key === 'ArrowLeft') {
          setPosition(prev => ({ ...prev, x: prev.x + 30 }));
        } else if (e.key === 'ArrowRight') {
          setPosition(prev => ({ ...prev, x: prev.x - 30 }));
        } else if (e.key === 'ArrowUp') {
          setPosition(prev => ({ ...prev, y: prev.y + 30 }));
        } else if (e.key === 'ArrowDown') {
          setPosition(prev => ({ ...prev, y: prev.y - 30 }));
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, scale, onClose]);

  // Mouse wheel zoom helper
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setScale(prev => {
      const zoomFactor = e.deltaY < 0 ? 0.15 : -0.15;
      const next = Math.min(Math.max(prev + zoomFactor, 1), 5);
      if (next === 1) setPosition({ x: 0, y: 0 });
      return next;
    });
  };

  // Mouse drag-to-pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale <= 1) return;
    e.preventDefault();
    setIsDragging(true);
    dragStart.current = { x: e.clientX - position.x, y: e.clientY - position.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || scale <= 1) return;
    setPosition({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y
    });
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  // Touch handlers for mobile pan & pinch zoom
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // Pinch started
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      initialTouchDistance.current = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      initialScale.current = scale;
    } else if (e.touches.length === 1 && scale > 1) {
      // Single finger pan started
      setIsDragging(true);
      const touch = e.touches[0];
      dragStart.current = { x: touch.clientX - position.x, y: touch.clientY - position.y };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const currentDistance = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      if (initialTouchDistance.current > 0) {
        setScale(() => {
          const ratio = currentDistance / initialTouchDistance.current;
          const next = Math.min(Math.max(initialScale.current * ratio, 1), 5);
          if (next === 1) setPosition({ x: 0, y: 0 });
          return next;
        });
      }
    } else if (e.touches.length === 1 && isDragging && scale > 1) {
      const touch = e.touches[0];
      setPosition({
        x: touch.clientX - dragStart.current.x,
        y: touch.clientY - dragStart.current.y
      });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    initialTouchDistance.current = 0;
  };

  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.5, 5));
  const handleZoomOut = () => setScale(prev => {
    const next = Math.max(prev - 0.5, 1);
    if (next === 1) setPosition({ x: 0, y: 0 });
    return next;
  });
  const handleReset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-black/95 backdrop-blur-2xl select-none"
        >
          {/* Close/Backdrop clicking area */}
          <div className="absolute inset-0 z-0 cursor-zoom-out" onClick={onClose} />

          {/* Top Header controls */}
          <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-30 pointer-events-none">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 pl-4">Museum Lightbox</span>
            <button
              onClick={onClose}
              className="pointer-events-auto p-3.5 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all border border-white/10 shadow-lg active:scale-95 outline-none focus:outline-none"
              title="Close Fullscreen"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content Area with Zoom & Pan handlers */}
          <div
            className="relative z-10 w-full h-full flex flex-col items-center justify-center p-4 md:p-16 overflow-hidden cursor-grab active:cursor-grabbing"
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUpOrLeave}
            onMouseLeave={handleMouseUpOrLeave}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <motion.div
              style={{
                x: position.x,
                y: position.y,
                scale: scale,
              }}
              transition={isDragging ? { type: 'just' } : { type: 'spring', stiffness: 300, damping: 30 }}
              className="relative max-w-full max-h-full flex items-center justify-center"
            >
              {src ? (
                <img
                  ref={imgRef}
                  src={src}
                  alt={alt || "Chronicle Visual Asset"}
                  loading="lazy"
                  decoding="async"
                  className="max-h-[75vh] w-auto max-w-[90vw] object-contain select-none rounded-2xl shadow-2xl pointer-events-none"
                  draggable={false}
                />
              ) : (
                <div className="flex flex-col items-center gap-4 text-white/40 italic">
                   <Loader2 className="animate-spin" size={40} />
                   <p>Synthesizing visual asset...</p>
                </div>
              )}
            </motion.div>
          </div>

          {/* Bottom Zoom & Captions Controls */}
          <div className="absolute bottom-8 left-0 right-0 z-20 flex flex-col items-center gap-4 px-6 pointer-events-none">
            {/* Legend / Caption Overlay */}
            {caption && scale === 1 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="max-w-xl bg-black/60 backdrop-blur-md px-6 py-3.5 rounded-2xl border border-white/10 text-center shadow-lg"
              >
                <p className="text-white/80 font-editorial italic text-xs md:text-sm leading-relaxed">
                  {caption}
                </p>
              </motion.div>
            )}

            {/* Premium Zoom Toolbar HUD */}
            <div className="pointer-events-auto flex items-center gap-2 p-2 bg-slate-900/90 dark:bg-white/90 text-white dark:text-slate-950 rounded-2xl shadow-2xl border border-white/10 dark:border-slate-300">
              <button
                onClick={handleZoomOut}
                disabled={scale <= 1}
                className="p-2 rounded-xl hover:bg-white/10 dark:hover:bg-black/10 transition-colors disabled:opacity-40"
                title="Zoom Out"
              >
                <ZoomOut size={16} />
              </button>

              <div className="w-16 text-center text-xs font-mono font-black select-none tracking-widest">
                {Math.round(scale * 100)}%
              </div>

              {scale > 1 && (
                <button
                  onClick={handleReset}
                  className="p-2 rounded-xl hover:bg-white/10 dark:hover:bg-black/10 transition-colors"
                  title="Reset Zoom"
                >
                  <RotateCcw size={16} />
                </button>
              )}

              <button
                onClick={handleZoomIn}
                disabled={scale >= 5}
                className="p-2 rounded-xl hover:bg-white/10 dark:hover:bg-black/10 transition-colors disabled:opacity-40"
                title="Zoom In"
              >
                <ZoomIn size={16} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};
