import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Maximize } from 'lucide-react';

interface LightboxProps {
  src: string;
  alt?: string;
  caption?: string;
  isOpen: boolean;
  onClose: () => void;
}

export const Lightbox: React.FC<LightboxProps> = ({ src, alt, caption, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 md:p-12">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl"
        />

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative max-w-7xl w-full h-full flex flex-col items-center justify-center gap-6"
        >
          <div className="absolute top-0 right-0 flex gap-4 p-4">
            <button
              onClick={onClose}
              className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors backdrop-blur-md"
            >
              <X size={24} />
            </button>
          </div>

          <div className="relative group overflow-hidden rounded-2xl shadow-2xl">
            <img
              src={src}
              alt={alt}
              className="max-h-[80vh] w-auto object-contain select-none"
            />
          </div>

          {caption && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="max-w-2xl text-center space-y-2"
            >
              <p className="text-white text-lg font-medium leading-relaxed italic">"{caption}"</p>
              <div className="h-0.5 w-12 bg-primary mx-auto rounded-full" />
            </motion.div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
