import React, { useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import Highlight from '@tiptap/extension-highlight';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';
import { motion, AnimatePresence } from 'framer-motion';
import { MediaPicker } from './MediaPicker';
import {
  Bold, Italic, Underline as UnderlineIcon, Highlighter, List, ListOrdered, Quote,
  Code, Image as ImageIcon, Link as LinkIcon,
  Heading1, Heading2, Undo, Redo
} from 'lucide-react';
import { cn } from '../../utils/cn';

const lowlight = createLowlight(common);

interface TiptapEditorProps {
  content: string;
  onChange: (content: string) => void;
}

export function TiptapEditor({ content, onChange }: TiptapEditorProps) {
  const [showMediaPicker, setShowMediaPicker] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      Underline,
      Highlight.configure({
        multicolor: true,
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-[2rem] shadow-2xl border border-white/5 my-10',
        },
      }),
      Link.configure({
        openOnClick: false,
      }),
      CodeBlockLowlight.configure({
        lowlight,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-lg dark:prose-invert max-w-none focus:outline-none min-h-[500px] px-4',
      },
    },
  });

  if (!editor) return null;

  const addImage = (url: string) => {
    editor.chain().focus().setImage({ src: url }).run();
  };

  return (
    <div className="w-full space-y-4">
      {/* Toolbar */}
      <div className="sticky top-20 z-30 glass border p-2 rounded-2xl flex flex-wrap gap-1 shadow-xl border-white/5">
        <MenuButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')}
          icon={<Bold size={18} />}
        />
        <MenuButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')}
          icon={<Italic size={18} />}
        />
        <MenuButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive('underline')}
          icon={<UnderlineIcon size={18} />}
        />
        <MenuButton
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          active={editor.isActive('highlight')}
          icon={<Highlighter size={18} />}
          title="Premium Highlight"
        />
        <div className="w-px h-6 bg-border mx-1 my-auto" />
        <MenuButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          active={editor.isActive('heading', { level: 1 })}
          icon={<Heading1 size={18} />}
        />
        <MenuButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive('heading', { level: 2 })}
          icon={<Heading2 size={18} />}
        />
        <div className="w-px h-6 bg-border mx-1 my-auto" />
        <MenuButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')}
          icon={<List size={18} />}
        />
        <MenuButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')}
          icon={<ListOrdered size={18} />}
        />
        <div className="w-px h-6 bg-border mx-1 my-auto" />
        <MenuButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive('blockquote')}
          icon={<Quote size={18} />}
        />
        <MenuButton
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          active={editor.isActive('codeBlock')}
          icon={<Code size={18} />}
        />
        <MenuButton
          onClick={() => setShowMediaPicker(true)}
          icon={<ImageIcon size={18} />}
        />
        <div className="w-px h-6 bg-border mx-1 my-auto" />
        <MenuButton
          onClick={() => editor.chain().focus().undo().run()}
          icon={<Undo size={18} />}
        />
        <MenuButton
          onClick={() => editor.chain().focus().redo().run()}
          icon={<Redo size={18} />}
        />
      </div>

      <div className="glass p-10 rounded-[2.5rem] border-white/5 shadow-inner min-h-[600px]">
        <EditorContent editor={editor} />
      </div>

      <AnimatePresence>
        {showMediaPicker && (
          <MediaPicker
            onSelect={addImage}
            onClose={() => setShowMediaPicker(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function MenuButton({ onClick, active, icon, title }: { onClick: () => void, active?: boolean, icon: React.ReactNode, title?: string }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`p-2.5 rounded-xl transition-all ${
        active
          ? 'bg-primary text-primary-foreground shadow-lg scale-105'
          : 'hover:bg-muted text-muted-foreground hover:text-foreground'
      }`}
    >
      {icon}
    </button>
  );
}
