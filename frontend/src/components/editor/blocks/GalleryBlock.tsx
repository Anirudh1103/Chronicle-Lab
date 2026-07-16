import React from 'react';
import { useEditorStore } from '../../../store/useEditorStore';
import { Image as ImageIcon, Plus, Trash2, LayoutGrid, Layout } from 'lucide-react';
import { cn } from '../../../utils/cn';

interface GalleryImage {
  url: string;
  caption?: string;
}

interface GalleryBlockProps {
  id: string;
  content: {
    images: GalleryImage[];
    layout: 'grid' | 'masonry' | 'carousel';
  };
}

export const GalleryBlock: React.FC<GalleryBlockProps> = ({ id, content }) => {
  const updateBlock = useEditorStore((state) => state.updateBlock);

  const addImage = () => {
    updateBlock(id, { ...content, images: [...content.images, { url: '' }] });
  };

  const updateImage = (index: number, url: string) => {
    const newImages = [...content.images];
    newImages[index].url = url;
    updateBlock(id, { ...content, images: newImages });
  };

  const removeImage = (index: number) => {
    updateBlock(id, { ...content, images: content.images.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-6 p-8 bg-slate-50 dark:bg-white/5 rounded-[2.5rem] border border-slate-100 dark:border-white/5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-slate-400 font-black uppercase tracking-widest text-[10px]">
          <ImageIcon size={14} />
          Image Gallery
        </div>

        <div className="flex bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-white/10">
          {(['grid', 'carousel'] as const).map((l) => (
            <button
              key={l}
              onClick={() => updateBlock(id, { ...content, layout: l })}
              className={cn(
                "p-2 rounded-lg transition-all",
                content.layout === l ? "bg-primary text-white" : "text-slate-400 hover:text-slate-600"
              )}
            >
              {l === 'grid' ? <LayoutGrid size={16} /> : <Layout size={16} />}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {content.images.map((img, index) => (
          <div key={index} className="relative aspect-square rounded-2xl bg-slate-200 dark:bg-slate-800 overflow-hidden group">
            {img.url ? (
              <>
                <img src={img.url} className="w-full h-full object-cover" />
                <button
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={12} />
                </button>
              </>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-4">
                <input
                  type="text"
                  placeholder="Paste URL"
                  className="w-full bg-white dark:bg-slate-900 text-[10px] p-2 rounded-lg outline-none border border-slate-200 dark:border-white/10"
                  onBlur={(e) => updateImage(index, e.target.value)}
                />
              </div>
            )}
          </div>
        ))}
        <button
          onClick={addImage}
          className="aspect-square rounded-2xl border-2 border-dashed border-slate-300 dark:border-white/10 flex flex-col items-center justify-center text-slate-400 hover:text-primary hover:border-primary transition-all gap-2"
        >
          <Plus size={24} />
          <span className="text-[10px] font-black uppercase tracking-widest">Add Media</span>
        </button>
      </div>
    </div>
  );
};
