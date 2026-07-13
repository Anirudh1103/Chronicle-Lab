import React, { useRef } from 'react';
import { useEditorStore } from '../../../store/useEditorStore';
import { Plus, Trash2, Columns, Rows, Image as ImageIcon, Layout, Upload } from 'lucide-react';
import { cn } from '../../../utils/cn';
import { RichTextEditor } from '../RichTextEditor';
import { MediaPicker } from '../MediaPicker';
import { AnimatePresence } from 'framer-motion';
import api from '../../../api/client';

interface TableBlockProps {
  id: string;
  content: {
    rows: string[][];
    headers?: string[];
  };
}

export const TableBlock: React.FC<TableBlockProps> = ({ id, content }) => {
  const updateBlock = useEditorStore((state) => state.updateBlock);
  const [showMediaPicker, setShowMediaPicker] = React.useState<{ r: number, c: number } | null>(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeCell, setActiveCell] = React.useState<{ r: number, c: number } | null>(null);

  const updateCell = (rowIndex: number, colIndex: number, value: string) => {
    const newRows = [...content.rows];
    newRows[rowIndex][colIndex] = value;
    updateBlock(id, { ...content, rows: newRows });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeCell) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const { data } = await api.post('media/upload', formData);
      const url = `http://localhost:5000/uploads/${data.path}`;
      const imgHtml = `<img src="${url}" class="max-h-24 rounded-lg inline-block my-2" />`;
      const { r, c } = activeCell;
      updateCell(r, c, content.rows[r][c] + imgHtml);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload image.');
    } finally {
      setIsUploading(false);
      setActiveCell(null);
    }
  };

  const updateHeader = (colIndex: number, value: string) => {
    const newHeaders = [...(content.headers || Array(content.rows[0]?.length || 1).fill(''))];
    newHeaders[colIndex] = value;
    updateBlock(id, { ...content, headers: newHeaders });
  };

  const addRow = () => {
    const colCount = content.rows[0]?.length || 1;
    updateBlock(id, { ...content, rows: [...content.rows, Array(colCount).fill('')] });
  };

  const addColumn = () => {
    const newRows = content.rows.map(row => [...row, '']);
    const newHeaders = [...(content.headers || Array(content.rows[0]?.length || 1).fill('')), ''];
    updateBlock(id, { ...content, rows: newRows, headers: newHeaders });
  };

  const deleteRow = (index: number) => {
    if (content.rows.length <= 1) return;
    const newRows = content.rows.filter((_, i) => i !== index);
    updateBlock(id, { ...content, rows: newRows });
  };

  const deleteColumn = (index: number) => {
    if (content.rows[0].length <= 1) return;
    const newRows = content.rows.map(row => row.filter((_, i) => i !== index));
    const newHeaders = content.headers?.filter((_, i) => i !== index);
    updateBlock(id, { ...content, rows: newRows, headers: newHeaders });
  };

  const handleImageSelect = (url: string) => {
    if (showMediaPicker) {
      const { r, c } = showMediaPicker;
      const imgHtml = `<img src="${url}" class="max-h-20 rounded-lg inline-block my-2" />`;
      const currentVal = content.rows[r][c];
      updateCell(r, c, currentVal + imgHtml);
      setShowMediaPicker(null);
    }
  };

  const headers = content.headers || Array(content.rows[0]?.length || 1).fill('');

  return (
    <div className="space-y-6 group/table relative">
      <div className="flex items-center justify-between mb-2">
        <div className="flex gap-3 bg-slate-50 dark:bg-slate-900/50 p-1.5 rounded-2xl border border-slate-100 dark:border-white/5">
          <button
            onClick={addRow}
            className="flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-primary hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-all shadow-sm"
          >
            <Rows size={14} /> Add Row
          </button>
          <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 my-auto" />
          <button
            onClick={addColumn}
            className="flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-primary hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-all shadow-sm"
          >
            <Columns size={14} /> Add Column
          </button>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-white/5 opacity-40">
           <Layout size={14} className="text-slate-400" />
           <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Data Grid</span>
        </div>
      </div>

      <div className="overflow-x-auto glass rounded-[2rem] border border-white/5 shadow-2xl">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-900/50">
              {headers.map((header, colIndex) => (
                <th key={colIndex} className="p-4 border-b border-r border-slate-100 dark:border-white/5 relative group/col min-w-[150px]">
                   <RichTextEditor
                      content={header}
                      onChange={(html) => updateHeader(colIndex, html)}
                      placeholder={`Column ${colIndex + 1}`}
                      className="font-black text-[10px] uppercase tracking-[0.2em] text-primary text-center"
                    />
                  <button
                    onClick={() => deleteColumn(colIndex)}
                    className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover/col:opacity-100 transition-all hover:scale-110 shadow-lg z-10"
                  >
                    <Trash2 size={10} />
                  </button>
                </th>
              ))}
              <th className="w-12 border-b border-slate-100 dark:border-white/5" />
            </tr>
          </thead>
          <tbody>
            {content.rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="group/row">
                {row.map((cell, colIndex) => (
                  <td key={colIndex} className="p-4 border-b border-r border-slate-100 dark:border-white/5 relative min-w-[200px]">
                    <div className="relative">
                      <RichTextEditor
                        content={cell}
                        onChange={(html) => updateCell(rowIndex, colIndex, html)}
                        placeholder="..."
                        className="text-sm font-medium leading-relaxed"
                      />
                      <div className="absolute -bottom-2 -right-2 flex gap-1 opacity-0 group-hover/row:opacity-100 transition-opacity z-10">
                        <button
                          onClick={() => { setActiveCell({ r: rowIndex, c: colIndex }); fileInputRef.current?.click(); }}
                          className="p-1 bg-white dark:bg-slate-800 text-slate-500 hover:text-primary rounded-md shadow-sm border border-slate-100 dark:border-white/5"
                          title="Upload Image"
                        >
                          <Upload size={12} />
                        </button>
                        <button
                          onClick={() => setShowMediaPicker({ r: rowIndex, c: colIndex })}
                          className="p-1 bg-white dark:bg-slate-800 text-slate-500 hover:text-primary rounded-md shadow-sm border border-slate-100 dark:border-white/5"
                          title="Media Library"
                        >
                          <ImageIcon size={12} />
                        </button>
                      </div>
                    </div>
                  </td>
                ))}
                <td className="w-12 border-b border-slate-100 dark:border-white/5 text-center">
                  <button
                    onClick={() => deleteRow(rowIndex)}
                    className="p-2 text-slate-300 hover:text-red-500 opacity-0 group-hover/row:opacity-100 transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        className="hidden"
        accept="image/*"
      />

      <AnimatePresence>
        {isUploading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 font-bold"
          >
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Uploading image to cell...
          </motion.div>
        )}
        {showMediaPicker && (
          <MediaPicker
            onSelect={handleImageSelect}
            onClose={() => setShowMediaPicker(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
