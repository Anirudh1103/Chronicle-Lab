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
  Folder as FolderIcon,
  FolderPlus,
  FolderOpen,
  MoveRight,
  Copy,
  Plus,
  X,
  ChevronRight,
  AlertTriangle,
  Loader2,
  Sparkles,
  Eye,
  Maximize2
} from 'lucide-react';
import { getUploadUrl } from '../utils/url';
import { cn } from '../utils/cn';

export interface MediaFolder {
  id: string;
  name: string;
  slug: string;
  color?: string;
  _count?: { media: number };
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

export function MediaLibrary() {
  const queryClient = useQueryClient();
  const [selectedFolderId, setSelectedFolderId] = useState<string | 'all' | 'null'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modals state
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderColor, setNewFolderColor] = useState('#38bdf8');

  const [deleteFolderModal, setDeleteFolderModal] = useState<MediaFolder | null>(null);
  const [moveModalItem, setMoveModalItem] = useState<MediaFile | null>(null);
  const [copyModalItem, setCopyModalItem] = useState<MediaFile | null>(null);
  const [previewModalItem, setPreviewModalItem] = useState<MediaFile | null>(null);

  // Upload Progress Screen State
  const [uploadProgress, setUploadProgress] = useState<{
    total: number;
    completed: number;
    currentName: string;
    isConverting: boolean;
  } | null>(null);

  // Fetch Folders
  const { data: folders = [] } = useQuery<MediaFolder[]>({
    queryKey: ['folders'],
    queryFn: async () => {
      const { data } = await api.get('/media/folders');
      return data;
    },
  });

  // Fetch Media Assets
  const { data: media = [], isLoading } = useQuery<MediaFile[]>({
    queryKey: ['media', selectedFolderId],
    queryFn: async () => {
      const endpoint = selectedFolderId && selectedFolderId !== 'all'
        ? `/media?folderId=${selectedFolderId}`
        : '/media';
      const { data } = await api.get(endpoint);
      return data;
    },
  });

  // Folder Mutations
  const createFolderMutation = useMutation({
    mutationFn: async (payload: { name: string; color: string }) => {
      const { data } = await api.post('/media/folders', payload);
      return data;
    },
    onSuccess: (newFolder) => {
      queryClient.invalidateQueries({ queryKey: ['folders'] });
      setShowFolderModal(false);
      setNewFolderName('');
      setSelectedFolderId(newFolder.id);
    },
  });

