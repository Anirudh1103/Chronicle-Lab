import React, { useState } from 'react';
import {
  Search,
  X,
  Type,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  AlertCircle,
  Image as ImageIcon,
  Images,
  Video,
  Music,
  FolderTree,
  BookOpen,
  Folder,
  Layers,
  Calendar,
  Grid,
  BarChart,
  MapPin,
  PlayCircle,
  HelpCircle,
  Settings
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { BlockType, BlockTypes } from '../../types/editor';

interface BlocksPanelProps {
  onClose: () => void;
  onAddBlock: (type: BlockType, content?: any) => void;
}

interface BlockItem {
  id: string;
  type: BlockType;
  label: string;
  description: string;
  icon: any;
  contentOverride?: any;
}

interface BlockCategory {
  title: string;
  items: BlockItem[];
}

export const BlocksPanel: React.FC<BlocksPanelProps> = ({ onClose, onAddBlock }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'favorites' | 'recent'>('all');

  const categories: BlockCategory[] = [
    {
      title: 'TEXT',
      items: [
        { id: 'paragraph', type: BlockTypes.PARAGRAPH, label: 'Paragraph', description: 'Start writing plain text.', icon: Type },
        { id: 'h1', type: BlockTypes.HEADING, label: 'Heading 1', description: 'Big section heading.', icon: Heading1, contentOverride: { level: 1, text: '' } },
        { id: 'h2', type: BlockTypes.HEADING, label: 'Heading 2', description: 'Medium section heading.', icon: Heading2, contentOverride: { level: 2, text: '' } },
        { id: 'h3', type: BlockTypes.HEADING, label: 'Heading 3', description: 'Small section heading.', icon: Heading3, contentOverride: { level: 3, text: '' } },
        { id: 'quote', type: BlockTypes.QUOTE, label: 'Quote', description: 'Capture a quote.', icon: Quote },
        { id: 'callout', type: BlockTypes.CALLOUT, label: 'Callout', description: 'Highlight important info.', icon: AlertCircle },
      ]
    },
    {
      title: 'MEDIA',
      items: [
        { id: 'image', type: BlockTypes.IMAGE, label: 'Image', description: 'Upload or select an image.', icon: ImageIcon },
        { id: 'gallery', type: BlockTypes.GALLERY, label: 'Gallery', description: 'Show multiple images in layout.', icon: Images },
        { id: 'video', type: BlockTypes.VIDEO, label: 'Video', description: 'Embed a video link.', icon: Video },
        { id: 'audio', type: BlockTypes.FILE, label: 'Audio', description: 'Upload audio player files.', icon: Music, contentOverride: { type: 'audio', url: '', caption: '' } },
      ]
    },
    {
      title: 'STRUCTURE',
      items: [
        { id: 'part', type: BlockTypes.PART, label: 'Part', description: 'Create a major part node.', icon: FolderTree, contentOverride: { title: 'New Part', slug: 'part-new-part', description: '' } },
        { id: 'chapter', type: BlockTypes.CHAPTER, label: 'Chapter', description: 'Create a chapter node.', icon: BookOpen, contentOverride: { title: 'New Chapter', slug: 'chapter-new-chapter', description: '' } },
        { id: 'heading-struct', type: BlockTypes.HEADING, label: 'Heading/Section', description: 'Create a structural heading.', icon: Folder, contentOverride: { title: 'New Heading', slug: 'heading-new-heading', description: '' } },
        { id: 'subheading-struct', type: BlockTypes.SUBHEADING, label: 'Subheading', description: 'Create a content section.', icon: Layers, contentOverride: { title: 'New Subheading', slug: 'subheading-new-subheading', description: '' } },
        { id: 'timeline', type: BlockTypes.TIMELINE, label: 'Timeline', description: 'Create a historic timeline.', icon: Calendar },
        { id: 'divider', type: BlockTypes.DIVIDER, label: 'Divider', description: 'Add a separating horizontal line.', icon: Grid },
      ]
    },
    {
      title: 'DATA',
      items: [
        { id: 'table', type: BlockTypes.TABLE, label: 'Table', description: 'Insert rows and columns.', icon: Grid },
        { id: 'chart', type: BlockTypes.TABLE, label: 'Chart', description: 'Visualize structured metrics.', icon: BarChart, contentOverride: { type: 'chart' } },
        { id: 'map', type: BlockTypes.TABLE, label: 'Map', description: 'Interactive visual location.', icon: MapPin, contentOverride: { type: 'map' } },
      ]
    },
    {
      title: 'INTERACTIVE',
      items: [
        { id: 'button', type: BlockTypes.BUTTON, label: 'Button', description: 'A clickable link button.', icon: PlayCircle },
        { id: 'accordion', type: BlockTypes.CALLOUT, label: 'Accordion', description: 'Collapsible toggle lists.', icon: AlertCircle, contentOverride: { type: 'accordion' } },
        { id: 'tabs', type: BlockTypes.CALLOUT, label: 'Tabs', description: 'Organize content into tabs.', icon: Layers, contentOverride: { type: 'tabs' } },
      ]
    }
  ];

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value.toLowerCase());
  };

  const filteredCategories = categories.map(cat => ({
    ...cat,
    items: cat.items.filter(item =>
      item.label.toLowerCase().includes(searchQuery) ||
      item.description.toLowerCase().includes(searchQuery)
    )
  })).filter(cat => cat.items.length > 0);

  return (
    <div className="flex flex-col h-full bg-[#090d16] border-r border-slate-900 text-slate-300">
      {/* Search Header */}
      <div className="p-4 border-b border-slate-900/60 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-100">Blocks</span>
          <button onClick={onClose} className="p-1 hover:bg-slate-900/60 rounded text-slate-400 hover:text-white transition-colors">
            <X size={14} />
          </button>
        </div>

        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Search blocks..."
            className="w-full bg-slate-950/80 border border-slate-900 rounded-lg pl-9 pr-8 py-1.5 text-xs outline-none text-slate-200 focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/30 transition-all placeholder:text-slate-600"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-bold text-slate-700 bg-slate-900/40 border border-slate-900 px-1.5 py-0.5 rounded">
            /
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-900/60 px-4">
        {(['all', 'favorites', 'recent'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "flex-1 py-2 text-[10px] font-bold uppercase tracking-wider transition-colors border-b-2 text-center",
              activeTab === tab
                ? "text-blue-500 border-blue-500"
                : "text-slate-500 border-transparent hover:text-slate-300"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Scrollable Blocks List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-950 scrollbar-track-transparent">
        {filteredCategories.map((category) => (
          <div key={category.title} className="space-y-2">
            <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase block pl-1">
              {category.title}
            </span>
            <div className="grid grid-cols-2 gap-2">
              {category.items.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => onAddBlock(item.type, item.contentOverride)}
                    className="flex flex-col items-start p-3 bg-slate-950/30 border border-slate-900 hover:border-slate-800 hover:bg-slate-900/40 rounded-xl text-left transition-all group duration-200"
                  >
                    <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-900 group-hover:border-slate-800 flex items-center justify-center text-slate-400 group-hover:text-blue-400 transition-colors mb-2">
                      <Icon size={16} />
                    </div>
                    <span className="text-xs font-semibold text-slate-200 group-hover:text-white transition-colors">
                      {item.label}
                    </span>
                    <span className="text-[9px] text-slate-500 leading-normal mt-0.5 max-w-[100px] truncate">
                      {item.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {filteredCategories.length === 0 && (
          <div className="text-center py-8 text-slate-500 text-xs">
            No blocks found.
          </div>
        )}
      </div>

      {/* Bottom Footer actions */}
      <div className="p-3 border-t border-slate-900/60 flex items-center justify-between text-slate-500">
        <button className="p-2 hover:text-slate-300 rounded hover:bg-slate-900/40 transition-all"><HelpCircle size={16} /></button>
        <button className="p-2 hover:text-slate-300 rounded hover:bg-slate-900/40 transition-all"><Settings size={16} /></button>
      </div>
    </div>
  );
};
