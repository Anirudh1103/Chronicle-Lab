import React from 'react';
import { useEditorStore } from '../../../store/useEditorStore';
import { Plus, Trash2, Columns, Rows } from 'lucide-react';
import { cn } from '../../../utils/cn';

interface TableBlockProps {
  id: string;
  content: {
    rows: string[][];
  };
}

export const TableBlock: React.FC<TableBlockProps> = ({ id, content }) => {
  const updateBlock = useEditorStore((state) => state.updateBlock);

  const updateCell = (rowIndex: number, colIndex: number, value: string) => {
    const newRows = [...content.rows];
    newRows[rowIndex][colIndex] = value;
    updateBlock(id, { rows: newRows });
  };

  const addRow = () => {
    const colCount = content.rows[0]?.length || 1;
    updateBlock(id, { rows: [...content.rows, Array(colCount).fill('')] });
  };

  const addColumn = () => {
    const newRows = content.rows.map(row => [...row, '']);
    updateBlock(id, { rows: newRows });
  };

  const deleteRow = (index: number) => {
    if (content.rows.length <= 1) return;
    const newRows = content.rows.filter((_, i) => i !== index);
    updateBlock(id, { rows: newRows });
  };

  const deleteColumn = (index: number) => {
    if (content.rows[0].length <= 1) return;
    const newRows = content.rows.map(row => row.filter((_, i) => i !== index));
    updateBlock(id, { rows: newRows });
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button
          onClick={addRow}
          className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold uppercase bg-slate-100 rounded hover:bg-slate-200"
        >
          <Rows size={12} /> Add Row
        </button>
        <button
          onClick={addColumn}
          className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold uppercase bg-slate-100 rounded hover:bg-slate-200"
        >
          <Columns size={12} /> Add Column
        </button>
      </div>

      <div className="overflow-x-auto border border-slate-200 rounded-lg">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {content.rows[0]?.map((_, colIndex) => (
                <th key={colIndex} className="p-2 border-b border-r border-slate-100 bg-slate-50 relative group/col">
                  <span className="text-[10px] text-slate-400">Col {colIndex + 1}</span>
                  <button
                    onClick={() => deleteColumn(colIndex)}
                    className="absolute -top-1 -right-1 p-0.5 bg-red-500 text-white rounded-full opacity-0 group-hover/col:opacity-100 transition-opacity"
                  >
                    <Trash2 size={8} />
                  </button>
                </th>
              ))}
              <th className="w-8 border-b border-slate-100 bg-slate-50" />
            </tr>
          </thead>
          <tbody>
            {content.rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="group/row">
                {row.map((cell, colIndex) => (
                  <td key={colIndex} className="p-0 border-b border-r border-slate-100">
                    <input
                      type="text"
                      value={cell}
                      onChange={(e) => updateCell(rowIndex, colIndex, e.target.value)}
                      className="w-full p-3 text-sm outline-none focus:bg-blue-50/30 transition-colors bg-transparent"
                    />
                  </td>
                ))}
                <td className="w-8 border-b border-slate-100 text-center">
                  <button
                    onClick={() => deleteRow(rowIndex)}
                    className="p-1 text-slate-300 hover:text-red-500 opacity-0 group-hover/row:opacity-100 transition-opacity"
                  >
                    <Trash2 size={12} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
