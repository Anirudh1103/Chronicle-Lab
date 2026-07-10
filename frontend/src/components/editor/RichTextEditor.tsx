import React from 'react';
import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import { Bold, Italic, Link as LinkIcon, Highlighter, Underline as UnderlineIcon } from 'lucide-react';
import { cn } from '../../utils/cn';

// We'll define a simple Highlight extension if the official one is missing
import { Mark, mergeAttributes } from '@tiptap/core';

const Highlight = Mark.create({
  name: 'highlight',
  addAttributes() {
    return {
      color: {
        default: 'var(--highlight-color, #fbbf24)',
        parseHTML: element => element.getAttribute('data-color'),
        renderHTML: attributes => ({ 'data-color': attributes.color, style: `background-color: ${attributes.color}; color: inherit; padding: 0.1em 0.3em; border-radius: 0.2em; font-weight: 500;` }),
      },
    }
  },
  parseHTML() { return [{ tag: 'mark' }] },
  renderHTML({ HTMLAttributes }) { return ['mark', mergeAttributes(HTMLAttributes), 0] },
  addCommands() {
    return {
      setHighlight: attributes => ({ commands }) => commands.setMark(this.name, attributes),
      toggleHighlight: attributes => ({ commands }) => commands.toggleMark(this.name, attributes),
      unsetHighlight: () => ({ commands }) => commands.unsetMark(this.name),
    }
  },
});

const Underline = Mark.create({
  name: 'underline',
  parseHTML() { return [{ tag: 'u' }, { style: 'text-decoration: underline' }] },
  renderHTML({ HTMLAttributes }) { return ['u', mergeAttributes(HTMLAttributes), 0] },
  addCommands() {
    return {
      setUnderline: () => ({ commands }) => commands.setMark(this.name),
      toggleUnderline: () => ({ commands }) => commands.toggleMark(this.name),
      unsetUnderline: () => ({ commands }) => commands.unsetMark(this.name),
    }
  },
});

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
        heading: false, // We handle headings separately in HeadingBlock
      }),
      Link.configure({
        openOnClick: false,
      }),
      Highlight,
      Underline,
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
        <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }} className="flex items-center gap-1 p-1 bg-slate-900 rounded-xl shadow-2xl border border-white/10 overflow-hidden">
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
            onClick={() => editor.chain().focus().toggleHighlight({ color: 'rgba(59, 130, 246, 0.2)' }).run()}
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
