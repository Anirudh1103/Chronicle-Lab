import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  Trash2,
  Search,
  Image as ImageIcon,
  CheckCircle2,
  ArrowDownRight,
  Zap,
  Folder,
  FolderPlus,
  FolderOpen,
  MoveRight,
  Copy,
  Plus,
  X,
  ChevronRight,
  AlertTriangle
} from 'lucide-react';
import { getUploadUrl } from '../utils/url';
import { cn } from '../utils/cn';

export interface MediaFolder {
  id: string;
  name: string;
  slug: string;
  color?: string;
  createdAt: string;
  _count?: {
    media: number;
  };
}

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
  folderId?: string | null;
  folder?: MediaFolder | null;
  createdAt: string;
}

function formatBytes(bytes?: number): string {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export function MediaLibrary() {
  const queryClient = useQueryClient();
  const [selectedFolderId, setSelectedFolderId] = useState<string>('all');
  const [isUploading, setIsUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Folder creation modal state
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  // Folder deletion modal state
  const [folderToDelete, setFolderToDelete] = useState<MediaFolder | null>(null);

  // Move & Copy Modal States
  const [moveModalItem, setMoveModalItem] = useState<MediaFile | null>(null);
  const [copyModalItem, setCopyModalItem] = useState<MediaFile | null>(null);
  const [targetFolderId, setTargetFolderId] = useState<string>('root');

  // Fetch Folders
  const { data: folders = [] } = useQuery<MediaFolder[]>({
    queryKey: ['media-folders'],
    queryFn: async () => {
      const { data } = await api.get('media/folders');
      return data;
    },
    staleTime: 60 * 1000,
  });

  // Fetch Media Assets
  const { data: media = [], isLoading } = useQuery<MediaFile[]>({
    queryKey: ['media', selectedFolderId],
    queryFn: async () => {
      const params = selectedFolderId !== 'all' ? { folderId: selectedFolderId } : {};
      const { data } = await api.get('media', { params });
      return data;
    },
    staleTime: 60 * 1000,
  });

  // Create Folder Mutation
  const createFolderMutation = useMutation({
    mutationFn: async (name: string) => {
      const { data } = await api.post('media/folders', { name });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media-folders'] });
      setIsCreatingFolder(false);
      setNewFolderName('');
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || 'Failed to create folder');
    }
  });

  // Delete Folder Mutation
  const deleteFolderMutation = useMutation({
    mutationFn: async (folderId: string) => {
      await api.delete(`media/folders/${folderId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media-folders'] });
      queryClient.invalidateQueries({ queryKey: ['media'] });
      if (selectedFolderId !== 'all' && selectedFolderId !== 'root') {
        setSelectedFolderId('all');
      }
      setFolderToDelete(null);
    }
  });

  // Upload Mutation
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      if (selectedFolderId !== 'all' && selectedFolderId !== 'root') {
        formData.append('folderId', selectedFolderId);
      }
      const { data } = await api.post('media/upload', formData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media'] });
      queryClient.invalidateQueries({ queryKey: ['media-folders'] });
      setIsUploading(false);
    },
    onError: (err: any) => {
      setIsUploading(false);
      alert('Upload failed: ' + (err.response?.data?.message || err.message));
    }
  });

  // Move Mutation
  const moveMutation = useMutation({
    mutationFn: async ({ mediaIds, targetFolderId }: { mediaIds: string[]; targetFolderId: string }) => {
      const { data } = await api.post('media/move', { mediaIds, targetFolderId });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media'] });
      queryClient.invalidateQueries({ queryKey: ['media-folders'] });
      setMoveModalItem(null);
    }
  });

  // Copy Mutation
  const copyMutation = useMutation({
    mutationFn: async ({ mediaIds, targetFolderId }: { mediaIds: string[]; targetFolderId: string }) => {
      const { data } = await api.post('media/copy', { mediaIds, targetFolderId });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media'] });
      queryClient.invalidateQueries({ queryKey: ['media-folders'] });
      setCopyModalItem(null);
    }
  });

  // Delete Media Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`media/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media'] });
      queryClient.invalidateQueries({ queryKey: ['media-folders'] });
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

  const activeFolderObj = folders.find(f => f.id === selectedFolderId);

  return (
    <div
      className="space-y-8 pb-20 min-h-[60vh]"
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      {/* Drop overlay */}
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

      {/* Main Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl md:text-4xl font-black tracking-tight">Media Library</h1>
            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-full text-xs font-bold flex items-center gap-1">
              <Zap size={12} /> WebP Engine
            </span>
          </div>
          <p className="text-muted-foreground text-sm">Organize blog images into dedicated folders with WebP optimization.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <div className="relative flex-1 min-w-[200px] lg:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input
              type="text"
              placeholder="Search assets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full glass bg-muted/20 border-white/5 py-2.5 pl-11 pr-4 rounded-2xl outline-none focus:ring-2 ring-primary/20 transition-all font-medium text-sm"
            />
          </div>

          <button
            onClick={() => setIsCreatingFolder(true)}
            className="glass border-white/10 px-4 py-2.5 rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 hover:bg-white/5 transition-all text-slate-200"
          >
            <FolderPlus size={16} className="text-primary" /> New Folder
          </button>

          <label className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-2xl font-black cursor-pointer hover:opacity-90 transition-all shadow-xl shadow-primary/20 text-xs uppercase tracking-wider whitespace-nowrap">
            <Upload size={16} />
            {isUploading ? 'Optimizing...' : 'Upload Asset'}
            <input type="file" className="hidden" onChange={handleFileUpload} accept="image/png, image/jpeg, image/jpg, image/webp, image/avif" />
          </label>
        </div>
      </div>

      {/* Create Folder Modal */}
      <AnimatePresence>
        {isCreatingFolder && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="glass p-6 rounded-3xl border-white/10 shadow-2xl space-y-4 max-w-md"
          >
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h3 className="font-black text-lg flex items-center gap-2">
                <FolderPlus size={20} className="text-primary" /> Create Blog Folder
              </h3>
              <button onClick={() => setIsCreatingFolder(false)} className="text-muted-foreground hover:text-white">
                <X size={18} />
              </button>
            </div>
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="e.g. Decoding Operation Sindhoor"
              className="w-full bg-slate-900 border border-white/10 rounded-2xl p-4 text-sm font-medium text-white outline-none focus:ring-2 ring-primary/30"
              autoFocus
            />
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setIsCreatingFolder(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (newFolderName.trim()) createFolderMutation.mutate(newFolderName.trim());
                }}
                disabled={!newFolderName.trim() || createFolderMutation.isPending}
                className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-black uppercase tracking-wider shadow-lg shadow-primary/20"
              >
                {createFolderMutation.isPending ? 'Creating...' : 'Create Folder'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Folder Modal */}
      <AnimatePresence>
        {folderToDelete && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="glass p-6 rounded-3xl border-rose-500/20 shadow-2xl space-y-4 max-w-md"
          >
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h3 className="font-black text-lg text-rose-400 flex items-center gap-2">
                <AlertTriangle size={20} /> Delete Folder
              </h3>
              <button onClick={() => setFolderToDelete(null)} className="text-muted-foreground hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-bold text-white leading-normal">
                Are you sure you want to delete folder <span className="text-primary">"{folderToDelete.name}"</span>?
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Any media assets inside this folder will be safely unassigned and moved to <strong>Unassigned Root</strong>.
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setFolderToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteFolderMutation.mutate(folderToDelete.id);
                }}
                disabled={deleteFolderMutation.isPending}
                className="px-5 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-rose-500/20"
              >
                {deleteFolderMutation.isPending ? 'Deleting...' : 'Delete Folder'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Folders Toolbar / Horizontal Selector */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
            <Folder size={14} className="text-primary" /> Blog Folders ({folders.length})
          </h2>
        </div>

        <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar">
          <button
            onClick={() => setSelectedFolderId('all')}
            className={cn(
              "px-4 py-2.5 rounded-2xl font-bold text-xs transition-all flex items-center gap-2 border whitespace-nowrap",
              selectedFolderId === 'all'
                ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20 font-black"
                : "glass bg-muted/20 border-white/5 text-muted-foreground hover:text-white"
            )}
          >
            <FolderOpen size={16} /> All Assets ({media.length})
          </button>

          <button
            onClick={() => setSelectedFolderId('root')}
            className={cn(
              "px-4 py-2.5 rounded-2xl font-bold text-xs transition-all flex items-center gap-2 border whitespace-nowrap",
              selectedFolderId === 'root'
                ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20 font-black"
                : "glass bg-muted/20 border-white/5 text-muted-foreground hover:text-white"
            )}
          >
            <Folder size={16} /> Unassigned Root
          </button>

          {folders.map((folder) => (
            <div
              key={folder.id}
              className={cn(
                "group relative flex items-center rounded-2xl transition-all border whitespace-nowrap",
                selectedFolderId === folder.id
                  ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20 font-black"
                  : "glass bg-muted/20 border-white/5 text-slate-200 hover:text-white"
              )}
            >
              <button
                onClick={() => setSelectedFolderId(folder.id)}
                className="px-4 py-2.5 text-xs font-bold flex items-center gap-2"
              >
                <Folder size={16} className={selectedFolderId === folder.id ? "text-white" : "text-primary"} />
                <span>{folder.name}</span>
                <span className="px-1.5 py-0.5 rounded-md bg-white/10 text-[10px] font-mono">
                  {folder._count?.media || 0}
                </span>
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setFolderToDelete(folder);
                }}
                className="pr-3 text-slate-400 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Delete Folder"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Current View Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground bg-slate-900/40 border border-white/5 px-4 py-2 rounded-xl">
        <span>Media Library</span>
        <ChevronRight size={14} />
        <span className="text-primary font-black">
          {selectedFolderId === 'all' ? 'All Assets' : selectedFolderId === 'root' ? 'Unassigned Root' : activeFolderObj?.name || 'Folder'}
        </span>
      </div>

      {/* Move Asset Modal */}
      <AnimatePresence>
        {moveModalItem && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="glass p-6 rounded-3xl border-white/10 shadow-2xl space-y-4 max-w-md"
          >
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h3 className="font-black text-base flex items-center gap-2">
                <MoveRight size={18} className="text-primary" /> Move Asset to Folder
              </h3>
              <button onClick={() => setMoveModalItem(null)} className="text-muted-foreground hover:text-white">
                <X size={18} />
              </button>
            </div>
            <p className="text-xs text-muted-foreground">Select destination folder for <strong>{moveModalItem.filename}</strong>:</p>

            <select
              value={targetFolderId}
              onChange={(e) => setTargetFolderId(e.target.value)}
              className="w-full bg-slate-900 border border-white/10 rounded-2xl p-4 text-sm font-medium text-white outline-none"
            >
              <option value="root">Unassigned Root</option>
              {folders.map(f => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>

            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setMoveModalItem(null)} className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400">
                Cancel
              </button>
              <button
                onClick={() => {
                  moveMutation.mutate({ mediaIds: [moveModalItem.id], targetFolderId });
                }}
                className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-black uppercase tracking-wider"
              >
                Move Asset
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Copy Asset Modal */}
      <AnimatePresence>
        {copyModalItem && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="glass p-6 rounded-3xl border-white/10 shadow-2xl space-y-4 max-w-md"
          >
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h3 className="font-black text-base flex items-center gap-2">
                <Copy size={18} className="text-primary" /> Copy Asset to Folder
              </h3>
              <button onClick={() => setCopyModalItem(null)} className="text-muted-foreground hover:text-white">
                <X size={18} />
              </button>
            </div>
            <p className="text-xs text-muted-foreground">Duplicate <strong>{copyModalItem.filename}</strong> into folder:</p>

            <select
              value={targetFolderId}
              onChange={(e) => setTargetFolderId(e.target.value)}
              className="w-full bg-slate-900 border border-white/10 rounded-2xl p-4 text-sm font-medium text-white outline-none"
            >
              <option value="root">Unassigned Root</option>
              {folders.map(f => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>

            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setCopyModalItem(null)} className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400">
                Cancel
              </button>
              <button
                onClick={() => {
                  copyMutation.mutate({ mediaIds: [copyModalItem.id], targetFolderId });
                }}
                className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-black uppercase tracking-wider"
              >
                Copy Asset
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Media Grid */}
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

                  {/* Format & Compression Badges */}
                  <div className="absolute top-3 left-3 right-3 flex justify-between items-center pointer-events-none z-10">
                    <span className="px-2.5 py-1 bg-black/70 backdrop-blur-md text-white border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest">
                      {origFormat} → WEBP
                    </span>

                    {file.folder && (
                      <span className="px-2 py-0.5 bg-primary/90 text-white rounded-full text-[9px] font-black tracking-wider shadow">
                        {file.folder.name}
                      </span>
                    )}
                  </div>

                  {/* Hover Overlay with Metadata & Action Controls */}
                  <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-4 z-20">
                    <div className="space-y-2">
                      <p className="text-xs text-white font-bold tracking-wide truncate" title={file.filename}>
                        {file.filename}
                      </p>

                      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/10 text-[10px]">
                        <div>
                          <span className="text-slate-400 block text-[8px] uppercase font-black">Original</span>
                          <span className="text-white font-semibold">{origFormat} • {origSizeStr}</span>
                        </div>
                        <div>
                          <span className="text-emerald-400 block text-[8px] uppercase font-black">Optimized</span>
                          <span className="text-emerald-300 font-bold">WEBP • {optSizeStr}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-white/10">
                      {/* Action buttons row 1 */}
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => setMoveModalItem(file)}
                          className="flex-1 py-1.5 bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold rounded-xl flex items-center justify-center gap-1 transition-all"
                          title="Move asset to folder"
                        >
                          <MoveRight size={12} /> Move
                        </button>
                        <button
                          onClick={() => setCopyModalItem(file)}
                          className="flex-1 py-1.5 bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold rounded-xl flex items-center justify-center gap-1 transition-all"
                          title="Copy asset to folder"
                        >
                          <Copy size={12} /> Copy
                        </button>
                      </div>

                      {/* Action buttons row 2 */}
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleCopyUrl(file)}
                          className="flex-1 py-2 bg-primary/80 hover:bg-primary text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1 shadow"
                        >
                          {copiedId === file.id ? (
                            <>
                              <CheckCircle2 size={12} /> Copied!
                            </>
                          ) : (
                            <>
                              <ImageIcon size={12} /> Copy WebP URL
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
                          <Trash2 size={14} />
                        </button>
                      </div>
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
          <p className="font-medium text-sm">No media assets found in this folder scope.</p>
        </div>
      )}
    </div>
  );
}
