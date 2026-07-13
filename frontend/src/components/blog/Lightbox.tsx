import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';

interface LightboxProps {
  src: string;
  alt?: string;
  caption?: string;
  isOpen: boolean;
  onClose: () => void;
}

export const Lightbox: React.FC<LightboxProps> = ({ src, alt, caption, isOpen, onClose }) => {
  // Prevent background scrolling
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // ESC key support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-black/95 backdrop-blur-2xl"
        >
          {/* Backdrop/Close area */}
          <div className="absolute inset-0 z-0 cursor-zoom-out" onClick={onClose} />

          {/* Header Controls */}
          <div className="absolute top-0 left-0 right-0 p-6 flex justify-end z-20 pointer-events-none">
            <button
              onClick={onClose}
              className="pointer-events-auto p-4 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all border border-white/10 shadow-2xl active:scale-90"
            >
              <X size={32} />
            </button>
          </div>

          {/* Content Area */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="relative z-10 w-full h-full flex flex-col items-center justify-center p-4 md:p-20"
          >
            <div className="relative group max-w-full max-h-full">
              {src ? (
                <img
                  src={src}
                  alt={alt || "Chronicle Visual Asset"}
                  className="max-h-[80vh] w-auto max-w-[95vw] object-contain select-none rounded-xl shadow-2xl"
                />
              ) : (
                <div className="flex flex-col items-center gap-4 text-white/40 italic">
                   <Loader2 className="animate-spin" size={40} />
                   <p>Synthesizing visual asset...</p>
                </div>
              )}
            </div>

            {caption && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-8 text-center max-w-2xl bg-black/40 backdrop-blur-md p-4 rounded-2xl border border-white/5"
              >
                <p className="text-white/90 font-editorial italic text-lg md:text-xl">
                  {caption}
                </p>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};
