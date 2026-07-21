import React, { useEffect, useRef, useState } from 'react';
import { Eye, ImageIcon, Check, Download, Trash2, Copy, MoveRight, MoreVertical } from 'lucide-react';
import { getUploadUrl } from '../../utils/url';
import { cn } from '../../utils/cn';
import { MediaFile } from '../MediaLibrary';

// Native IntersectionObserver custom hook
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
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
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
    rootMargin: '200px 0px',
  });

  const [isLoaded, setIsLoaded] = useState(false);
  const [showOptionsPopup, setShowOptionsPopup] = useState(false);

  const formatBytes = (bytes?: number) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('.options-menu')) return;
    onToggleSelect(file.id, e.shiftKey);
  };

  return (
    <div
      ref={ref}
      onClick={handleCardClick}
      className={cn(
        "group relative bg-[#131929] border border-white/5 rounded-2xl overflow-hidden shadow-lg flex flex-col justify-between p-2.5 transition-all duration-150 cursor-pointer",
        isSelected
          ? "ring-2 ring-[#38BDF8] border-transparent scale-[0.98]"
          : "hover:scale-[1.02] hover:border-white/10"
      )}
    >
      {/* Checkbox selector overlay on top left */}
      <div
        onClick={(e) => {
          e.stopPropagation();
          onToggleSelect(file.id, e.shiftKey);
        }}
        className={cn(
          "absolute top-4 left-4 w-5 h-5 rounded-md border flex items-center justify-center z-30 transition-all cursor-pointer",
          isSelected
            ? "bg-[#38BDF8] border-[#38BDF8] text-slate-900 scale-110"
            : "bg-black/60 border-white/20 opacity-0 group-hover:opacity-100"
        )}
      >
        {isSelected && <Check size={12} className="stroke-[3]" />}
      </div>

      {/* Format badge on top right */}
      <div className="absolute top-4 right-4 z-30">
        <span className="px-2 py-0.5 bg-black/60 backdrop-blur-md text-[#94A3B8] border border-white/10 rounded text-[9px] font-black uppercase tracking-widest leading-none">
          WEBP
        </span>
      </div>

      {/* Aspect Ratio 16:10 Container Image Holder */}
      <div className="w-full aspect-[16/10] bg-slate-950/60 rounded-xl overflow-hidden flex items-center justify-center relative shrink-0">
        {inView ? (
          <>
            <img
              src={getUploadUrl(file.smallThumbnailPath || file.mediumThumbnailPath || file.path)}
              alt={file.filename}
              loading="lazy"
              decoding="async"
              fetchPriority="low"
              className={cn(
                "w-full h-full object-cover transition-all duration-300",
                isLoaded ? "opacity-100 scale-100" : "opacity-0 scale-95"
              )}
              onLoad={() => setIsLoaded(true)}
              onError={(e) => {
                const imgEl = e.target as HTMLImageElement;
                const fallbackUrl = getUploadUrl(file.path);
                if (imgEl.src !== fallbackUrl) {
                  imgEl.src = fallbackUrl;
                }
                setIsLoaded(true);
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

      {/* Info labels below image exactly matching user request */}
      <div className="flex justify-between items-start px-1.5 pt-3 pb-1.5 z-10 shrink-0">
        <div className="min-w-0 space-y-1">
          <p className="text-xs text-white font-bold truncate leading-none" title={file.filename}>
            {file.filename}
          </p>
          <span className="text-[10px] text-[#64748B] font-bold block leading-none">
            {file.width ? `${file.width} x ${file.height}` : '1920 x 1080'} • {formatBytes(file.size)}
          </span>
        </div>

        {/* Options vertical dots menu */}
        <div className="relative options-menu shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowOptionsPopup(!showOptionsPopup);
            }}
            className="p-1 text-slate-400 hover:text-white rounded transition-colors"
          >
            <MoreVertical size={16} />
          </button>

          {showOptionsPopup && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowOptionsPopup(false)} />
              <div className="absolute right-0 bottom-full mb-1 z-50 w-32 bg-[#1E293B] border border-white/10 rounded-xl p-1 shadow-2xl flex flex-col gap-0.5 animate-in fade-in duration-100">
                <button
                  onClick={() => {
                    onPreview(file);
                    setShowOptionsPopup(false);
                  }}
                  className="w-full px-3 py-1.5 text-left text-[11px] font-bold text-slate-200 hover:bg-white/5 rounded-lg flex items-center gap-1.5"
                >
                  <Eye size={12} /> Preview
                </button>
                <button
                  onClick={() => {
                    onMove(file);
                    setShowOptionsPopup(false);
                  }}
                  className="w-full px-3 py-1.5 text-left text-[11px] font-bold text-slate-200 hover:bg-white/5 rounded-lg flex items-center gap-1.5"
                >
                  <MoveRight size={12} /> Move
                </button>
                <button
                  onClick={() => {
                    onCopy(file);
                    setShowOptionsPopup(false);
                  }}
                  className="w-full px-3 py-1.5 text-left text-[11px] font-bold text-slate-200 hover:bg-white/5 rounded-lg flex items-center gap-1.5"
                >
                  <Copy size={12} /> Copy
                </button>
                <div className="h-px bg-white/5 my-1" />
                <button
                  onClick={() => {
                    if (confirm('Delete asset permanently?')) {
                      onDelete(file.id);
                    }
                    setShowOptionsPopup(false);
                  }}
                  className="w-full px-3 py-1.5 text-left text-[11px] font-bold text-rose-400 hover:bg-rose-500/10 rounded-lg flex items-center gap-1.5"
                >
                  <Trash2 size={12} /> Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
