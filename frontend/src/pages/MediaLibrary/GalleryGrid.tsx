import React, { useEffect, useRef, useState } from 'react';
import { Eye, ImageIcon, Check, Download, Trash2, Copy, MoveRight } from 'lucide-react';
import { getUploadUrl } from '../../utils/url';
import { cn } from '../../utils/cn';
import { MediaFile } from '../MediaLibrary';

// Lightweight, native IntersectionObserver custom hook
function useInView(options?: IntersectionObserverInit) {
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(([entry]) => {
      setInView(entry.isIntersecting);
    }, options);

    observer.observe(el);
    return () => {
      observer.unobserve(el);
    };
  }, [options]);

  return { ref, inView };
}

interface GalleryGridProps {
  media: MediaFile[];
  selectedIds: Set<string>;
  onToggleSelect: (id: string, isShift?: boolean) => void;
  onPreview: (file: MediaFile) => void;
  onDelete: (id: string) => void;
  onMove: (file: MediaFile) => void;
  onCopy: (file: MediaFile) => void;
}

export function GalleryGrid({
  media,
  selectedIds,
  onToggleSelect,
  onPreview,
  onDelete,
  onMove,
  onCopy,
}: GalleryGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
      {media.map((file) => (
        <GalleryCard
          key={file.id}
          file={file}
          isSelected={selectedIds.has(file.id)}
          onToggleSelect={onToggleSelect}
          onPreview={onPreview}
          onDelete={onDelete}
          onMove={onMove}
          onCopy={onCopy}
        />
      ))}
    </div>
  );
}

interface GalleryCardProps {
  file: MediaFile;
  isSelected: boolean;
  onToggleSelect: (id: string, isShift?: boolean) => void;
  onPreview: (file: MediaFile) => void;
  onDelete: (id: string) => void;
  onMove: (file: MediaFile) => void;
  onCopy: (file: MediaFile) => void;
}

function GalleryCard({
  file,
  isSelected,
  onToggleSelect,
  onPreview,
  onDelete,
  onMove,
  onCopy,
}: GalleryCardProps) {
  const { ref, inView } = useInView({
    rootMargin: '200px 0px', // Preload images slightly before they appear
  });

  const [isLoaded, setIsLoaded] = useState(false);

  const formatBytes = (bytes?: number) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button')) return;

    onToggleSelect(file.id, e.shiftKey);
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', `media:${file.id}`);
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      ref={ref}
      onClick={handleCardClick}
      draggable
      onDragStart={handleDragStart}
      className={cn(
        "group relative aspect-[16/11] bg-slate-950/80 rounded-2xl overflow-hidden border border-white/5 shadow-lg flex flex-col justify-between p-1 transition-all duration-150 cursor-pointer",
        isSelected
          ? "ring-2 ring-primary ring-offset-2 ring-offset-slate-950 border-primary/20 scale-[0.98]"
          : "hover:scale-[1.02] hover:border-white/10"
      )}
    >
      {/* Checkbox selector */}
      <div
        onClick={(e) => {
          e.stopPropagation();
          onToggleSelect(file.id, e.shiftKey);
        }}
        className={cn(
          "absolute top-2.5 left-2.5 w-5 h-5 rounded-md border flex items-center justify-center z-30 transition-all",
          isSelected
            ? "bg-primary border-primary text-white scale-110"
            : "bg-black/60 border-white/20 opacity-0 group-hover:opacity-100"
        )}
      >
        {isSelected && <Check size={12} className="stroke-[3]" />}
      </div>

      {/* Media Image Holder with skeleton loading */}
      <div className="w-full h-full bg-slate-950 rounded-xl overflow-hidden flex items-center justify-center relative shrink-0">
        {inView ? (
          <>
            <img
              src={getUploadUrl(file.smallThumbnailPath || file.mediumThumbnailPath || file.path)}
              alt={file.filename}
              loading="lazy"
              decoding="async"
              fetchPriority="low"
              className={cn(
                "w-full h-full object-contain transition-all duration-300",
                isLoaded ? "opacity-100 scale-100" : "opacity-0 scale-95"
              )}
              onLoad={() => setIsLoaded(true)}
              onError={(e) => {
                (e.target as HTMLImageElement).src = getUploadUrl(file.path);
              }}
            />
            {!isLoaded && (
              <div className="absolute inset-0 bg-slate-900/60 animate-pulse flex items-center justify-center">
                <ImageIcon size={20} className="text-slate-700 animate-spin" />
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full bg-slate-900/40" />
        )}
      </div>

      {/* Title & Metadata HUD bottom section */}
      <div className="flex justify-between items-center px-2 py-1.5 z-10 shrink-0 bg-slate-950/70 backdrop-blur-md rounded-b-xl border-t border-white/5">
        <div className="min-w-0 space-y-0.5">
          <p className="text-[10px] text-slate-200 font-bold truncate leading-none" title={file.filename}>
            {file.filename}
          </p>
          <span className="text-[8px] text-slate-400 font-black block tracking-wider uppercase leading-none">
            {file.width ? `${file.width}x${file.height}` : 'WEBP'} • {formatBytes(file.size)}
          </span>
        </div>
      </div>

      {/* Hover overlay with detail tools */}
      <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex flex-col justify-between p-3.5 z-20 rounded-2xl">
        <div className="space-y-1">
          <p className="text-[11px] text-white font-bold truncate" title={file.filename}>
            {file.filename}
          </p>
          <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-white/5 text-[9px] font-bold text-slate-300">
            <div>
              <span className="text-slate-500 block text-[7px] uppercase font-black">Original</span>
              <span>{formatBytes(file.originalSize || file.size)}</span>
            </div>
            <div>
              <span className="text-emerald-400 block text-[7px] uppercase font-black">Optimized</span>
              <span className="text-emerald-300">{formatBytes(file.optimizedSize || file.size)}</span>
            </div>
          </div>
        </div>

        {/* Action Row */}
        <div className="space-y-1.5 pt-1.5 border-t border-white/5">
          <button
            onClick={() => onPreview(file)}
            className="w-full py-1.5 bg-primary/80 hover:bg-primary text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1 shadow"
          >
            <Eye size={12} /> Preview
          </button>

          <div className="flex gap-1.5">
            <button
              onClick={() => onMove(file)}
              className="flex-1 py-1.5 bg-white/5 hover:bg-white/10 text-white text-[9px] font-bold rounded-lg flex items-center justify-center gap-1 transition-all"
              title="Move"
            >
              <MoveRight size={10} /> Move
            </button>
            <button
              onClick={() => onCopy(file)}
              className="flex-1 py-1.5 bg-white/5 hover:bg-white/10 text-white text-[9px] font-bold rounded-lg flex items-center justify-center gap-1 transition-all"
              title="Copy"
            >
              <Copy size={10} /> Copy
            </button>
            <button
              onClick={() => {
                if (confirm(`Permanently purge ${file.filename}?`)) {
                  onDelete(file.id);
                }
              }}
              className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg border border-rose-500/20 transition-all"
              title="Delete"
            >
              <Trash2 size={11} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