  const deleteFolderMutation = useMutation({
    mutationFn: async (folderId: string) => {
      await api.delete(`/media/folders/${folderId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['folders'] });
      queryClient.invalidateQueries({ queryKey: ['media'] });
      setDeleteFolderModal(null);
      setSelectedFolderId('all');
    },
  });

  const moveMediaMutation = useMutation({
    mutationFn: async (payload: { mediaIds: string[]; targetFolderId: string | null }) => {
      await api.post('/media/move', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media'] });
      queryClient.invalidateQueries({ queryKey: ['folders'] });
      setMoveModalItem(null);
    },
  });

  const copyMediaMutation = useMutation({
    mutationFn: async (payload: { mediaIds: string[]; targetFolderId: string | null }) => {
      await api.post('/media/copy', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media'] });
      queryClient.invalidateQueries({ queryKey: ['folders'] });
      setCopyModalItem(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/media/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media'] });
      queryClient.invalidateQueries({ queryKey: ['folders'] });
    },
  });

  // Batch Multi-Asset Upload Handler with Live Conversion Progress Screen
  const handleBatchUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploadProgress({
      total: files.length,
      completed: 0,
      currentName: files[0].name,
      isConverting: true
    });

    try {
      const formData = new FormData();
      files.forEach(f => formData.append('files', f));
      if (selectedFolderId && selectedFolderId !== 'all' && selectedFolderId !== 'null') {
        formData.append('folderId', selectedFolderId);
      }

      await api.post('/media/upload', formData, {
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            const simulatedCompleted = Math.min(files.length, Math.floor((percent / 100) * files.length));
            setUploadProgress(prev => prev ? {
              ...prev,
              completed: simulatedCompleted,
              currentName: files[Math.min(simulatedCompleted, files.length - 1)].name
            } : null);
          }
        }
      });

      setUploadProgress(prev => prev ? { ...prev, completed: files.length, isConverting: false } : null);
      setTimeout(() => {
        setUploadProgress(null);
        queryClient.invalidateQueries({ queryKey: ['media'] });
        queryClient.invalidateQueries({ queryKey: ['folders'] });
      }, 800);
    } catch (err) {
      console.error('Batch upload error:', err);
      alert('Upload failed. Please check network connectivity.');
      setUploadProgress(null);
    }
  };

  const handleCopyUrl = (file: MediaFile) => {
    const fullUrl = getUploadUrl(file.path);
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(file.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatBytes = (bytes?: number) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const filteredMedia = media.filter(m => {
    const matchesSearch = m.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          m.path.toLowerCase().includes(searchTerm.toLowerCase());
    if (selectedFolderId === 'all') return matchesSearch;
    if (selectedFolderId === 'null') return matchesSearch && !m.folderId;
    return matchesSearch && m.folderId === selectedFolderId;
  });

  const activeFolder = folders.find(f => f.id === selectedFolderId);

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-black uppercase tracking-widest rounded-full border border-primary/20">
              Media Hub
            </span>
            {activeFolder && (
              <span className="flex items-center gap-1 text-xs font-bold text-slate-400">
                <ChevronRight size={14} /> {activeFolder.name}
              </span>
            )}
          </div>
          <h1 className="text-4xl font-black tracking-tight mt-1">Asset & Folder Library</h1>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => setShowFolderModal(true)}
            className="px-5 py-3 glass hover:bg-white/10 text-white rounded-2xl font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 border border-white/10 active:scale-95 shadow-lg"
          >
            <FolderPlus size={16} className="text-sky-400" /> New Folder
          </button>

          <label className="cursor-pointer px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 active:scale-95 shadow-xl shadow-primary/20">
            <Upload size={16} /> Upload Assets
            <input
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={handleBatchUpload}
            />
          </label>
        </div>
      </div>

      {/* Folder Selection Bar */}
      <div className="glass p-4 rounded-3xl border border-white/10 flex flex-wrap items-center gap-3 shadow-xl">
        <button
          onClick={() => setSelectedFolderId('all')}
          className={cn(
            "px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2",
            selectedFolderId === 'all'
              ? "bg-primary text-white shadow-lg shadow-primary/30"
              : "hover:bg-white/5 text-slate-400"
          )}
        >
          <FolderIcon size={16} className="text-primary" /> All Assets
        </button>

        <button
          onClick={() => setSelectedFolderId('null')}
          className={cn(
            "px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2",
            selectedFolderId === 'null'
              ? "bg-primary text-white shadow-lg shadow-primary/30"
              : "hover:bg-white/5 text-slate-400"
          )}
        >
          <FolderOpen size={16} className="text-slate-400" /> Unassigned (Root)
        </button>

        <div className="h-6 w-px bg-white/10 mx-1" />

        {folders.map((folder) => (
          <div key={folder.id} className="relative group">
            <button
              onClick={() => setSelectedFolderId(folder.id)}
              className={cn(
                "px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 pr-8",
                selectedFolderId === folder.id
                  ? "bg-primary text-white shadow-lg shadow-primary/30"
                  : "glass hover:bg-white/10 text-slate-200 border border-white/5"
              )}
            >
              <FolderIcon size={16} style={{ color: folder.color || '#38bdf8' }} />
              <span>{folder.name}</span>
              <span className="ml-1 px-2 py-0.5 bg-black/30 rounded-full text-[10px] font-black text-white">
                {folder._count?.media || 0}
              </span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setDeleteFolderModal(folder);
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
              title="Delete Folder"
            >
              <Trash2 size={12} />
            </button>
          </div>
        ))}
      </div>

      {/* Search Filter */}
      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
        <input
          type="text"
          placeholder="Filter by filename or format..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full glass border border-white/10 py-3 pl-12 pr-4 rounded-2xl text-sm outline-none focus:ring-2 ring-primary/20"
        />
      </div>

      {/* Fullscreen Image Preview Lightbox Modal */}
      <AnimatePresence>
        {previewModalItem && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative max-w-5xl w-full max-h-[90vh] bg-slate-900 border border-white/10 rounded-[2.5rem] overflow-hidden flex flex-col shadow-2xl"
            >
              {/* Lightbox Header */}
              <div className="p-6 border-b border-white/10 flex justify-between items-center bg-slate-950/80">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-sky-500/20 text-sky-400 rounded-full text-[10px] font-black uppercase border border-sky-500/30">
                      Full Asset Preview
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      {previewModalItem.width || 1920} x {previewModalItem.height || 1080} Resolution
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-white mt-1">{previewModalItem.filename}</h3>
                </div>
                <button
                  onClick={() => setPreviewModalItem(null)}
                  className="p-3 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors"
                >
                  <X size={22} />
                </button>
              </div>

              {/* Lightbox Image Preview Area */}
              <div className="flex-1 overflow-hidden p-6 bg-slate-950 flex items-center justify-center relative">
                <img
                  src={getUploadUrl(previewModalItem.path)}
                  alt={previewModalItem.filename}
                  className="max-w-full max-h-[60vh] object-contain rounded-2xl shadow-2xl border border-white/10"
                />
              </div>

              {/* Lightbox Metadata Footer */}
              <div className="p-6 border-t border-white/10 bg-slate-900 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase font-black">Original Format</span>
                  <span className="text-white font-bold">{previewModalItem.originalFormat || 'IMG'} ({formatBytes(previewModalItem.originalSize || previewModalItem.size)})</span>
                </div>
                <div>
                  <span className="text-emerald-400 block text-[9px] uppercase font-black">Optimized WebP</span>
                  <span className="text-emerald-300 font-bold">{formatBytes(previewModalItem.optimizedSize || previewModalItem.size)}</span>
                </div>
                <div>
                  <span className="text-sky-400 block text-[9px] uppercase font-black">Storage Folder</span>
                  <span className="text-sky-300 font-bold">{previewModalItem.folder?.name || 'Root / Unassigned'}</span>
                </div>
                <div>
                  <button
                    onClick={() => handleCopyUrl(previewModalItem)}
                    className="w-full py-2.5 bg-primary hover:bg-primary/90 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow"
                  >
                    Copy WebP URL
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* WebP Conversion & Upload Progress Screen Modal */}
      <AnimatePresence>
        {uploadProgress && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="glass border border-white/10 rounded-[3rem] p-8 max-w-md w-full text-center space-y-6 shadow-2xl"
            >
              <div className="w-16 h-16 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center mx-auto text-primary animate-pulse">
                <Sparkles size={32} />
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-black">Converting Assets to WebP</h3>
                <p className="text-xs text-muted-foreground truncate">
                  Processing: <span className="font-mono text-primary font-bold">{uploadProgress.currentName}</span>
                </p>
              </div>

              <div className="space-y-2">
                <div className="w-full h-3 bg-muted/50 rounded-full overflow-hidden p-0.5 border border-white/10">
                  <motion.div
                    className="h-full bg-gradient-to-r from-blue-500 to-sky-400 rounded-full"
                    initial={{ width: '0%' }}
                    animate={{ width: `${Math.round((uploadProgress.completed / uploadProgress.total) * 100)}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-400 px-1">
                  <span>Progress: {Math.round((uploadProgress.completed / uploadProgress.total) * 100)}%</span>
                  <span>{uploadProgress.completed} of {uploadProgress.total} Files</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Folder Creation Modal */}
      <AnimatePresence>
        {showFolderModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="glass border border-white/10 rounded-[2.5rem] p-8 max-w-md w-full space-y-6 shadow-2xl"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-black">Create Blog Folder</h3>
                <button onClick={() => setShowFolderModal(false)} className="p-2 hover:bg-white/10 rounded-full">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Folder Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Operation Sindhoor"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 ring-primary/40 text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Badge Color</label>
                  <div className="flex gap-3">
                    {['#38bdf8', '#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b'].map((c) => (
                      <button
                        key={c}
                        onClick={() => setNewFolderColor(c)}
                        className={cn(
                          "w-8 h-8 rounded-full transition-transform",
                          newFolderColor === c && "scale-125 ring-2 ring-white ring-offset-2 ring-offset-slate-900"
                        )}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowFolderModal(false)}
                  className="flex-1 py-3 glass hover:bg-white/10 rounded-xl font-bold text-xs uppercase"
                >
                  Cancel
                </button>
                <button
                  disabled={!newFolderName.trim() || createFolderMutation.isPending}
                  onClick={() => createFolderMutation.mutate({ name: newFolderName, color: newFolderColor })}
                  className="flex-1 py-3 bg-primary hover:bg-primary/90 text-white font-black text-xs uppercase rounded-xl shadow-lg"
                >
                  {createFolderMutation.isPending ? 'Creating...' : 'Create Folder'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Folder Modal */}
      <AnimatePresence>
        {deleteFolderModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="glass border border-rose-500/30 rounded-[2.5rem] p-8 max-w-md w-full text-center space-y-6 shadow-2xl"
            >
              <div className="w-16 h-16 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/30">
                <AlertTriangle size={32} />
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-black text-white">Delete Folder?</h3>
                <p className="text-xs text-slate-300">
                  Are you sure you want to delete <span className="font-bold text-white">"{deleteFolderModal.name}"</span>?
                  Assets in this folder will be moved to <span className="font-bold text-sky-400">Root / Unassigned</span>.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setDeleteFolderModal(null)}
                  className="flex-1 py-3 glass hover:bg-white/10 rounded-xl font-bold text-xs uppercase text-slate-300"
                >
                  Cancel
                </button>
                <button
                  onClick={() => deleteFolderMutation.mutate(deleteFolderModal.id)}
                  className="flex-1 py-3 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs uppercase rounded-xl shadow-lg"
                >
                  Delete Folder
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Move Asset Modal */}
      <AnimatePresence>
        {moveModalItem && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="glass border border-white/10 rounded-[2.5rem] p-8 max-w-md w-full space-y-6 shadow-2xl"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-black">Move Asset to Folder</h3>
                <button onClick={() => setMoveModalItem(null)} className="p-2 hover:bg-white/10 rounded-full">
                  <X size={20} />
                </button>
              </div>

              <p className="text-xs text-slate-300">
                Select target folder for <span className="font-bold text-white">{moveModalItem.filename}</span>:
              </p>

              <div className="space-y-2 max-h-60 overflow-y-auto">
                <button
                  onClick={() => moveMediaMutation.mutate({ mediaIds: [moveModalItem.id], targetFolderId: null })}
                  className="w-full p-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-left text-xs font-bold text-slate-300 flex items-center gap-2"
                >
                  <FolderOpen size={16} /> Root (Unassigned)
                </button>

                {folders.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => moveMediaMutation.mutate({ mediaIds: [moveModalItem.id], targetFolderId: f.id })}
                    className="w-full p-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-left text-xs font-bold text-white flex items-center gap-2"
                  >
                    <FolderIcon size={16} style={{ color: f.color || '#38bdf8' }} /> {f.name}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Copy Asset Modal */}
      <AnimatePresence>
        {copyModalItem && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="glass border border-white/10 rounded-[2.5rem] p-8 max-w-md w-full space-y-6 shadow-2xl"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-black">Copy Asset to Folder</h3>
                <button onClick={() => setCopyModalItem(null)} className="p-2 hover:bg-white/10 rounded-full">
                  <X size={20} />
                </button>
              </div>

              <p className="text-xs text-slate-300">
                Select target folder for a copy of <span className="font-bold text-white">{copyModalItem.filename}</span>:
              </p>

              <div className="space-y-2 max-h-60 overflow-y-auto">
                <button
                  onClick={() => copyMediaMutation.mutate({ mediaIds: [copyModalItem.id], targetFolderId: null })}
                  className="w-full p-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-left text-xs font-bold text-slate-300 flex items-center gap-2"
                >
                  <FolderOpen size={16} /> Root (Unassigned)
                </button>

                {folders.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => copyMediaMutation.mutate({ mediaIds: [copyModalItem.id], targetFolderId: f.id })}
                    className="w-full p-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-left text-xs font-bold text-white flex items-center gap-2"
                  >
                    <FolderIcon size={16} style={{ color: f.color || '#38bdf8' }} /> {f.name}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Media Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="aspect-[16/10] bg-muted/50 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-6">
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
                  onClick={() => setPreviewModalItem(file)}
                  className="group relative aspect-[16/10] bg-slate-950 rounded-[2rem] overflow-hidden border border-white/10 shadow-xl flex flex-col justify-between p-1 cursor-pointer"
                >
                  <img
                    src={getUploadUrl(file.path)}
                    alt={file.filename}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-contain rounded-xl group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = getUploadUrl(file.filename);
                    }}
                  />

                  {/* Format & Compression Badges */}
                  <div className="absolute top-3 left-3 right-3 flex justify-between items-center pointer-events-none z-10">
                    <span className="px-2.5 py-1 bg-black/80 backdrop-blur-md text-white border border-white/10 rounded-full text-[9px] font-black uppercase tracking-widest">
                      {origFormat} → WEBP
                    </span>

                    {file.folder && (
                      <span className="px-2.5 py-0.5 bg-primary/90 text-white rounded-full text-[9px] font-black tracking-wider shadow">
                        {file.folder.name}
                      </span>
                    )}
                  </div>

                  {/* Hover Overlay with Metadata & Action Controls */}
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-4 z-20 rounded-[2rem]"
                  >
                    <div className="space-y-1.5">
                      <p className="text-xs text-white font-bold tracking-wide truncate" title={file.filename}>
                        {file.filename}
                      </p>

                      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/10 text-[9px]">
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

                    {/* Prominent Full Preview Button */}
                    <button
                      onClick={() => setPreviewModalItem(file)}
                      className="w-full py-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-black text-[11px] uppercase tracking-wider rounded-xl transition-all shadow-lg flex items-center justify-center gap-1.5 active:scale-95"
                    >
                      <Eye size={14} /> Preview Image
                    </button>

                    <div className="space-y-1.5 pt-1.5 border-t border-white/10">
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
                          className="flex-1 py-1.5 bg-primary/80 hover:bg-primary text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1 shadow"
                        >
                          {copiedId === file.id ? (
                            <>
                              <CheckCircle2 size={12} /> Copied!
                            </>
                          ) : (
                            <>
                              <ImageIcon size={12} /> Copy URL
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => {
                            if (confirm(`Permanently purge ${file.filename}?`)) {
                              deleteMutation.mutate(file.id);
                            }
                          }}
                          className="p-1.5 bg-rose-500/20 hover:bg-rose-500/40 text-rose-300 border border-rose-500/30 rounded-xl transition-all"
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
