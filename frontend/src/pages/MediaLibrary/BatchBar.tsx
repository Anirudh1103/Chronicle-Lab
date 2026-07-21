import React from 'react';
import { Trash2, MoveRight, Copy, X, CheckSquare } from 'lucide-react';
import { cn } from '../../utils/cn';

interface BatchBarProps {
  selectedCount: number;
  onClear: () => void;
  onDelete: () => void;
  onMove: () => void;
  onCopy: () => void;
}

export function BatchBar({ selectedCount, onClear, onDelete, onMove, onCopy }: BatchBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[80] bg-slate-900 border border-white/10 px-6 py-4 rounded-[2rem] shadow-2xl flex items-center gap-6 animate-in slide-in-from-bottom-8 duration-200">
      <div className="flex items-center gap-2">
        <CheckSquare size={16} className="text-primary" />
        <span className="text-xs font-black text-white">{selectedCount} assets selected</span>
      </div>

      <div className="h-5 w-px bg-white/10" />

      {/* Bulk action buttons row */}
      <div className="flex items-center gap-2">
        <button
          onClick={onMove}
          className="px-3.5 py-2 hover:bg-white/5 rounded-xl text-xs font-bold text-slate-200 hover:text-white flex items-center gap-1.5 transition-colors border border-white/5"
        >
          <MoveRight size={13} /> Move
        </button>

        <button
          onClick={onCopy}
          className="px-3.5 py-2 hover:bg-white/5 rounded-xl text-xs font-bold text-slate-200 hover:text-white flex items-center gap-1.5 transition-colors border border-white/5"
        >
          <Copy size={13} /> Copy
        </button>

        <button
          onClick={onDelete}
          className="px-3.5 py-2 bg-rose-500/10 hover:bg-rose-500/25 border border-rose-500/15 rounded-xl text-xs font-bold text-rose-400 hover:text-rose-300 flex items-center gap-1.5 transition-all"
        >
          <Trash2 size={13} /> Delete
        </button>
      </div>

      <div className="h-5 w-px bg-white/10" />

      {/* Clear selection */}
      <button
        onClick={onClear}
        className="p-1.5 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-colors"
        title="Clear Selection"
      >
        <X size={15} />
      </button>
    </div>
  );
}
