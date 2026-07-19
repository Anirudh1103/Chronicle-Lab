import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Trash2, Search, Image as ImageIcon, CheckCircle2, ArrowDownRight, Zap } from 'lucide-react';
import { getUploadUrl } from '../utils/url';

export interface MediaFile {
  id: string;
  filename: string;
  path: string;
  mimetype: string;
  size: number;
  originalFormat?: string;
  originalSize?: number;
  optimizedSize?: number;
  compressionRatio?: number;
  width?: number;
  height?: number;
  createdAt: string;
}

/**
 * Formats byte counts into human-readable strings (e.g., 4.2 MB, 420 KB).
 */
function formatBytes(bytes?: number): string {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export function MediaLibrary() {
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { data: media = [], isLoading } = useQuery<MediaFile[]>({
    queryKey: ['media'],
    queryFn: async () => {
      const { data } = await api.get('media');
      return data;
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await api.post('media/upload', formData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media'] });
      setIsUploading(false);
    },
    onError: (err: any) => {
      setIsUploading(false);
      alert('Upload failed: ' + (err.response?.data?.message || err.message));
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`media/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media'] });
    },
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      uploadMutation.mutate(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setIsUploading(true);
      uploadMutation.mutate(file);
    }
  };

  const handleCopyUrl = (file: MediaFile) => {
    const fullUrl = getUploadUrl(file.path);
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(file.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredMedia = media.filter(m =>
    m.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.path.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div
      className="space-y-10 pb-20 min-h-[60vh]"
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      <AnimatePresence>
        {isDragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-primary/20 backdrop-blur-sm border-4 border-dashed border-primary m-6 rounded-[3rem] flex items-center justify-center pointer-events-none"
          >
            <div className="bg-background p-8 rounded-[2rem] shadow-2xl flex flex-col items-center gap-4">
              <Upload size={48} className="text-primary animate-bounce" />
              <p className="text-2xl font-black uppercase tracking-tighter">Drop to optimize & upload</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-black tracking-tight">Media Library</h1>
            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-bold flex items-center gap-1">
              <Zap size={12} /> WebP Pipeline Active
            </span>
          </div>
          <p className="text-muted-foreground text-sm">Automated WebP conversion, proportional resizing & lossless compression.</p>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input
              type="text"
              placeholder="Search assets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full glass bg-muted/20 border-white/5 py-3 pl-12 pr-4 rounded-2xl outline-none focus:ring-2 ring-primary/20 transition-all font-medium"
            />
          </div>

          <label className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-2xl font-black cursor-pointer hover:opacity-90 transition-all shadow-xl shadow-primary/20 whitespace-nowrap">
            <Upload size={20} />
            {isUploading ? 'Optimizing...' : 'Upload New'}
            <input type="file" className="hidden" onChange={handleFileUpload} accept="image/png, image/jpeg, image/jpg, image/webp, image/avif" />
          </label>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="aspect-square bg-muted/50 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          <AnimatePresence>
            {filteredMedia.map((file) => {
              const origFormat = file.originalFormat || 'IMG';
              const origSizeStr = formatBytes(file.originalSize || file.size);
              const optSizeStr = formatBytes(file.optimizedSize || file.size);
              const ratio = file.compressionRatio || 0;

              return (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="group relative aspect-square glass rounded-[2.5rem] overflow-hidden border-white/10 shadow-lg flex flex-col justify-between"
                >
                  <img
                    src={getUploadUrl(file.path)}
                    alt={file.filename}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />

                  {/* Format transition & Compression badge */}
                  <div className="absolute top-3 left-3 right-3 flex justify-between items-center pointer-events-none">
                    <span className="px-2.5 py-1 bg-black/70 backdrop-blur-md text-white border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest">
                      {origFormat} → WEBP
                    </span>

                    {ratio > 0 && (
                      <span className="px-2.5 py-1 bg-emerald-500/90 text-white rounded-full text-[10px] font-black tracking-wider flex items-center gap-0.5 shadow-md">
                        <ArrowDownRight size={12} /> -{ratio}%
                      </span>
                    )}
                  </div>

                  {/* Hover Overlay with Metadata & Action Buttons */}
                  <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-5">
                    <div className="space-y-3">
                      <p className="text-xs text-white font-bold tracking-wide truncate" title={file.filename}>
                        {file.filename}
                      </p>

                      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/10 text-[11px]">
                        <div>
                          <span className="text-slate-400 block text-[9px] uppercase font-black">Original</span>
                          <span className="text-white font-semibold">{origFormat} • {origSizeStr}</span>
                        </div>
                        <div>
                          <span className="text-emerald-400 block text-[9px] uppercase font-black">Optimized</span>
                          <span className="text-emerald-300 font-bold">WEBP • {optSizeStr}</span>
                        </div>
                      </div>

                      {file.width && file.height && (
                        <div className="text-[10px] text-slate-300 font-medium pt-1">
                          Dimensions: <span className="text-white font-bold">{file.width} × {file.height}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 pt-3 border-t border-white/10">
                      <button
                        onClick={() => handleCopyUrl(file)}
                        className="flex-1 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5"
                      >
                        {copiedId === file.id ? (
                          <>
                            <CheckCircle2 size={14} className="text-emerald-400" /> Copied!
                          </>
                        ) : (
                          <>
                            <ImageIcon size={14} /> Copy WebP URL
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`Permanently purge ${file.filename}?`)) {
                            deleteMutation.mutate(file.id);
                          }
                        }}
                        className="p-2 bg-rose-500/20 hover:bg-rose-500/40 text-rose-300 border border-rose-500/30 rounded-xl transition-all"
                        title="Delete asset"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {!isLoading && filteredMedia.length === 0 && (
        <div className="h-64 flex flex-col items-center justify-center text-muted-foreground gap-4">
          <ImageIcon size={48} className="opacity-20" />
          <p className="font-medium text-sm">No media found in library.</p>
        </div>
      )}
    </div>
  );
}
