import React from 'react';
import { useEditorStore } from '../../../store/useEditorStore';
import { Image as ImageIcon, Upload, X } from 'lucide-react';
import { cn } from '../../../utils/cn';

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
            src={content.url}
            alt={content.alt}
            className={cn(
              'rounded-lg transition-all',
              content.alignment === 'left' && 'max-w-sm mr-auto',
              content.alignment === 'center' && 'max-w-2xl mx-auto',
              content.alignment === 'right' && 'max-w-sm ml-auto',
              content.alignment === 'full' && 'w-full'
            )}
          />
          <button
            onClick={() => handleChange('url', '')}
            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 dark:bg-slate-900 dark:border-slate-800">
          <ImageIcon className="mb-4 text-slate-300" size={48} />
          <p className="text-sm text-slate-500 mb-4">Upload an image or paste a URL</p>
          <input
            type="text"
            placeholder="https://example.com/image.jpg"
            className="w-full max-w-md px-4 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-500"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleChange('url', (e.target as HTMLInputElement).value);
              }
            }}
          />
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <input
          type="text"
          value={content.alt}
          onChange={(e) => handleChange('alt', e.target.value)}
          placeholder="Alt text (for accessibility)"
          className="text-xs px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-blue-500"
        />
        <input
          type="text"
          value={content.caption}
          onChange={(e) => handleChange('caption', e.target.value)}
          placeholder="Caption (optional)"
          className="text-xs px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-blue-500"
        />
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
