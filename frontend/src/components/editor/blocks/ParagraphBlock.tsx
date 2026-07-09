import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import { useEditorStore } from '../../../store/useEditorStore';

interface ParagraphBlockProps {
  id: string;
  content: {
    text: string;
  };
}

export const ParagraphBlock: React.FC<ParagraphBlockProps> = ({ id, content }) => {
  const updateBlock = useEditorStore((state) => state.updateBlock);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
      }),
    ],
    content: content.text,
    onUpdate: ({ editor }) => {
      updateBlock(id, { text: editor.getHTML() });
    },
    editorProps: {
      attributes: {
        class: 'prose prose-slate max-w-none focus:outline-none dark:prose-invert',
      },
    },
  });

  return (
    <div className="min-h-[1.5em]">
      <EditorContent editor={editor} />
    </div>
  );
};
