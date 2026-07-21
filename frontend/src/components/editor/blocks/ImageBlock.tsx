import React, { useState, useRef } from 'react';
import { useEditorStore } from '../../../store/useEditorStore';
import { Image as ImageIcon, Upload, X } from 'lucide-react';
import { cn } from '../../../utils/cn';
import api from '../../../api/client';
import { MediaPicker } from '../MediaPicker';
import { AnimatePresence } from 'framer-motion';
import { getUploadUrl } from '../../../utils/url';

interface ImageBlockProps {
  id: string;
  content: {
    url: string;
    alt: string;
    caption: string;
    alignment: 'left' | 'center' | 'right' | 'full';
  };
}

export const ImageBlock: React.FC<ImageBlockProps> = ({ id, content }) => {
  const updateBlock = useEditorStore((state) => state.updateBlock);
  const [isUploading, setIsUploading] = useState(false);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const { data } = await api.post('media/upload', formData);
      const url = getUploadUrl(data.path);
      updateBlock(id, { ...content, url });
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    updateBlock(id, { ...content, [field]: value });
  };

  const alignments = [
    { value: 'left', label: 'Left' },
    { value: 'center', label: 'Center' },
    { value: 'right', label: 'Right' },
    { value: 'full', label: 'Full Width' },
  ];

  return (
    <div className="space-y-4">
      {content.url ? (
        <div className="relative group">
          <img
            src={getUploadUrl(content.url)}
            alt={content.alt}
            loading="lazy"
            decoding="async"
            className={cn(
              'rounded-xl transition-all shadow-lg',
              content.alignment === 'left' && 'max-w-sm mr-auto',
              content.alignment === 'center' && 'max-w-2xl mx-auto',
              content.alignment === 'right' && 'max-w-sm ml-auto',
              content.alignment === 'full' && 'w-full'
            )}
          />
          <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 bg-white text-slate-900 rounded-full shadow-xl hover:scale-110 transition-transform"
              title="Change Image"
            >
              <Upload size={16} />
            </button>
            <button
              onClick={() => handleChange('url', '')}
              className="p-2 bg-red-500 text-white rounded-full shadow-xl hover:scale-110 transition-transform"
              title="Remove Image"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            const file = e.dataTransfer.files?.[0];
            if (file) handleUpload(file);
          }}
          className={cn(
            "flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-2xl transition-all",
            isDragging ? "border-blue-500 bg-blue-50 dark:bg-blue-900/10" : "border-slate-200 bg-slate-50 dark:bg-slate-900 dark:border-slate-800"
          )}
        >
          {isUploading ? (
            <div className="flex flex-col items-center gap-2 text-blue-500">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-current border-t-transparent" />
              <p className="text-sm font-black uppercase tracking-widest">Uploading...</p>
            </div>
          ) : (
            <>
              <ImageIcon className="mb-4 text-slate-300" size={48} />
              <p className="text-sm text-slate-500 mb-6 text-center font-medium">
                Drag and drop an image, or use the options below
              </p>

              <div className="flex flex-wrap justify-center gap-3 mb-6">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all shadow-sm active:scale-95 dark:bg-slate-800 dark:border-slate-700"
                >
                  <Upload size={18} className="text-blue-500" /> Upload
                </button>
                <button
                  onClick={() => setShowMediaPicker(true)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all shadow-sm active:scale-95 dark:bg-slate-800 dark:border-slate-700"
                >
                  <ImageIcon size={18} className="text-purple-500" /> Media Library
                </button>
              </div>

              <div className="relative w-full max-w-md">
                <input
                  type="text"
                  placeholder="Or paste image URL and press Enter..."
                  className="w-full px-4 py-3 text-sm bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 ring-blue-500/20 focus:border-blue-500 transition-all dark:bg-slate-800 dark:border-slate-700"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleChange('url', (e.target as HTMLInputElement).value);
                    }
                  }}
                />
              </div>
            </>
          )}
        </div>
      )}

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleUpload(file);
        }}
      />

      <AnimatePresence>
        {showMediaPicker && (
          <MediaPicker
            onSelect={(url) => handleChange('url', url)}
            onClose={() => setShowMediaPicker(false)}
          />
        )}
      </AnimatePresence>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase text-slate-500 ml-1">Alt Text</label>
          <input
            type="text"
            value={content.alt}
            onChange={(e) => handleChange('alt', e.target.value)}
            placeholder="Describe for accessibility..."
            className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-blue-500 bg-white dark:bg-slate-800 dark:border-slate-700 text-slate-900 dark:text-slate-100"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase text-slate-500 ml-1">Caption</label>
          <input
            type="text"
            value={content.caption}
            onChange={(e) => handleChange('caption', e.target.value)}
            placeholder="Image caption..."
            className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-blue-500 bg-white dark:bg-slate-800 dark:border-slate-700 text-slate-900 dark:text-slate-100"
          />
        </div>
      </div>

      <div className="flex gap-2">
        {alignments.map((al) => (
          <button
            key={al.value}
            onClick={() => handleChange('alignment', al.value)}
            className={cn(
              'px-3 py-1 text-[10px] font-bold uppercase rounded transition-colors',
              content.alignment === al.value
                ? 'bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800'
            )}
          >
            {al.label}
          </button>
        ))}
      </div>
    </div>
  );
};
