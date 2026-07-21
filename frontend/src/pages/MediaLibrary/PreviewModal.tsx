import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Copy, Trash2, Edit3, Sparkles, RefreshCw, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { getUploadUrl } from '../../utils/url';
import { cn } from '../../utils/cn';
import { MediaFile } from '../MediaLibrary';

interface PreviewModalProps {
  file: MediaFile;
  mediaList: MediaFile[];
  onClose: () => void;
  onSelectFile: (file: MediaFile) => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
  onReplace: (id: string, file: File) => void;
}

export function PreviewModal({
  file,
  mediaList,
  onClose,
  onSelectFile,
  onRename,
  onDelete,
  onReplace,
}: PreviewModalProps) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(file.filename);

  const imgRef = useRef<HTMLImageElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);

  // Find index for keyboard navigation
  const currentIndex = mediaList.findIndex((m) => m.id === file.id);

  const handlePrev = () => {
    if (currentIndex > 0) {
      onSelectFile(mediaList[currentIndex - 1]);
      resetZoom();
    }
  };

  const handleNext = () => {
    if (currentIndex < mediaList.length - 1) {
      onSelectFile(mediaList[currentIndex + 1]);
      resetZoom();
    }
  };

  const resetZoom = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  // Keyboard navigation listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowLeft') handlePrev();
      else if (e.key === 'ArrowRight') handleNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, mediaList]);

  // Sync rename state
  useEffect(() => {
    setNewName(file.filename);
  }, [file]);

  const handleRenameSave = () => {
    if (newName.trim() && newName.trim() !== file.filename) {
      onRename(file.id, newName.trim());
    }
    setIsRenaming(false);
  };

  const formatBytes = (bytes?: number) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Handle image replacement file upload
  const handleReplaceFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      onReplace(file.id, f);
    }
  };

  // Zoom control helpers
  const zoomIn = () => setScale((prev) => Math.min(prev + 0.25, 4));
  const zoomOut = () => setScale((prev) => Math.max(prev - 0.25, 0.5));

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl select-none">
      <div className="absolute inset-0" onClick={onClose} />

      {/* Keyboard instructions */}
      <div className="absolute top-4 left-4 text-[10px] text-slate-500 font-bold hidden md:block">
        Use Left / Right Arrows to navigate • ESC to exit
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative max-w-5xl w-full max-h-[90vh] bg-slate-900 border border-white/5 rounded-[2rem] overflow-hidden flex flex-col shadow-2xl z-10"
      >
        {/* Lightbox Header */}
        <div className="p-5 border-b border-white/5 flex justify-between items-center bg-slate-950/60 shrink-0">
          <div className="min-w-0">
            {isRenaming ? (
              <input
                type="text"
                autoFocus
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onBlur={handleRenameSave}
                onKeyDown={(e) => e.key === 'Enter' && handleRenameSave()}
                className="bg-slate-800 text-white font-bold text-lg px-2 py-0.5 rounded border border-white/10 outline-none"
              />
            ) : (
              <div className="flex items-center gap-2 min-w-0">
                <h3 className="text-lg font-black text-white truncate max-w-md">{file.filename}</h3>
                <button
                  onClick={() => setIsRenaming(true)}
                  className="p-1 text-slate-400 hover:text-white rounded hover:bg-white/5"
                >
                  <Edit3 size={14} />
                </button>
              </div>
            )}
            <p className="text-[10px] text-slate-400 font-bold mt-1">
              Original Format: <span className="text-white">{file.originalFormat || 'IMG'}</span> • Optimized Format:{' '}
              <span className="text-emerald-400">WEBP</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Zoom tool buttons */}
            <div className="flex bg-slate-950/50 p-1 rounded-xl border border-white/5">
              <button onClick={zoomOut} className="p-1.5 hover:bg-white/5 rounded text-slate-400 hover:text-white">
                <ZoomOut size={14} />
              </button>
              <button onClick={resetZoom} className="p-1.5 hover:bg-white/5 rounded text-slate-400 hover:text-white">
                <Maximize2 size={14} />
              </button>
              <button onClick={zoomIn} className="p-1.5 hover:bg-white/5 rounded text-slate-400 hover:text-white">
                <ZoomIn size={14} />
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Lightbox Canvas Area */}
        <div className="flex-1 overflow-hidden p-6 bg-slate-950 flex items-center justify-center relative min-h-[400px]">
          {/* Navigation Arrows */}
          {currentIndex > 0 && (
            <button
              onClick={handlePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-slate-900/60 hover:bg-slate-900 text-white flex items-center justify-center transition-all border border-white/5 shadow"
            >
              <ChevronLeft size={20} />
            </button>
          )}

          {currentIndex < mediaList.length - 1 && (
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-slate-900/60 hover:bg-slate-900 text-white flex items-center justify-center transition-all border border-white/5 shadow"
            >
              <ChevronRight size={20} />
            </button>
          )}

          {/* Target preview image using medium preview variant */}
          <div className="overflow-auto max-w-full max-h-[55vh] flex items-center justify-center scrollbar-none">
            <motion.img
              ref={imgRef}
              style={{ scale }}
              src={getUploadUrl(file.mediumThumbnailPath || file.path)}
              alt={file.filename}
              className="max-w-full max-h-[55vh] object-contain rounded-xl shadow-2xl border border-white/5 pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.15 }}
            />
          </div>
        </div>

        {/* Lightbox Footer stats */}
        <div className="p-5 border-t border-white/5 bg-slate-900 shrink-0 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-bold">
          <div>
            <span className="text-slate-500 block text-[8px] uppercase font-black tracking-widest">Resolution</span>
            <span className="text-white">
              {file.width ? `${file.width} x ${file.height}` : 'Variable Dimensions'}
            </span>
          </div>

          <div>
            <span className="text-emerald-500 block text-[8px] uppercase font-black tracking-widest">Compression</span>
            <span className="text-emerald-400">
              WEBP • {formatBytes(file.size)} ({file.compressionRatio || 0}% Savings)
            </span>
          </div>

          <div>
            <span className="text-slate-500 block text-[8px] uppercase font-black tracking-widest">File Size</span>
            <span className="text-white">Original: {formatBytes(file.originalSize || file.size)}</span>
          </div>

          {/* Quick interactive actions */}
          <div className="flex gap-2 justify-end items-center">
            <button
              onClick={() => {
                navigator.clipboard.writeText(getUploadUrl(file.path));
                alert('Copied original resolution WebP path!');
              }}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl flex items-center gap-1.5 transition-colors border border-white/5 text-[11px]"
            >
              <Copy size={13} /> Copy URL
            </button>

            <button
              onClick={() => replaceInputRef.current?.click()}
              className="px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl flex items-center gap-1.5 transition-colors text-[11px]"
              title="Replace source file"
            >
              <RefreshCw size={13} /> Replace
              <input
                ref={replaceInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleReplaceFileChange}
              />
            </button>

            <button
              onClick={() => {
                if (confirm('Delete this media permanently?')) {
                  onDelete(file.id);
                  onClose();
                }
              }}
              className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl border border-rose-500/15"
              title="Delete asset"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
