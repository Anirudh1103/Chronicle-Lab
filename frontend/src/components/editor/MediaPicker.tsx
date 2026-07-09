import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/client';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Image as ImageIcon } from 'lucide-react';

interface MediaFile {
  id: string;
  path: string;
  filename: string;
}

interface MediaPickerProps {
  onSelect: (url: string) => void;
  onClose: () => void;
}

export function MediaPicker({ onSelect, onClose }: MediaPickerProps) {
  const { data: media = [] } = useQuery<MediaFile[]>({
    queryKey: ['media'],
    queryFn: async () => {
      const { data } = await api.get('/media');
      return data;
    },
  });

  const getFullUrl = (path: string) => `http://localhost:5000/uploads/${path}`;

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
        <div className="p-8 border-b flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-black">Select Media</h2>
            <p className="text-sm text-muted-foreground">Choose an image from your library.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {media.map((file) => (
              <div
                key={file.id}
                onClick={() => {
                  onSelect(getFullUrl(file.path));
                  onClose();
                }}
                className="group relative aspect-square rounded-2xl overflow-hidden cursor-pointer border border-white/5 hover:border-primary transition-all"
              >
                <img src={getFullUrl(file.path)} alt={file.filename} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </div>

          {media.length === 0 && (
            <div className="h-64 flex flex-col items-center justify-center text-muted-foreground gap-4">
              <ImageIcon size={48} className="opacity-20" />
              <p>Your media library is empty.</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
