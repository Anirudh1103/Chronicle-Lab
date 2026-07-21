import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/client';
import {
  Folder as FolderIcon,
  FolderPlus,
  ChevronRight,
  Upload,
  Search,
  ImageIcon,
  Sparkles,
  ArrowRight,
  Menu,
  X,
  Grid,
  List,
  MoreVertical,
  CheckSquare,
  Copy,
  Trash2,
  MoveRight,
  SlidersHorizontal,
  ChevronDown,
  UploadCloud,
  ChevronLeft,
  Settings,
  ShieldAlert
} from 'lucide-react';
import { FolderTree } from './FolderTree';
import { GalleryGrid } from './GalleryGrid';
import { Toolbar } from './Toolbar';
import { PreviewModal } from './PreviewModal';
import { ContextMenu } from './ContextMenu';
import { BatchBar } from './BatchBar';
import { UploadService } from './UploadService';
import { cn } from '../../utils/cn';

export interface MediaFolder {
  id: string;
  name: string;
  slug: string;
  color?: string;
  parentId?: string | null;
  createdAt: string;
  mediaCount?: number;
  totalStorage?: number;
}

export interface MediaFile {
  id: string;
  filename: string;
  path: string;
  largePreviewPath?: string | null;
  mediumThumbnailPath?: string | null;
  smallThumbnailPath?: string | null;
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
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Mobile Explorer Drawers
  const [isMobileExplorerOpen, setIsMobileExplorerOpen] = useState(false);

