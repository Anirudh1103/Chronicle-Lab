import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/client';
import { motion } from 'framer-motion';
import { X, Search, Image as ImageIcon, Folder as FolderIcon, Layers, ChevronRight, ArrowLeft } from 'lucide-react';
import { getUploadUrl } from '../../utils/url';
import { MediaFile } from '../../pages/MediaLibrary';

export interface Folder {
  id: string;
  name: string;
  slug: string;
  color?: string;
  _count?: { media: number };
}

interface MediaPickerProps {
  onSelect: (url: string) => void;
  onClose: () => void;
}

export function MediaPicker({ onSelect, onClose }: MediaPickerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  // Default to 'folders' view so folders are displayed FIRST!
  const [selectedFolderId, setSelectedFolderId] = useState<string | 'folders' | 'all' | 'null'>('folders');

  // Fetch Folders
  const { data: folders = [] } = useQuery<Folder[]>({
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
      const endpoint = selectedFolderId && selectedFolderId !== 'all' && selectedFolderId !== 'folders'
        ? `/media?folderId=${selectedFolderId}`
        : '/media';
      const { data } = await api.get(endpoint);
      return data;
    },
  });

  const getFullUrl = (path: string) => getUploadUrl(path);

  const filteredMedia = media.filter((m) => {
    const matchesSearch =
      m.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.path.toLowerCase().includes(searchTerm.toLowerCase());

    if (selectedFolderId === 'all' || selectedFolderId === 'folders') return matchesSearch;
    if (selectedFolderId === 'null') return matchesSearch && !m.folderId;
    return matchesSearch && m.folderId === selectedFolderId;
  });

  const activeFolder = folders.find((f) => f.id === selectedFolderId);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-5xl max-h-[85vh] bg-slate-900 border border-white/10 rounded-[2.5rem] overflow-hidden flex flex-col shadow-2xl text-slate-100"
      >
        {/* Modal Header */}
        <div className="p-6 sm:p-8 border-b border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/50">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-primary/20 text-primary text-[10px] font-black uppercase rounded-full border border-primary/30">
                Media Library
              </span>
              {selectedFolderId !== 'folders' && (
                <button
                  onClick={() => setSelectedFolderId('folders')}
                  className="flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-primary transition-colors"
                >
                  <ArrowLeft size={14} /> Back to Folders
                </button>
              )}
              {activeFolder && (
                <span className="flex items-center gap-1 text-xs font-bold text-slate-300">
                  <ChevronRight size={14} /> {activeFolder.name}
                </span>
              )}
            </div>
            <h2 className="text-2xl font-black mt-1">
              {selectedFolderId === 'folders' ? 'Select Blog Folder' : activeFolder ? activeFolder.name : 'Select Image Asset'}
            </h2>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search media..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  if (e.target.value && selectedFolderId === 'folders') {
                    setSelectedFolderId('all');
                  }
                }}
                className="w-full bg-slate-800/80 border border-white/10 py-2 pl-10 pr-4 rounded-xl text-sm outline-none focus:ring-2 ring-primary/40 text-slate-100"
              />
            </div>
            <button
              onClick={onClose}
              className="p-2.5 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Folder Navigation Bar */}
        <div className="p-4 sm:px-8 border-b border-white/10 bg-slate-950/60 overflow-x-auto flex items-center gap-2">
          <button
            onClick={() => setSelectedFolderId('folders')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              selectedFolderId === 'folders'
                ? 'bg-primary text-white shadow-lg shadow-primary/25'
                : 'bg-slate-800/60 hover:bg-slate-800 text-slate-300 border border-white/5'
            }`}
          >
            <FolderIcon size={14} className="text-amber-400" /> Blog Folders
          </button>

          <button
            onClick={() => setSelectedFolderId('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              selectedFolderId === 'all'
                ? 'bg-primary text-white shadow-lg shadow-primary/25'
                : 'bg-slate-800/60 hover:bg-slate-800 text-slate-300 border border-white/5'
            }`}
          >
            <Layers size={14} /> All Assets
          </button>

          <button
            onClick={() => setSelectedFolderId('null')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              selectedFolderId === 'null'
                ? 'bg-primary text-white shadow-lg shadow-primary/25'
                : 'bg-slate-800/60 hover:bg-slate-800 text-slate-300 border border-white/5'
            }`}
          >
            <FolderIcon size={14} className="text-slate-400" /> Root (Unassigned)
          </button>

          {folders.map((folder) => (
            <button
              key={folder.id}
              onClick={() => setSelectedFolderId(folder.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                selectedFolderId === folder.id
                  ? 'bg-primary text-white shadow-lg shadow-primary/25'
                  : 'bg-slate-800/60 hover:bg-slate-800 text-slate-300 border border-white/5'
              }`}
            >
              <FolderIcon size={14} style={{ color: folder.color || '#3b82f6' }} />
              {folder.name}
              <span className="px-1.5 py-0.5 rounded-md bg-white/10 text-[10px] font-black">
                {folder._count?.media || 0}
              </span>
            </button>
          ))}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8">
          {/* 1. Folders First View (When opening MediaPicker or selecting Blog Folders) */}
          {selectedFolderId === 'folders' && !searchTerm && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-white">Select a Blog Folder</h3>
                  <p className="text-xs text-slate-400">Pick a blog folder below to view and select its image assets.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {folders.map((folder) => (
                  <motion.div
                    key={folder.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedFolderId(folder.id)}
                    className="p-6 rounded-3xl bg-slate-800/40 border border-white/10 hover:border-primary/50 cursor-pointer transition-all shadow-xl group flex items-start justify-between"
                  >
                    <div className="space-y-3">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
                        style={{ backgroundColor: `${folder.color || '#3b82f6'}20`, color: folder.color || '#3b82f6' }}
                      >
                        <FolderIcon size={26} />
                      </div>
                      <div>
                        <h4 className="text-base font-black text-white group-hover:text-primary transition-colors">
                          {folder.name}
                        </h4>
                        <p className="text-xs text-slate-400 font-medium mt-0.5">
                          {folder._count?.media || 0} Image Assets
                        </p>
                      </div>
                    </div>

                    <div className="p-2 rounded-xl bg-white/5 group-hover:bg-primary group-hover:text-white transition-all text-slate-400">
                      <ChevronRight size={18} />
                    </div>
                  </motion.div>
                ))}

                {/* Root / Unassigned Assets Folder Card */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedFolderId('null')}
                  className="p-6 rounded-3xl bg-slate-800/40 border border-white/10 hover:border-primary/50 cursor-pointer transition-all shadow-xl group flex items-start justify-between"
                >
                  <div className="space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-700/30 text-slate-400 flex items-center justify-center shadow-lg">
                      <FolderIcon size={26} />
                    </div>
                    <div>
                      <h4 className="text-base font-black text-white group-hover:text-primary transition-colors">
                        Root (Unassigned)
                      </h4>
                      <p className="text-xs text-slate-400 font-medium mt-0.5">
                        Uncategorized Assets
                      </p>
                    </div>
                  </div>

                  <div className="p-2 rounded-xl bg-white/5 group-hover:bg-primary group-hover:text-white transition-all text-slate-400">
                    <ChevronRight size={18} />
                  </div>
                </motion.div>
              </div>
            </div>
          )}

          {/* 2. Media Assets Grid (Displayed when a folder is selected or searching) */}
          {(selectedFolderId !== 'folders' || searchTerm) && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  {activeFolder ? `${activeFolder.name} Assets` : selectedFolderId === 'null' ? 'Root Unassigned Assets' : 'All Media Assets'} ({filteredMedia.length})
                </h3>
              </div>

              {isLoading ? (
                <div className="h-64 flex flex-col items-center justify-center text-slate-400 gap-3">
                  <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                  <p className="text-xs font-bold uppercase tracking-widest">Loading Media Assets...</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {filteredMedia.map((file) => (
                    <div
                      key={file.id}
                      onClick={() => {
                        onSelect(getFullUrl(file.path));
                        onClose();
                      }}
                      className="group relative aspect-square rounded-2xl overflow-hidden cursor-pointer border border-white/10 hover:border-primary transition-all shadow-lg bg-slate-950"
                      title={`${file.filename} (WEBP)`}
                    >
                      <img
                        src={getFullUrl(file.path)}
                        alt={file.filename}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = getFullUrl(file.filename);
                        }}
                      />

                      <span className="absolute top-2 left-2 px-2 py-0.5 bg-black/80 backdrop-blur-md text-white text-[9px] font-black rounded-md uppercase border border-white/10">
                        WEBP
                      </span>

                      {file.folder && (
                        <span
                          className="absolute top-2 right-2 px-2 py-0.5 text-white text-[9px] font-black rounded-md uppercase drop-shadow"
                          style={{ backgroundColor: file.folder.color || '#3b82f6' }}
                        >
                          {file.folder.name.slice(0, 10)}...
                        </span>
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                        <p className="text-[10px] text-white font-bold truncate drop-shadow-md">
                          {file.filename}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!isLoading && filteredMedia.length === 0 && (
                <div className="h-64 flex flex-col items-center justify-center text-slate-400 gap-3 border border-dashed border-white/10 rounded-2xl">
                  <ImageIcon size={40} className="opacity-20" />
                  <p className="text-sm font-medium">No media assets found in this view.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
