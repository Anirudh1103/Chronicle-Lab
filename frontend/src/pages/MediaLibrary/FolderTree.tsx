import React, { useState } from 'react';
import { Folder as FolderIcon, ChevronDown, ChevronRight, FolderPlus, Edit3, Trash2, Search, ArrowUpDown } from 'lucide-react';
import { cn } from '../../utils/cn';
import { MediaFolder } from '../MediaLibrary';

interface FolderTreeProps {
  folders: MediaFolder[];
  selectedFolderId: string | 'all' | 'null';
  onSelectFolder: (id: string | 'all' | 'null') => void;
  onCreateFolder: (name: string, parentId: string | null) => void;
  onRenameFolder: (id: string, name: string) => void;
  onDeleteFolder: (folder: MediaFolder) => void;
  onMoveFolder: (folderId: string, targetParentId: string | null) => void;
  onContextMenu: (e: React.MouseEvent, type: 'folder', target: MediaFolder) => void;
}

export function FolderTree({
  folders,
  selectedFolderId,
  onSelectFolder,
  onCreateFolder,
  onRenameFolder,
  onDeleteFolder,
  onMoveFolder,
  onContextMenu,
}: FolderTreeProps) {
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('chronicle_expanded_folders');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [treeSearch, setTreeSearch] = useState('');

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = { ...expandedFolders, [id]: !expandedFolders[id] };
    setExpandedFolders(updated);
    localStorage.setItem('chronicle_expanded_folders', JSON.stringify(updated));
  };

  const handleEditKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key === 'Enter') {
      if (editName.trim()) {
        onRenameFolder(id, editName.trim());
      }
      setEditingFolderId(null);
    } else if (e.key === 'Escape') {
      setEditingFolderId(null);
    }
  };

  // Drag and Drop
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', `folder:${id}`);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetParentId: string | null) => {
    e.preventDefault();
    const data = e.dataTransfer.getData('text/plain');
    if (data.startsWith('folder:')) {
      const draggedId = data.split(':')[1];
      if (draggedId !== targetParentId) {
        onMoveFolder(draggedId, targetParentId);
      }
    }
  };

  // Filter folders by tree search
  const filteredFolders = folders.filter((f) =>
    f.name.toLowerCase().includes(treeSearch.toLowerCase())
  );

  const renderFolderNode = (folder: MediaFolder, depth = 0) => {
    const children = filteredFolders.filter((f) => f.parentId === folder.id);
    const hasChildren = children.length > 0;
    const isExpanded = expandedFolders[folder.id] || false;
    const isSelected = selectedFolderId === folder.id;
    const isEditing = editingFolderId === folder.id;

    return (
      <div key={folder.id} className="select-none">
        <div
          draggable
          onDragStart={(e) => handleDragStart(e, folder.id)}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, folder.id)}
          onClick={() => onSelectFolder(folder.id)}
          onContextMenu={(e) => onContextMenu(e, 'folder', folder)}
          style={{ paddingLeft: `${depth * 16 + 10}px` }}
          className={cn(
            "group flex items-center justify-between py-2 pr-3.5 rounded-xl cursor-pointer transition-all duration-100 text-xs font-bold my-0.5 border border-transparent",
            isSelected
              ? "bg-[#1E293B] text-white shadow-lg border-white/5"
              : "hover:bg-white/5 text-[#94A3B8] hover:text-white"
          )}
        >
          <div className="flex items-center gap-2 min-w-0">
            <button
              onClick={(e) => toggleExpand(folder.id, e)}
              className={cn(
                "p-0.5 rounded hover:bg-white/10 text-slate-500 hover:text-white transition-colors shrink-0",
                !hasChildren && "opacity-0 pointer-events-none"
              )}
            >
              {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>

            <FolderIcon
              size={15}
              className={cn("shrink-0", isSelected ? "text-blue-500 fill-blue-500/10" : "text-slate-400")}
              style={{ color: folder.color }}
            />

            {isEditing ? (
              <input
                type="text"
                autoFocus
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onBlur={() => setEditingFolderId(null)}
                onKeyDown={(e) => handleEditKeyDown(e, folder.id)}
                onClick={(e) => e.stopPropagation()}
                className="bg-slate-950 text-white px-2 py-0.5 rounded border border-white/10 text-xs focus:outline-none w-32 font-medium"
              />
            ) : (
              <span className="truncate leading-none" title={folder.name}>
                {folder.name}
              </span>
            )}
          </div>

          {/* Badge count matching mockup */}
          <div className="flex items-center gap-1.5 shrink-0">
            {!isEditing && (
              <span className="px-2 py-0.5 bg-[#1E293B] text-[#38BDF8] rounded-full text-[9px] font-black tracking-wide leading-none min-w-[20px] text-center">
                {folder.mediaCount || 0}
              </span>
            )}
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className="relative">
            <div className="absolute left-[19px] top-0 bottom-1 w-px bg-white/5" />
            {children.map((child) => renderFolderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const rootFolders = filteredFolders.filter((f) => f.parentId === null);

  return (
    <div className="space-y-4">
      {/* Sidebar Search Folder Bar */}
      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
        <input
          type="text"
          placeholder="Filter folders..."
          value={treeSearch}
          onChange={(e) => setTreeSearch(e.target.value)}
          className="w-full bg-slate-950/80 border border-white/5 py-2 pl-9 pr-3 rounded-xl text-xs font-bold text-slate-200 placeholder:text-slate-600 outline-none focus:ring-1 ring-primary/40"
        />
      </div>

      <div className="space-y-1">
        {/* All Assets */}
        <div
          onClick={() => onSelectFolder('all')}
          className={cn(
            "flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer text-xs font-bold transition-all border border-transparent",
            selectedFolderId === 'all'
              ? "bg-[#1E293B] text-white shadow-lg border-white/5"
              : "hover:bg-white/5 text-[#94A3B8]"
          )}
        >
          <div className="flex items-center gap-2.5">
            <FolderIcon size={15} className="text-blue-500" />
            <span>Media Library</span>
          </div>
        </div>

        {/* Unassigned / Root */}
        <div
          onClick={() => onSelectFolder('null')}
          className={cn(
            "flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer text-xs font-bold transition-all border border-transparent",
            selectedFolderId === 'null'
              ? "bg-[#1E293B] text-white shadow-lg border-white/5"
              : "hover:bg-white/5 text-[#94A3B8]"
          )}
        >
          <div className="flex items-center gap-2.5">
            <FolderIcon size={15} className="text-slate-500" />
            <span>Unassigned (Root)</span>
          </div>
        </div>
      </div>

      <div className="border-t border-white/5 my-3" />

      {/* Recursive tree list */}
      <div className="space-y-0.5 overflow-y-auto max-h-[60vh] scrollbar-none pr-1">
        {rootFolders.map((f) => renderFolderNode(f))}
      </div>
    </div>
  );
}
