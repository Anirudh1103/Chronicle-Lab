import React from 'react';
import { useEditorStore } from '../../../store/useEditorStore';

interface CodeBlockProps {
  id: string;
  content: {
    code: string;
    language: string;
    filename: string;
  };
}

const LANGUAGES = [
  'javascript', 'typescript', 'python', 'html', 'css', 'sql', 'bash', 'json', 'yaml'
];

export const CodeBlock: React.FC<CodeBlockProps> = ({ id, content }) => {
  const updateBlock = useEditorStore((state) => state.updateBlock);

  const handleChange = (field: string, value: string) => {
    updateBlock(id, { ...content, [field]: value });
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-4">
        <input
          type="text"
          value={content.filename}
          onChange={(e) => handleChange('filename', e.target.value)}
          placeholder="Filename (e.g. index.ts)"
          className="text-xs bg-slate-50 border border-slate-200 rounded px-2 py-1 outline-none focus:border-blue-500 w-full max-w-[200px]"
        />
        <select
          value={content.language}
          onChange={(e) => handleChange('language', e.target.value)}
          className="text-xs bg-slate-50 border border-slate-200 rounded px-2 py-1 outline-none focus:border-blue-500 capitalize"
        >
          {LANGUAGES.map(lang => (
            <option key={lang} value={lang}>{lang}</option>
          ))}
        </select>
      </div>
      <textarea
        value={content.code}
        onChange={(e) => handleChange('code', e.target.value)}
        placeholder="Enter your code here..."
        className="w-full h-40 font-mono text-sm bg-slate-900 text-slate-100 p-4 rounded-lg border-none focus:ring-2 focus:ring-blue-500 overflow-auto whitespace-pre"
        spellCheck={false}
      />
    </div>
  );
};
