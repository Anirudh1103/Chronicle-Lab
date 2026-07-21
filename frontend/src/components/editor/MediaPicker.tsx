import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/client';
import { motion } from 'framer-motion';
import { X, Search, Image as ImageIcon } from 'lucide-react';
import { getUploadUrl } from '../../utils/url';
import { MediaFile } from '../../pages/MediaLibrary';

interface MediaPickerProps {
  onSelect: (url: string) => void;
  onClose: () => void;
}

export function MediaPicker({ onSelect, onClose }: MediaPickerProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: media = [] } = useQuery<MediaFile[]>({
    queryKey: ['media'],
    queryFn: async () => {
      const { data } = await api.get('/media');
      return data;
    },
  });

  const getFullUrl = (path: string) => getUploadUrl(path);

  const filteredMedia = media.filter(m =>
    m.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.path.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-4xl max-h-[80vh] glass rounded-[3rem] overflow-hidden flex flex-col shadow-2xl border-white/10"
      >
        <div className="p-8 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-black">Select Media</h2>
            <p className="text-sm text-muted-foreground">Choose an optimized WebP image from your library.</p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-muted/30 border border-white/10 py-2 pl-10 pr-4 rounded-xl text-sm outline-none focus:ring-2 ring-primary/20"
              />
            </div>
            <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredMedia.map((file) => (
              <div
                key={file.id}
                onClick={() => {
                  onSelect(getFullUrl(file.path));
                  onClose();
                }}
                className="group relative aspect-square rounded-2xl overflow-hidden cursor-pointer border border-white/5 hover:border-primary transition-all shadow-md"
                title={`${file.filename} (WEBP)`}
              >
                <img
                  src={getFullUrl(file.path)}
                  alt={file.filename}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />

                <span className="absolute top-2 left-2 px-2 py-0.5 bg-black/70 backdrop-blur-md text-white text-[9px] font-black rounded-md uppercase">
                  WEBP
                </span>

                <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                  <p className="text-[10px] text-white font-bold truncate drop-shadow-md">
                    {file.filename}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {filteredMedia.length === 0 && (
            <div className="h-64 flex flex-col items-center justify-center text-muted-foreground gap-4">
              <ImageIcon size={48} className="opacity-20" />
              <p>No media found.</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
