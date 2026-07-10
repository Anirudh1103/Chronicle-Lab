import React from 'react';
import { useEditorStore } from '../../../store/useEditorStore';
import { RichTextEditor } from '../RichTextEditor';

interface ParagraphBlockProps {
  id: string;
  content: {
    text: string;
  };
}

export const ParagraphBlock: React.FC<ParagraphBlockProps> = ({ id, content }) => {
  const updateBlock = useEditorStore((state) => state.updateBlock);

  return (
    <div className="prose prose-slate max-w-none dark:prose-invert">
      <RichTextEditor
        content={content.text}
        onChange={(html) => updateBlock(id, { text: html })}
        placeholder="Start writing..."
      />
    </div>
  );
};
