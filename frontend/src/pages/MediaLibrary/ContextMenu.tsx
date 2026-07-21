import React, { useEffect, useRef } from 'react';
import { Plus, Edit3, Trash2, Copy, MoveRight, X } from 'lucide-react';
import { cn } from '../../utils/cn';

interface ContextMenuProps {
  x: number;
  y: number;
  type: 'folder' | 'media' | 'blank';
  onClose: () => void;
  actions: {
    onCreateSubfolder?: () => void;
    onRename?: () => void;
    onDelete?: () => void;
    onMove?: () => void;
    onCopy?: () => void;
    onDuplicate?: () => void;
  };
}

export function ContextMenu({ x, y, type, onClose, actions }: ContextMenuProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Close context menu if clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    window.addEventListener('mousedown', handleOutsideClick);
    return () => window.removeEventListener('mousedown', handleOutsideClick);
  }, [onClose]);

  // Constrain inside viewport coordinates
  const menuWidth = 180;
  const menuHeight = 220;
  const posX = window.innerWidth - x < menuWidth ? x - menuWidth : x;
  const posY = window.innerHeight - y < menuHeight ? y - menuHeight : y;

  return (
    <div
      ref={containerRef}
      style={{ left: `${posX}px`, top: `${posY}px` }}
      className="fixed z-[150] w-48 bg-slate-900 border border-white/10 rounded-2xl p-1.5 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-100 flex flex-col gap-0.5"
    >
      {type === 'folder' && (
        <>
          {actions.onCreateSubfolder && (
            <button
              onClick={() => { actions.onCreateSubfolder!(); onClose(); }}
              className="flex items-center gap-2.5 w-full px-3.5 py-2 text-left text-xs font-bold text-slate-200 hover:text-white hover:bg-white/5 rounded-xl transition-all"
            >
              <Plus size={14} className="text-cyan-400" /> Create Subfolder
            </button>
          )}
          {actions.onRename && (
            <button
              onClick={() => { actions.onRename!(); onClose(); }}
              className="flex items-center gap-2.5 w-full px-3.5 py-2 text-left text-xs font-bold text-slate-200 hover:text-white hover:bg-white/5 rounded-xl transition-all"
            >
              <Edit3 size={14} /> Rename Folder
            </button>
          )}
          {actions.onDelete && (
            <div className="border-t border-white/5 my-1" />
          )}
          {actions.onDelete && (
            <button
              onClick={() => { actions.onDelete!(); onClose(); }}
              className="flex items-center gap-2.5 w-full px-3.5 py-2 text-left text-xs font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-all"
            >
              <Trash2 size={14} /> Delete Folder
            </button>
          )}
        </>
      )}

      {type === 'media' && (
        <>
          {actions.onMove && (
            <button
              onClick={() => { actions.onMove!(); onClose(); }}
              className="flex items-center gap-2.5 w-full px-3.5 py-2 text-left text-xs font-bold text-slate-200 hover:text-white hover:bg-white/5 rounded-xl transition-all"
            >
              <MoveRight size={14} /> Move Asset
            </button>
          )}
          {actions.onCopy && (
            <button
              onClick={() => { actions.onCopy!(); onClose(); }}
              className="flex items-center gap-2.5 w-full px-3.5 py-2 text-left text-xs font-bold text-slate-200 hover:text-white hover:bg-white/5 rounded-xl transition-all"
            >
              <Copy size={14} /> Copy Asset
            </button>
          )}
          {actions.onDelete && (
            <div className="border-t border-white/5 my-1" />
          )}
          {actions.onDelete && (
            <button
              onClick={() => { actions.onDelete!(); onClose(); }}
              className="flex items-center gap-2.5 w-full px-3.5 py-2 text-left text-xs font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-all"
            >
              <Trash2 size={14} /> Delete Asset
            </button>
          )}
        </>
      )}
    </div>
  );
}
