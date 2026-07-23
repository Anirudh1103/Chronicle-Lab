import React, { useState } from 'react';
import { useEditorStore } from '../../../store/useEditorStore';
import { 
  Image as ImageIcon, 
  Plus, 
  Trash2, 
  GripVertical, 
  Edit3, 
  ChevronDown, 
  ChevronUp, 
  Settings2,
  FolderOpen,
  Info
} from 'lucide-react';
import { cn } from '../../../utils/cn';
import { getUploadUrl } from '../../../utils/url';
import { MediaPicker } from '../MediaPicker';
import { motion, AnimatePresence } from 'framer-motion';

interface GalleryImage {
  url: string;
  title?: string;
  caption?: string;
  credit?: string;
  alt?: string;
}

interface GalleryBlockProps {
  id: string;
  content: {
    images: GalleryImage[];
    layout: 'grid' | 'carousel';
    transitionEffect?: 'crossfade' | 'fade' | 'kenburns';
    displayDuration?: number;
    transitionDuration?: number;
    autoPlay?: boolean;
    showCaptions?: boolean;
    showIndex?: boolean;
    lazyLoad?: boolean;
    preloadNext?: boolean;
  };
}

export const GalleryBlock: React.FC<GalleryBlockProps> = ({ id, content }) => {
  const updateBlock = useEditorStore((state) => state.updateBlock);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [activePickerIndex, setActivePickerIndex] = useState<number | 'new' | null>(null);
  const [expandedImageIndex, setExpandedImageIndex] = useState<number | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Default values mapping
  const transitionEffect = content.transitionEffect || 'crossfade';
  const displayDuration = content.displayDuration || 5;
  const transitionDuration = content.transitionDuration || 1000;
  const autoPlay = content.autoPlay !== undefined ? content.autoPlay : true;
  const showCaptions = content.showCaptions !== undefined ? content.showCaptions : true;
  const showIndex = content.showIndex !== undefined ? content.showIndex : true;
  const lazyLoad = content.lazyLoad !== undefined ? content.lazyLoad : true;
  const preloadNext = content.preloadNext !== undefined ? content.preloadNext : true;

  const updateField = (field: string, value: any) => {
    updateBlock(id, { ...content, [field]: value });
  };

  const updateImageField = (index: number, field: keyof GalleryImage, value: string) => {
    const newImages = [...content.images];
    newImages[index] = { ...newImages[index], [field]: value };
    updateBlock(id, { ...content, images: newImages });
  };

  const removeImage = (index: number) => {
    const newImages = content.images.filter((_, i) => i !== index);
    updateBlock(id, { ...content, images: newImages });
    if (expandedImageIndex === index) {
      setExpandedImageIndex(null);
    } else if (expandedImageIndex !== null && expandedImageIndex > index) {
      setExpandedImageIndex(expandedImageIndex - 1);
    }
  };

  const handleMediaSelect = (url: string) => {
    if (activePickerIndex === 'new') {
      const newImage: GalleryImage = {
        url,
        title: '',
        caption: '',
        credit: '',
        alt: ''
      };
      updateBlock(id, { ...content, images: [...content.images, newImage] });
    } else if (activePickerIndex !== null) {
      updateImageField(activePickerIndex, 'url', url);
    }
    setShowMediaPicker(false);
    setActivePickerIndex(null);
  };

  // Drag and drop logic
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    // Transparent drag preview image configuration
    const img = new Image();
    img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    e.dataTransfer.setDragImage(img, 0, 0);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    
    const reorderedImages = [...content.images];
    const [draggedImage] = reorderedImages.splice(draggedIndex, 1);
    reorderedImages.splice(index, 0, draggedImage);
    
    updateBlock(id, { ...content, images: reorderedImages });
    setDraggedIndex(index);
    if (expandedImageIndex === draggedIndex) {
      setExpandedImageIndex(index);
    } else if (expandedImageIndex === index) {
      setExpandedImageIndex(draggedIndex);
    }
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <div className="relative glass p-6 md:p-8 rounded-[2.5rem] border border-slate-200/50 dark:border-white/5 bg-slate-50/50 dark:bg-slate-900/30 backdrop-blur-xl">
      
      {/* Header Info */}
      <div className="flex items-center justify-between pb-6 mb-6 border-b border-slate-200/60 dark:border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
            <ImageIcon size={18} />
          </div>
          <div>
            <h4 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">Image Gallery</h4>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
              {content.images.length} {content.images.length === 1 ? 'image' : 'images'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-8">
        
        {/* Left Column: Image List */}
        <div className="space-y-4">
          <div className="space-y-3">
            {content.images.map((img, index) => {
              const isExpanded = expandedImageIndex === index;
              return (
                <div 
                  key={index}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  className={cn(
                    "flex flex-col rounded-2xl border bg-white dark:bg-slate-900 transition-all",
                    draggedIndex === index 
                      ? "opacity-40 border-blue-500/50 scale-[0.98] shadow-inner" 
                      : "border-slate-200/60 dark:border-white/5 hover:border-slate-350 dark:hover:border-white/10 shadow-sm"
                  )}
                >
                  {/* Summary row */}
                  <div className="flex items-center gap-3 p-3">
                    <div className="cursor-grab text-slate-300 dark:text-slate-600 hover:text-slate-500 transition-colors p-1 rounded">
                      <GripVertical size={16} />
                    </div>

                    <div className="w-16 h-12 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 relative group/thumb shrink-0 border border-slate-200/60 dark:border-white/5">
                      {img.url ? (
                        <img src={getUploadUrl(img.url)} className="w-full h-full object-cover" alt="" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                          <ImageIcon size={16} />
                        </div>
                      )}
                      <button
                        onClick={() => {
                          setActivePickerIndex(index);
                          setShowMediaPicker(true);
                        }}
                        className="absolute inset-0 bg-slate-900/65 flex items-center justify-center opacity-0 group-hover/thumb:opacity-100 transition-opacity text-white text-[9px] font-black uppercase tracking-wider"
                      >
                        Replace
                      </button>
                    </div>

                    {/* Quick Text inputs */}
                    <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={img.title || ''}
                        onChange={(e) => updateImageField(index, 'title', e.target.value)}
                        placeholder="Image title / filename..."
                        className="w-full bg-slate-50 dark:bg-slate-800/50 border border-transparent hover:border-slate-200 dark:hover:border-white/5 focus:border-blue-500/50 focus:bg-white dark:focus:bg-slate-900 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 outline-none transition-all"
                      />
                      <input
                        type="text"
                        value={img.caption || ''}
                        onChange={(e) => updateImageField(index, 'caption', e.target.value)}
                        placeholder="Optional caption details..."
                        className="w-full bg-slate-50 dark:bg-slate-800/50 border border-transparent hover:border-slate-200 dark:hover:border-white/5 focus:border-blue-500/50 focus:bg-white dark:focus:bg-slate-900 rounded-xl px-3 py-1.5 text-xs text-slate-500 dark:text-slate-400 outline-none transition-all"
                      />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => setExpandedImageIndex(isExpanded ? null : index)}
                        className={cn(
                          "p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors",
                          isExpanded && "bg-slate-100 dark:bg-slate-800 text-blue-500"
                        )}
                        title="Edit metadata details"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={() => removeImage(index)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-500/5 rounded-xl transition-colors"
                        title="Delete image"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Expandable Meta details */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                        className="overflow-hidden border-t border-slate-150 dark:border-white/5 bg-slate-50/30 dark:bg-slate-950/20"
                      >
                        <div className="p-4 space-y-3.5 text-xs">
                          {/* Image URL path */}
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Media Location (URL)</label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={img.url}
                                onChange={(e) => updateImageField(index, 'url', e.target.value)}
                                className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 outline-none focus:ring-1 focus:ring-blue-500/50 transition-all font-mono text-[10px] text-slate-650 dark:text-slate-350"
                              />
                              <button
                                onClick={() => {
                                  setActivePickerIndex(index);
                                  setShowMediaPicker(true);
                                }}
                                className="px-3.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold flex items-center gap-1.5 transition-colors shrink-0"
                              >
                                <FolderOpen size={13} />
                                Browse
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Photographer Credit */}
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Photo Credit / Source</label>
                              <input
                                type="text"
                                value={img.credit || ''}
                                onChange={(e) => updateImageField(index, 'credit', e.target.value)}
                                placeholder="e.g. Indian Army / AFP"
                                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 outline-none focus:ring-1 focus:ring-blue-500/50 transition-all"
                              />
                            </div>

                            {/* Alt Text */}
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Alt Text (Accessibility)</label>
                              <input
                                type="text"
                                value={img.alt || ''}
                                onChange={(e) => updateImageField(index, 'alt', e.target.value)}
                                placeholder="Describe the image content..."
                                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 outline-none focus:ring-1 focus:ring-blue-500/50 transition-all"
                              />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          {/* Add and Info buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              onClick={() => {
                setActivePickerIndex('new');
                setShowMediaPicker(true);
              }}
              className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-500/10 active:scale-95 shrink-0"
            >
              <Plus size={16} />
              Add Images
            </button>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Drag & drop rows to reorder
            </span>
          </div>

          <div className="flex gap-2.5 p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl text-[11px] text-blue-500 font-medium mt-4 leading-relaxed">
            <Info size={16} className="shrink-0 mt-0.5" />
            <p>
              Tip: The gallery automatically loops slide transitions when published. Hovering over a slide on desktop or holding it on mobile will temporarily freeze playback. Click/tap to expand in fullscreen mode.
            </p>
          </div>
        </div>

        {/* Right Column: Settings Panel */}
        <div className="space-y-5 lg:border-l lg:border-slate-200/60 lg:dark:border-white/5 lg:pl-6">
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
            <Settings2 size={13} />
            Gallery Settings
          </div>

          <div className="space-y-4">
            {/* Transition Effect */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Transition Effect</label>
              <select
                value={transitionEffect}
                onChange={(e) => updateField('transitionEffect', e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 dark:text-slate-200 outline-none focus:ring-1 focus:ring-blue-500/50 transition-all cursor-pointer"
              >
                <option value="crossfade">Crossfade</option>
                <option value="fade">Fade</option>
                <option value="kenburns">Ken Burns Effect</option>
              </select>
            </div>

            {/* Display Duration */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Display Duration</label>
              <select
                value={displayDuration}
                onChange={(e) => updateField('displayDuration', Number(e.target.value))}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 dark:text-slate-200 outline-none focus:ring-1 focus:ring-blue-500/50 transition-all cursor-pointer"
              >
                <option value={3}>3 seconds</option>
                <option value={4}>4 seconds</option>
                <option value={5}>5 seconds</option>
                <option value={6}>6 seconds</option>
              </select>
            </div>

            {/* Transition Speed */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Transition Duration</label>
              <select
                value={transitionDuration}
                onChange={(e) => updateField('transitionDuration', Number(e.target.value))}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 dark:text-slate-200 outline-none focus:ring-1 focus:ring-blue-500/50 transition-all cursor-pointer"
              >
                <option value={500}>500 ms (Fast)</option>
                <option value={800}>800 ms</option>
                <option value={1000}>1000 ms (Default)</option>
                <option value={1200}>1200 ms</option>
                <option value={1500}>1500 ms (Slow)</option>
              </select>
            </div>

            {/* Toggles */}
            <div className="space-y-3 pt-3 border-t border-slate-200/50 dark:border-white/5">
              {/* Auto Play */}
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-650 dark:text-slate-350">Auto Play</span>
                <button
                  type="button"
                  onClick={() => updateField('autoPlay', !autoPlay)}
                  className={cn(
                    "w-9 h-5 rounded-full p-0.5 transition-colors duration-200 focus:outline-none",
                    autoPlay ? "bg-blue-600" : "bg-slate-200 dark:bg-slate-800"
                  )}
                >
                  <div className={cn(
                    "w-4 h-4 rounded-full bg-white transition-transform duration-200",
                    autoPlay ? "translate-x-4" : "translate-x-0"
                  )} />
                </button>
              </div>

              {/* Show Captions */}
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-650 dark:text-slate-350">Show Captions</span>
                <button
                  type="button"
                  onClick={() => updateField('showCaptions', !showCaptions)}
                  className={cn(
                    "w-9 h-5 rounded-full p-0.5 transition-colors duration-200 focus:outline-none",
                    showCaptions ? "bg-blue-600" : "bg-slate-200 dark:bg-slate-800"
                  )}
                >
                  <div className={cn(
                    "w-4 h-4 rounded-full bg-white transition-transform duration-200",
                    showCaptions ? "translate-x-4" : "translate-x-0"
                  )} />
                </button>
              </div>

              {/* Show Index */}
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-650 dark:text-slate-350">Show Index</span>
                <button
                  type="button"
                  onClick={() => updateField('showIndex', !showIndex)}
                  className={cn(
                    "w-9 h-5 rounded-full p-0.5 transition-colors duration-200 focus:outline-none",
                    showIndex ? "bg-blue-600" : "bg-slate-200 dark:bg-slate-800"
                  )}
                >
                  <div className={cn(
                    "w-4 h-4 rounded-full bg-white transition-transform duration-200",
                    showIndex ? "translate-x-4" : "translate-x-0"
                  )} />
                </button>
              </div>
            </div>

            {/* Advanced Accordion */}
            <div className="pt-2 border-t border-slate-200/50 dark:border-white/5">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full flex items-center justify-between text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-widest py-1 hover:text-slate-600 dark:hover:text-slate-350 transition-colors"
              >
                <span>Advanced Details</span>
                {showAdvanced ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
              </button>
              
              <AnimatePresence>
                {showAdvanced && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden pt-2.5 space-y-2.5"
                  >
                    {/* Lazy Load */}
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-455 dark:text-slate-500 font-bold">Lazy Loading</span>
                      <button
                        type="button"
                        onClick={() => updateField('lazyLoad', !lazyLoad)}
                        className={cn(
                          "w-9 h-5 rounded-full p-0.5 transition-colors duration-200 focus:outline-none",
                          lazyLoad ? "bg-blue-600" : "bg-slate-200 dark:bg-slate-800"
                        )}
                      >
                        <div className={cn(
                          "w-4 h-4 rounded-full bg-white transition-transform duration-200",
                          lazyLoad ? "translate-x-4" : "translate-x-0"
                        )} />
                      </button>
                    </div>

                    {/* Preload Next */}
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-455 dark:text-slate-500 font-bold">Preload Next Image</span>
                      <button
                        type="button"
                        onClick={() => updateField('preloadNext', !preloadNext)}
                        className={cn(
                          "w-9 h-5 rounded-full p-0.5 transition-colors duration-200 focus:outline-none",
                          preloadNext ? "bg-blue-600" : "bg-slate-200 dark:bg-slate-800"
                        )}
                      >
                        <div className={cn(
                          "w-4 h-4 rounded-full bg-white transition-transform duration-200",
                          preloadNext ? "translate-x-4" : "translate-x-0"
                        )} />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

      </div>

      {/* Media Picker Modal */}
      <AnimatePresence>
        {showMediaPicker && (
          <MediaPicker
            onSelect={handleMediaSelect}
            onClose={() => {
              setShowMediaPicker(false);
              setActivePickerIndex(null);
            }}
          />
        )}
      </AnimatePresence>

    </div>
  );
};
