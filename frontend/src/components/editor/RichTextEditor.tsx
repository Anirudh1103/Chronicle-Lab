import React from 'react';
import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import Highlight from '@tiptap/extension-highlight';
import { Bold, Italic, Link as LinkIcon, Highlighter, Underline as UnderlineIcon } from 'lucide-react';
import { cn } from '../../utils/cn';

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  className?: string;
  placeholder?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({ content, onChange, className, placeholder }) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
      }),
      Link.configure({
        openOnClick: false,
      }),
      Underline,
      Highlight.configure({
        multicolor: true,
      }),
    ],
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: cn('focus:outline-none min-h-[1.5em]', className),
      },
    },
  });

  if (!editor) return null;

  return (
    <div className="relative group/editor">
      {editor && (
        <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }} className="flex items-center gap-1 p-1 bg-slate-900 rounded-xl shadow-2xl border border-white/10 overflow-hidden z-[200]">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={cn("p-1.5 rounded-lg transition-colors", editor.isActive('bold') ? "bg-primary text-white" : "text-slate-400 hover:bg-white/10")}
          >
            <Bold size={14} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={cn("p-1.5 rounded-lg transition-colors", editor.isActive('italic') ? "bg-primary text-white" : "text-slate-400 hover:bg-white/10")}
          >
            <Italic size={14} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={cn("p-1.5 rounded-lg transition-colors", editor.isActive('underline') ? "bg-primary text-white" : "text-slate-400 hover:bg-white/10")}
          >
            <UnderlineIcon size={14} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHighlight().run()}
            className={cn("p-1.5 rounded-lg transition-colors", editor.isActive('highlight') ? "bg-primary text-white" : "text-slate-400 hover:bg-white/10")}
          >
            <Highlighter size={14} />
          </button>
          <div className="w-px h-4 bg-white/10 mx-1" />
          <button
            onClick={() => {
              const url = window.prompt('URL');
              if (url) editor.chain().focus().setLink({ href: url }).run();
            }}
            className={cn("p-1.5 rounded-lg transition-colors", editor.isActive('link') ? "bg-primary text-white" : "text-slate-400 hover:bg-white/10")}
          >
            <LinkIcon size={14} />
          </button>
        </BubbleMenu>
      )}
      <EditorContent editor={editor} placeholder={placeholder} />
    </div>
  );
};
