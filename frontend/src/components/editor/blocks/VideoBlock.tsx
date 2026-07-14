import React from 'react';
import { useEditorStore } from '../../../store/useEditorStore';
import { Video, Youtube } from 'lucide-react';

interface VideoBlockProps {
  id: string;
  content: {
    url: string;
    caption?: string;
  };
}

export const VideoBlock: React.FC<VideoBlockProps> = ({ id, content }) => {
  const updateBlock = useEditorStore((state) => state.updateBlock);

  const getEmbedUrl = (url: string) => {
    if (!url) return '';

    // YouTube
    const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/))([\w-]{11})/);
    if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;

    // Vimeo
    const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;

    return url;
  };

  const embedUrl = getEmbedUrl(content.url);

  return (
    <div className="space-y-4 p-6 rounded-[2rem] bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
      <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest mb-2">
        <Video size={14} />
        Video Embed
      </div>

      <div className="space-y-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={content.url}
            onChange={(e) => updateBlock(id, { ...content, url: e.target.value })}
            placeholder="Paste YouTube or Vimeo URL..."
            className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {embedUrl ? (
          <div className="relative aspect-video rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-lg">
            <iframe
              src={embedUrl}
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
          <div className="aspect-video rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-slate-400 gap-2">
            <Youtube size={48} className="opacity-20" />
            <p className="text-sm font-medium">Enter a valid video URL to see preview</p>
          </div>
        )}

        <input
          type="text"
          value={content.caption || ''}
          onChange={(e) => updateBlock(id, { ...content, caption: e.target.value })}
          placeholder="Add a caption..."
          className="w-full bg-transparent text-center text-sm text-slate-500 italic focus:outline-none"
        />
      </div>
    </div>
  );
};
