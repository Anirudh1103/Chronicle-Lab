import React, { useState, useEffect } from 'react';
import { Search, Grid, List, ArrowUpDown, Upload, FolderPlus, HelpCircle } from 'lucide-react';
import { cn } from '../../utils/cn';

interface ToolbarProps {
  searchTerm: string;
  onSearchChange: (val: string) => void;
  sortBy: string;
  onSortByChange: (val: string) => void;
  sortOrder: 'asc' | 'desc';
  onToggleSortOrder: () => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (val: 'grid' | 'list') => void;
  onNewFolder: () => void;
  onUploadClick: () => void;
}

export function Toolbar({
  searchTerm,
  onSearchChange,
  sortBy,
  onSortByChange,
  sortOrder,
  onToggleSortOrder,
  viewMode,
  onViewModeChange,
  onNewFolder,
  onUploadClick,
}: ToolbarProps) {
  // Debounce search input changes
  const [localSearch, setLocalSearch] = useState(searchTerm);

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(localSearch);
    }, 250); // 250ms debouncing window
    return () => clearTimeout(timer);
  }, [localSearch, onSearchChange]);

  const sortOptions = [
    { value: 'name', label: 'Alphabetical' },
    { value: 'date', label: 'Upload Date' },
    { value: 'size', label: 'File Size' },
    { value: 'width', label: 'Width' },
    { value: 'height', label: 'Height' },
  ];

  return (
    <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-900/60 border border-white/5 p-4 rounded-2xl backdrop-blur-md">
      {/* Search Debounced Input */}
      <div className="relative w-full md:max-w-xs shrink-0">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
        <input
          type="text"
          placeholder="Filter folders or images..."
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          className="w-full bg-slate-950/80 border border-white/5 py-2.5 pl-10 pr-4 rounded-xl text-xs font-bold text-white placeholder:text-slate-500 outline-none focus:ring-1 ring-primary/40"
        />
      </div>

      {/* Sorting & Filter Actions */}
      <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
        {/* Sort Select */}
        <div className="flex items-center gap-1 bg-slate-950/80 border border-white/5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-300">
          <span className="text-slate-500">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value)}
            className="bg-transparent border-none text-white focus:outline-none cursor-pointer pr-1"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-slate-950 text-white font-bold">
                {opt.label}
              </option>
            ))}
          </select>

          <button onClick={onToggleSortOrder} className="p-0.5 hover:text-white transition-colors" title="Toggle order">
            <ArrowUpDown size={14} className={cn("transition-transform", sortOrder === 'desc' && "rotate-180")} />
          </button>
        </div>

        {/* Layout Modes */}
        <div className="flex bg-slate-950/80 border border-white/5 p-1 rounded-xl shrink-0">
          <button
            onClick={() => onViewModeChange('grid')}
            className={cn(
              "p-1.5 rounded-lg text-slate-400 hover:text-white transition-all",
              viewMode === 'grid' && "bg-white/10 text-white"
            )}
            title="Grid view"
          >
            <Grid size={14} />
          </button>
          <button
            onClick={() => onViewModeChange('list')}
            className={cn(
              "p-1.5 rounded-lg text-slate-400 hover:text-white transition-all",
              viewMode === 'list' && "bg-white/10 text-white"
            )}
            title="List view"
          >
            <List size={14} />
          </button>
        </div>

        {/* Divider */}
        <div className="h-6 w-px bg-white/10 hidden md:block" />

        {/* Global Toolbar buttons */}
        <button
          onClick={onNewFolder}
          className="px-4 py-2.5 glass hover:bg-white/10 text-white rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 border border-white/5 active:scale-95 shadow"
        >
          <FolderPlus size={14} className="text-cyan-400" /> New Folder
        </button>

        <button
          onClick={onUploadClick}
          className="px-4.5 py-2.5 bg-primary hover:bg-primary/95 text-white rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 active:scale-95 shadow shadow-primary/20"
        >
          <Upload size={14} /> Upload
        </button>
      </div>
    </div>
  );
}
