import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Trash2, Search, Image as ImageIcon, CheckCircle2, X } from 'lucide-react';
import { getUploadUrl } from '../utils/url';

interface MediaFile {
  id: string;
  filename: string;
  path: string;
  mimetype: string;
  size: number;
  createdAt: string;
}

export function MediaLibrary() {
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDragging, setIsDragging] = useState(false);

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
    onError: () => {
      setIsUploading(false);
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

  const filteredMedia = media.filter(m =>
    m.filename.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getFullUrl = (filename: string) => getUploadUrl(filename);

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
              <p className="text-2xl font-black uppercase tracking-tighter">Drop to upload</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tight">Media Library</h1>
          <p className="text-muted-foreground">Manage your visual assets and documents.</p>
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
            {isUploading ? 'Uploading...' : 'Upload New'}
            <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*" />
          </label>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="aspect-square bg-muted/50 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          <AnimatePresence>
            {filteredMedia.map((file) => (
              <motion.div
                key={file.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="group relative aspect-square glass rounded-[2rem] overflow-hidden border-white/5 cursor-pointer"
              >
                <img
                  src={getFullUrl(file.path)}
                  alt={file.filename}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />

                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3 p-4">
                  <p className="text-[10px] text-white font-black uppercase tracking-widest text-center line-clamp-2">
                    {file.filename}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => deleteMutation.mutate(file.id)}
                      className="p-2 bg-destructive text-destructive-foreground rounded-xl hover:scale-110 transition-transform"
                    >
                      <Trash2 size={16} />
                    </button>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(getFullUrl(file.path));
                        // Toast notification here
                      }}
                      className="p-2 bg-white text-black rounded-xl hover:scale-110 transition-transform"
                    >
                      <ImageIcon size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {!isLoading && filteredMedia.length === 0 && (
        <div className="h-64 flex flex-col items-center justify-center text-muted-foreground gap-4">
          <ImageIcon size={48} className="opacity-20" />
          <p className="font-medium">No media found.</p>
        </div>
      )}
    </div>
  );
}