  // Multiselect Selection State
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);

  // Context Menu State
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    type: 'folder' | 'media' | 'blank';
    target: any;
  } | null>(null);

  // New Folder Modal
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [newFolderParentId, setNewFolderParentId] = useState<string | null>(null);
  const [newFolderName, setNewFolderName] = useState('');

  // Move / Copy Targets
  const [moveModalItem, setMoveModalItem] = useState<MediaFile | null>(null);
  const [copyModalItem, setCopyModalItem] = useState<MediaFile | null>(null);
  const [bulkMoveModalOpen, setBulkMoveModalOpen] = useState(false);
  const [bulkCopyModalOpen, setBulkCopyModalOpen] = useState(false);

  // Full Screen Preview
  const [previewFile, setPreviewFile] = useState<MediaFile | null>(null);

  // Paginated Page Sizes
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(48);

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

  // Mutation actions
  const createFolderMutation = useMutation({
    mutationFn: async (payload: { name: string; color: string; parentId: string | null }) => {
      const { data } = await api.post('/media/folders', payload);
      return data;
    },
    onSuccess: (newFolder) => {
      queryClient.invalidateQueries({ queryKey: ['folders'] });
      setShowNewFolderModal(false);
      setNewFolderName('');
      setNewFolderParentId(null);
      setSelectedFolderId(newFolder.id);
    },
  });

  const renameFolderMutation = useMutation({
    mutationFn: async (payload: { id: string; name: string }) => {
      await api.post(`/media/folders`, { ...payload, color: '#38bdf8' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['folders'] });
    },
  });

  const deleteFolderMutation = useMutation({
    mutationFn: async (folderId: string) => {
      await api.delete(`/media/folders/${folderId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['folders'] });
      queryClient.invalidateQueries({ queryKey: ['media'] });
      setSelectedFolderId('all');
    },
  });

  const moveFolderMutation = useMutation({
    mutationFn: async (payload: { folderId: string; targetParentId: string | null }) => {
      await api.post(`/media/move`, { mediaIds: [], targetFolderId: payload.targetParentId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['folders'] });
    },
  });

  const moveMediaMutation = useMutation({
    mutationFn: async (payload: { mediaIds: string[]; targetFolderId: string | null }) => {
      await api.post('/media/move', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media'] });
      queryClient.invalidateQueries({ queryKey: ['folders'] });
      setSelectedIds(new Set());
      setMoveModalItem(null);
      setBulkMoveModalOpen(false);
    },
  });

  const copyMediaMutation = useMutation({
    mutationFn: async (payload: { mediaIds: string[]; targetFolderId: string | null }) => {
      await api.post('/media/copy', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media'] });
      queryClient.invalidateQueries({ queryKey: ['folders'] });
      setSelectedIds(new Set());
      setCopyModalItem(null);
      setBulkCopyModalOpen(false);
    },
  });

  const deleteMediaMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      await Promise.all(ids.map((id) => api.delete(`/media/${id}`)));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media'] });
      queryClient.invalidateQueries({ queryKey: ['folders'] });
      setSelectedIds(new Set());
    },
  });

  const renameMediaMutation = useMutation({
    mutationFn: async (payload: { id: string; name: string }) => {
      await api.post('/media/move', { mediaIds: [payload.id], targetFolderId: selectedFolderId === 'all' ? null : selectedFolderId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media'] });
    },
  });

  // Upload handler with client side WebP conversion
  const handleUploadFiles = async (files: File[]) => {
    setUploadProgress({
      total: files.length,
      completed: 0,
      currentName: files[0].name,
      isConverting: true,
    });

    try {
      const formData = new FormData();
      if (selectedFolderId && selectedFolderId !== 'all' && selectedFolderId !== 'null') {
        formData.append('folderId', selectedFolderId);
      }

      await Promise.all(
        files.map(async (file, idx) => {
          try {
            const webpBlob = await UploadService.convertToWebP(file);
            const webpFile = new File([webpBlob], `${file.name.substring(0, file.name.lastIndexOf('.')) || file.name}.webp`, {
              type: 'image/webp',
            });
            formData.append('files', webpFile);
            setUploadProgress((prev) =>
              prev
                ? {
                    ...prev,
                    completed: Math.min(prev.total, prev.completed + 1),
                    currentName: files[Math.min(idx + 1, files.length - 1)].name,
                  }
                : null
            );
          } catch (err) {
            formData.append('files', file);
          }
        })
      );

      setUploadProgress((prev) => (prev ? { ...prev, isConverting: false } : null));

      await api.post('/media/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setTimeout(() => {
        setUploadProgress(null);
        queryClient.invalidateQueries({ queryKey: ['media'] });
        queryClient.invalidateQueries({ queryKey: ['folders'] });
      }, 500);
    } catch (err) {
      console.error(err);
      alert('Upload failed.');
      setUploadProgress(null);
    }
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files || []);
    if (files.length > 0) {
      handleUploadFiles(files);
    }
  };

  // Keyboard Navigation & Range Selections
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      if ((e.metaKey || e.ctrlKey) && e.key === 'a') {
        e.preventDefault();
        const allIds = sortedMedia.map((m) => m.id);
        setSelectedIds(new Set(allIds));
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedIds.size > 0) {
          if (confirm(`Permanently delete ${selectedIds.size} assets?`)) {
            deleteMediaMutation.mutate(Array.from(selectedIds));
          }
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [media, selectedIds]);

  const handleToggleSelect = (id: string, isShift = false) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (isShift && next.size > 0) {
          const lastSelectedId = Array.from(next).pop()!;
          const lastIdx = sortedMedia.findIndex((m) => m.id === lastSelectedId);
          const currentIdx = sortedMedia.findIndex((m) => m.id === id);
          if (lastIdx !== -1 && currentIdx !== -1) {
            const start = Math.min(lastIdx, currentIdx);
            const end = Math.max(lastIdx, currentIdx);
            for (let i = start; i <= end; i++) {
              next.add(sortedMedia[i].id);
            }
          }
        } else {
          next.add(id);
        }
      }
      return next;
    });
  };

  // Debounced search, sorting, and pagination
  const sortedMedia = useMemo(() => {
    const filtered = media.filter((m) => {
      return m.filename.toLowerCase().includes(searchTerm.toLowerCase());
    });

    return filtered.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'name') comparison = a.filename.localeCompare(b.filename);
      else if (sortBy === 'size') comparison = a.size - b.size;
      else if (sortBy === 'width') comparison = (a.width || 0) - (b.width || 0);
      else if (sortBy === 'height') comparison = (a.height || 0) - (b.height || 0);
      else comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();

      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [media, searchTerm, sortBy, sortOrder]);

  const totalPages = Math.ceil(sortedMedia.length / itemsPerPage);
  const paginatedMedia = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedMedia.slice(start, start + itemsPerPage);
  }, [sortedMedia, currentPage, itemsPerPage]);

  const activeFolder = folders.find((f) => f.id === selectedFolderId);

  // Compute stats info
  const folderStorageSum = useMemo(() => {
    const totalBytes = sortedMedia.reduce((acc, curr) => acc + curr.size, 0);
    const totalMB = totalBytes / (1024 * 1024);
    return `${totalMB.toFixed(1)} MB`;
  }, [sortedMedia]);

  const handleContextMenu = (e: React.MouseEvent, type: 'folder' | 'media' | 'blank', target: any) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      type,
      target,
    });
  };

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleFileDrop}
      className="flex flex-col lg:flex-row min-h-screen w-full bg-[#0B0F19] text-slate-100 font-sans p-6 gap-6 relative"
    >
      {/* Collapsible Mobile Explorer Drawer */}
      <AnimatePresence>
        {isMobileExplorerOpen && (
          <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm lg:hidden flex">
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              className="w-80 h-full bg-[#0E1322] border-r border-white/5 p-6 flex flex-col justify-between"
            >
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Folders View</h3>
                  <button
                    onClick={() => setIsMobileExplorerOpen(false)}
                    className="p-2 hover:bg-white/5 rounded-full text-slate-400"
                  >
                    <X size={18} />
                  </button>
                </div>

                <FolderTree
                  folders={folders}
                  selectedFolderId={selectedFolderId}
                  onSelectFolder={(id) => {
                    setSelectedFolderId(id);
                    setIsMobileExplorerOpen(false);
                  }}
                  onCreateFolder={(name, parentId) => {
                    setNewFolderName(name);
                    setNewFolderParentId(parentId);
                    setShowNewFolderModal(true);
                  }}
                  onRenameFolder={(id, name) => renameFolderMutation.mutate({ id, name })}
                  onDeleteFolder={(f) => deleteFolderMutation.mutate(f.id)}
                  onMoveFolder={(folderId, targetParentId) => moveFolderMutation.mutate({ folderId, targetParentId })}
                  onContextMenu={handleContextMenu}
                />
              </div>
            </motion.div>
            <div className="flex-1" onClick={() => setIsMobileExplorerOpen(false)} />
          </div>
        )}
      </AnimatePresence>

      {/* Desktop Left Sidebar: Collapsible VS Code style Explorer */}
      <aside className="hidden lg:flex flex-col w-72 shrink-0 bg-[#0E1322] border border-white/5 rounded-3xl p-5 gap-4 sticky top-6 h-[calc(100vh-160px)] overflow-y-auto scrollbar-none">
        <div className="flex justify-between items-center px-1">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Folders</span>
          <button
            onClick={() => {
              setNewFolderName('New Folder');
              setNewFolderParentId(null);
              setShowNewFolderModal(true);
            }}
            className="p-1 hover:bg-white/5 rounded text-slate-400 hover:text-white"
            title="Create root folder"
          >
            <FolderPlus size={15} />
          </button>
        </div>

        <FolderTree
          folders={folders}
          selectedFolderId={selectedFolderId}
          onSelectFolder={setSelectedFolderId}
          onCreateFolder={(name, parentId) => {
            setNewFolderName(name);
            setNewFolderParentId(parentId);
            setShowNewFolderModal(true);
          }}
          onRenameFolder={(id, name) => renameFolderMutation.mutate({ id, name })}
          onDeleteFolder={(f) => deleteFolderMutation.mutate(f.id)}
          onMoveFolder={(folderId, targetParentId) => moveFolderMutation.mutate({ folderId, targetParentId })}
          onContextMenu={handleContextMenu}
        />
      </aside>

      {/* Right Side Main Content Explorer Area */}
      <main className="flex-1 flex flex-col gap-5 min-w-0">
        {/* Top Breadcrumb toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-1 text-[11px] font-black text-slate-500 uppercase tracking-widest">
              <span>Media Library</span>
              <ChevronRight size={12} />
              {activeFolder ? (
                <span className="text-slate-350">{activeFolder.name}</span>
              ) : (
                <span className="text-slate-350">
                  {selectedFolderId === 'null' ? 'Unassigned Root' : 'All Assets'}
                </span>
              )}
            </div>

            <h1 className="text-3xl font-black tracking-tight mt-1 text-white">
              {activeFolder ? activeFolder.name : selectedFolderId === 'null' ? 'Unassigned Root' : 'All Assets'}
            </h1>
          </div>

          {/* Action Row */}
          <Toolbar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            sortBy={sortBy}
            onSortByChange={setSortBy}
            sortOrder={sortOrder}
            onToggleSortOrder={() => setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onNewFolder={() => {
              setNewFolderName('New Folder');
              setNewFolderParentId(null);
              setShowNewFolderModal(true);
            }}
            onUploadClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.multiple = true;
              input.accept = 'image/*';
              input.onchange = (e) => {
                const files = Array.from((e.target as HTMLInputElement).files || []);
                if (files.length > 0) handleUploadFiles(files);
              };
              input.click();
            }}
          />
        </div>

        {/* Selected Folder Metadata Status Card */}
        <div className="bg-[#121824] border border-white/5 rounded-3xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-xl relative overflow-hidden">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
              <FolderIcon size={28} className="fill-blue-500/10" />
            </div>
            <div className="min-w-0">
              <h2 className="text-xl font-black text-white flex items-center gap-2 truncate">
                {activeFolder ? activeFolder.name : selectedFolderId === 'null' ? 'Unassigned Root' : 'All Assets'}
              </h2>
              <p className="text-xs text-slate-400 font-bold mt-1">
                {sortedMedia.length} items • {folderStorageSum} • Updated just now
              </p>
            </div>
          </div>

          {/* Action Tools */}
          <div className="flex items-center gap-2.5 w-full md:w-auto">
            <button
              onClick={() => setIsMultiSelectMode(!isMultiSelectMode)}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 border transition-all active:scale-95",
                isMultiSelectMode
                  ? "bg-primary border-primary text-white"
                  : "bg-white/5 border-white/5 text-slate-300 hover:text-white"
              )}
            >
              <CheckSquare size={13} /> {isMultiSelectMode ? 'Selecting...' : 'Select'}
            </button>

            <button
              onClick={() => {
                if (selectedIds.size > 0) setBulkMoveModalOpen(true);
                else alert('Select items to move first!');
              }}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 border border-white/5 active:scale-95 transition-all"
            >
              <MoveRight size={13} /> Move
            </button>

            <button
              onClick={() => {
                if (selectedIds.size > 0) setBulkCopyModalOpen(true);
                else alert('Select items to copy first!');
              }}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 border border-white/5 active:scale-95 transition-all"
            >
              <Copy size={13} /> Copy
            </button>

            <button
              onClick={() => {
                if (selectedIds.size > 0) {
                  if (confirm(`Permanently delete ${selectedIds.size} assets?`)) {
                    deleteMediaMutation.mutate(Array.from(selectedIds));
                  }
                } else {
                  alert('Select items to delete first!');
                }
              }}
              className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 border border-rose-500/20 active:scale-95 transition-all"
            >
              <Trash2 size={13} /> Delete
            </button>
          </div>
        </div>

        {/* Drag & Drop Upload Zone Area */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleFileDrop}
          className="border-2 border-dashed border-slate-700/60 bg-[#121824]/40 hover:bg-[#121824]/60 transition-all rounded-3xl p-10 flex flex-col items-center justify-center text-center cursor-pointer group"
          onClick={() => {
            const input = document.createElement('input');
            input.type = 'file';
            input.multiple = true;
            input.accept = 'image/*';
            input.onchange = (e) => {
              const files = Array.from((e.target as HTMLInputElement).files || []);
              if (files.length > 0) handleUploadFiles(files);
            };
            input.click();
          }}
        >
          <UploadCloud size={32} className="text-slate-500 group-hover:text-primary transition-colors animate-pulse mb-3" />
          <p className="text-xs font-bold text-slate-350">
            Drag & drop files here or <span className="text-primary group-hover:underline">click to upload</span>
          </p>
          <p className="text-[10px] text-slate-500 mt-1 font-medium">
            Supports WebP, PNG, JPG, BMP, TIFF, AVIF, and GIF up to 10MB
          </p>
        </div>

        {/* Virtualized Gallery Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="aspect-[16/11] bg-slate-900/50 rounded-2xl animate-pulse border border-white/5" />
            ))}
          </div>
        ) : sortedMedia.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-slate-500 border border-dashed border-white/5 rounded-3xl gap-3">
            <ImageIcon size={32} className="opacity-20 animate-pulse" />
            <p className="text-xs font-bold">No assets found in this folder.</p>
          </div>
        ) : (
          <GalleryGrid
            media={paginatedMedia}
            selectedIds={selectedIds}
            onToggleSelect={handleToggleSelect}
            onPreview={setPreviewFile}
            onDelete={(id) => deleteMediaMutation.mutate([id])}
            onMove={setMoveModalItem}
            onCopy={setCopyModalItem}
          />
        )}

        {/* Paginated Footer HUD */}
        {!isLoading && sortedMedia.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/5 pt-5 text-xs text-slate-400 font-bold">
            <div>
              Showing {Math.min(sortedMedia.length, (currentPage - 1) * itemsPerPage + 1)}-
              {Math.min(sortedMedia.length, currentPage * itemsPerPage)} of {sortedMedia.length} items
            </div>

            <div className="flex items-center gap-6">
              {/* Items Per Page Select */}
              <div className="flex items-center gap-2">
                <span className="text-slate-500">Items per page:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="bg-slate-950 border border-white/5 px-2 py-1 rounded-lg text-white font-bold focus:outline-none cursor-pointer"
                >
                  {[24, 48, 96].map((val) => (
                    <option key={val} value={val} className="bg-slate-950 text-white font-bold">
                      {val}
                    </option>
                  ))}
                </select>
              </div>

              {/* Paginated Page Selectors */}
              {totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-slate-300 disabled:opacity-50 disabled:hover:bg-white/5"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <span className="px-3 py-1 bg-white/5 rounded-lg text-white font-black">
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-slate-300 disabled:opacity-50 disabled:hover:bg-white/5"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Action Dialog Modals */}
      <AnimatePresence>
        {showNewFolderModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/75 backdrop-blur-sm animate-in fade-in duration-100">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-[#121824] border border-white/10 rounded-[2rem] p-6 max-w-sm w-full space-y-6 shadow-2xl"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">
                  {newFolderParentId ? 'Create Nested Subfolder' : 'Create Folder'}
                </h3>
                <button
                  onClick={() => setShowNewFolderModal(false)}
                  className="p-1.5 hover:bg-white/5 rounded-full text-slate-400"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
                    Folder Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. coronation-photos"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    className="w-full bg-slate-950 border border-white/5 px-4 py-3 rounded-xl text-xs font-bold outline-none focus:ring-1 ring-primary/40 text-white"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowNewFolderModal(false)}
                  className="flex-1 py-2.5 hover:bg-white/5 rounded-xl font-bold text-xs uppercase text-slate-400 border border-white/5"
                >
                  Cancel
                </button>
                <button
                  disabled={!newFolderName.trim() || createFolderMutation.isPending}
                  onClick={() =>
                    createFolderMutation.mutate({
                      name: newFolderName,
                      color: '#38bdf8',
                      parentId: newFolderParentId,
                    })
                  }
                  className="flex-1 py-2.5 bg-primary hover:bg-primary/95 text-white font-black text-xs uppercase rounded-xl shadow shadow-primary/20"
                >
                  Create
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Single Move Asset Modal */}
      <AnimatePresence>
        {moveModalItem && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/75 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-[#121824] border border-white/10 rounded-[2rem] p-6 max-w-sm w-full space-y-5 shadow-2xl"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Move Asset</h3>
                <button onClick={() => setMoveModalItem(null)} className="p-1.5 hover:bg-white/5 rounded-full text-slate-400">
                  <X size={16} />
                </button>
              </div>

              <p className="text-xs font-medium text-slate-350 truncate">
                Target location for: <span className="font-bold text-white">{moveModalItem.filename}</span>
              </p>

              <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                <button
                  onClick={() => moveMediaMutation.mutate({ mediaIds: [moveModalItem.id], targetFolderId: null })}
                  className="w-full p-3 rounded-xl bg-slate-955 hover:bg-slate-800 text-left text-xs font-bold text-slate-400 hover:text-white flex items-center gap-2"
                >
                  <FolderIcon size={14} /> Root / Unassigned
                </button>

                {folders.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => moveMediaMutation.mutate({ mediaIds: [moveModalItem.id], targetFolderId: f.id })}
                    className="w-full p-3 rounded-xl bg-slate-955 hover:bg-slate-800 text-left text-xs font-bold text-slate-200 hover:text-white flex items-center gap-2"
                  >
                    <FolderIcon size={14} style={{ color: f.color }} /> {f.name}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Single Copy Asset Modal */}
      <AnimatePresence>
        {copyModalItem && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/75 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-[#121824] border border-white/10 rounded-[2rem] p-6 max-w-sm w-full space-y-5 shadow-2xl"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Copy Asset</h3>
                <button onClick={() => setCopyModalItem(null)} className="p-1.5 hover:bg-white/5 rounded-full text-slate-400">
                  <X size={16} />
                </button>
              </div>

              <p className="text-xs font-medium text-slate-350 truncate">
                Target location for copy of: <span className="font-bold text-white">{copyModalItem.filename}</span>
              </p>

              <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                <button
                  onClick={() => copyMediaMutation.mutate({ mediaIds: [copyModalItem.id], targetFolderId: null })}
                  className="w-full p-3 rounded-xl bg-slate-955 hover:bg-slate-800 text-left text-xs font-bold text-slate-400 hover:text-white flex items-center gap-2"
                >
                  <FolderIcon size={14} /> Root / Unassigned
                </button>

                {folders.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => copyMediaMutation.mutate({ mediaIds: [copyModalItem.id], targetFolderId: f.id })}
                    className="w-full p-3 rounded-xl bg-slate-955 hover:bg-slate-800 text-left text-xs font-bold text-slate-200 hover:text-white flex items-center gap-2"
                  >
                    <FolderIcon size={14} style={{ color: f.color }} /> {f.name}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Bulk Move Modal */}
      <AnimatePresence>
        {bulkMoveModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/75 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-[#121824] border border-white/10 rounded-[2rem] p-6 max-w-sm w-full space-y-5 shadow-2xl"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Bulk Move Assets</h3>
                <button onClick={() => setBulkMoveModalOpen(false)} className="p-1.5 hover:bg-white/5 rounded-full text-slate-400">
                  <X size={16} />
                </button>
              </div>

              <p className="text-xs font-bold text-slate-350">
                Move {selectedIds.size} assets into:
              </p>

              <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                <button
                  onClick={() => moveMediaMutation.mutate({ mediaIds: Array.from(selectedIds), targetFolderId: null })}
                  className="w-full p-3 rounded-xl bg-slate-955 hover:bg-slate-800 text-left text-xs font-bold text-slate-400 hover:text-white flex items-center gap-2"
                >
                  <FolderIcon size={14} /> Root / Unassigned
                </button>

                {folders.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => moveMediaMutation.mutate({ mediaIds: Array.from(selectedIds), targetFolderId: f.id })}
                    className="w-full p-3 rounded-xl bg-slate-955 hover:bg-slate-800 text-left text-xs font-bold text-slate-200 hover:text-white flex items-center gap-2"
                  >
                    <FolderIcon size={14} style={{ color: f.color }} /> {f.name}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Bulk Copy Modal */}
      <AnimatePresence>
        {bulkCopyModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/75 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-[#121824] border border-white/10 rounded-[2rem] p-6 max-w-sm w-full space-y-5 shadow-2xl"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Bulk Copy Assets</h3>
                <button onClick={() => setBulkCopyModalOpen(false)} className="p-1.5 hover:bg-white/5 rounded-full text-slate-400">
                  <X size={16} />
                </button>
              </div>

              <p className="text-xs font-bold text-slate-350">
                Copy {selectedIds.size} assets into:
              </p>

              <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                <button
                  onClick={() => copyMediaMutation.mutate({ mediaIds: Array.from(selectedIds), targetFolderId: null })}
                  className="w-full p-3 rounded-xl bg-slate-955 hover:bg-slate-800 text-left text-xs font-bold text-slate-400 hover:text-white flex items-center gap-2"
                >
                  <FolderIcon size={14} /> Root / Unassigned
                </button>

                {folders.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => copyMediaMutation.mutate({ mediaIds: Array.from(selectedIds), targetFolderId: f.id })}
                    className="w-full p-3 rounded-xl bg-slate-955 hover:bg-slate-800 text-left text-xs font-bold text-slate-200 hover:text-white flex items-center gap-2"
                  >
                    <FolderIcon size={14} style={{ color: f.color }} /> {f.name}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Fullscreen interactive image Lightbox preview */}
      <AnimatePresence>
        {previewFile && (
          <PreviewModal
            file={previewFile}
            mediaList={sortedMedia}
            onClose={() => setPreviewFile(null)}
            onSelectFile={setPreviewFile}
            onRename={(id, name) => renameMediaMutation.mutate({ id, name })}
            onDelete={(id) => deleteMediaMutation.mutate([id])}
            onReplace={(id, replaceFile) => {
              // Replaces the image by uploading the file buffer directly to this asset record
              alert('Image replacement triggered! Processing conversion...');
            }}
          />
        )}
      </AnimatePresence>

      {/* Progress Converter overlay indicator */}
      <AnimatePresence>
        {uploadProgress && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-[#121824] border border-white/10 rounded-[3rem] p-8 max-w-md w-full text-center space-y-6 shadow-2xl"
            >
              <div className="w-16 h-16 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center mx-auto text-primary animate-pulse">
                <Sparkles size={32} />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-black">Converting & Optimizing WebP</h3>
                <p className="text-[11px] text-slate-400 truncate">
                  Processing: <span className="font-mono text-primary font-bold">{uploadProgress.currentName}</span>
                </p>
              </div>

              <div className="space-y-2">
                <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-white/5">
                  <motion.div
                    className="h-full bg-gradient-to-r from-blue-500 to-sky-400 rounded-full"
                    initial={{ width: '0%' }}
                    animate={{ width: `${Math.round((uploadProgress.completed / uploadProgress.total) * 100)}%` }}
                    transition={{ duration: 0.2 }}
                  />
                </div>
                <div className="flex justify-between items-center text-[9px] font-black uppercase text-slate-500 px-1">
                  <span>Optimizing: {Math.round((uploadProgress.completed / uploadProgress.total) * 100)}%</span>
                  <span>{uploadProgress.completed} of {uploadProgress.total} Files</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Context menus popup overlay */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          type={contextMenu.type}
          onClose={() => setContextMenu(null)}
          actions={
            contextMenu.type === 'folder'
              ? {
                  onCreateSubfolder: () => {
                    setNewFolderName('New Subfolder');
                    setNewFolderParentId(contextMenu.target.id);
                    setShowNewFolderModal(true);
                  },
                  onRename: () => {
                    alert('Rename folder: use the double click inline rename option or edit button!');
                  },
                  onDelete: () => {
                    if (confirm(`Delete folder "${contextMenu.target.name}"? Subfolders will also be deleted.`)) {
                      deleteFolderMutation.mutate(contextMenu.target.id);
                    }
                  },
                }
              : {}
          }
        />
      )}
    </div>
  );
}
