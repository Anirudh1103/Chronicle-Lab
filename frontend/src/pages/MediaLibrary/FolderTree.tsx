import React, { useState } from 'react';
import { Folder as FolderIcon, ChevronDown, ChevronRight, FolderPlus, Edit3, Trash2, Copy, Plus } from 'lucide-react';
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

  // Drag and Drop implementation
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

  // Build recursive children nodes
  const renderFolderNode = (folder: MediaFolder, depth = 0) => {
    const children = folders.filter((f) => f.parentId === folder.id);
    const hasChildren = children.length > 0;
    const isExpanded = expandedFolders[folder.id] || false;
    const isSelected = selectedFolderId === folder.id;
    const isEditing = editingFolderId === folder.id;

    const totalStorageMB = (folder.totalStorage || 0) / (1024 * 1024);

    return (
      <div key={folder.id} className="select-none">
        <div
          draggable
          onDragStart={(e) => handleDragStart(e, folder.id)}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, folder.id)}
          onClick={() => onSelectFolder(folder.id)}
          onContextMenu={(e) => onContextMenu(e, 'folder', folder)}
          style={{ paddingLeft: `${depth * 14 + 12}px` }}
          className={cn(
            "group flex items-center justify-between py-1.5 pr-2.5 rounded-xl cursor-pointer transition-all duration-120 border border-transparent text-xs font-bold my-0.5",
            isSelected
              ? "bg-primary text-white shadow-lg shadow-primary/20"
              : "hover:bg-white/5 text-slate-300 hover:text-white"
          )}
        >
          <div className="flex items-center gap-2 min-w-0">
            <button
              onClick={(e) => toggleExpand(folder.id, e)}
              className={cn(
                "p-0.5 rounded hover:bg-white/10 text-slate-400 group-hover:text-white transition-colors shrink-0",
                !hasChildren && "opacity-0 cursor-default pointer-events-none"
              )}
            >
              {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>

            <FolderIcon
              size={15}
              className="shrink-0"
              style={{ color: folder.color || '#38bdf8' }}
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
                className="bg-slate-900 text-white px-2 py-0.5 rounded border border-white/20 text-xs font-semibold focus:outline-none w-32"
              />
            ) : (
              <span className="truncate" title={folder.name}>
                {folder.name}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCreateFolder('New Subfolder', folder.id);
              }}
              title="Add Subfolder"
              className="p-1 hover:bg-white/10 rounded text-slate-400 hover:text-white"
            >
              <Plus size={12} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setEditingFolderId(folder.id);
                setEditName(folder.name);
              }}
              title="Rename"
              className="p-1 hover:bg-white/10 rounded text-slate-400 hover:text-white"
            >
              <Edit3 size={12} />
            </button>
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className="relative">
            <div className="absolute left-[19px] top-0 bottom-1 w-px bg-white/10" />
            {children.map((child) => renderFolderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const rootFolders = folders.filter((f) => f.parentId === null);

  return (
    <div className="space-y-4">
      {/* Root Category Explorers */}
      <div className="space-y-1">
        {/* All Assets Selector */}
        <div
          onClick={() => onSelectFolder('all')}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, null)}
          className={cn(
            "flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer text-xs font-bold transition-all",
            selectedFolderId === 'all'
              ? "bg-primary text-white shadow-lg shadow-primary/20"
              : "hover:bg-white/5 text-slate-300"
          )}
        >
          <FolderIcon size={15} className="text-primary" />
          <span>All Assets</span>
        </div>

        {/* Root / Unassigned Selector */}
        <div
          onClick={() => onSelectFolder('null')}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, null)}
          className={cn(
            "flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer text-xs font-bold transition-all",
            selectedFolderId === 'null'
              ? "bg-primary text-white shadow-lg shadow-primary/20"
              : "hover:bg-white/5 text-slate-300"
          )}
        >
          <FolderIcon size={15} className="text-slate-500" />
          <span>Unassigned (Root)</span>
        </div>
      </div>

      <div className="border-t border-white/5 my-3" />

      {/* Collapsible Tree Grid */}
      <div className="space-y-0.5 overflow-y-auto max-h-[60vh] scrollbar-none pr-1">
        {rootFolders.map((f) => renderFolderNode(f))}
      </div>
    </div>
  );
}
