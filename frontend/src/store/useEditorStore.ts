import { create } from 'zustand';
import { EditorBlock, PostMetadata, SEOMetadata, BlockType } from '../types/editor';
import { v4 as uuidv4 } from 'uuid';

interface EditorState {
  blocks: EditorBlock[];
  metadata: PostMetadata;
  seo: SEOMetadata;
  isLoading: boolean;
  lastSaved: Date | null;
  isDirty: boolean;

  // Actions
  setBlocks: (blocks: EditorBlock[]) => void;
  addBlock: (type: BlockType, index?: number, content?: any) => void;
  updateBlock: (id: string, content: any) => void;
  removeBlock: (id: string) => void;
  moveBlock: (activeId: string, overId: string) => void;
  duplicateBlock: (id: string) => void;
  toggleCollapse: (id: string) => void;

  setMetadata: (metadata: Partial<PostMetadata>) => void;
  setSEO: (seo: Partial<SEOMetadata>) => void;

  setLoading: (isLoading: boolean) => void;
  setLastSaved: (date: Date) => void;
  setDirty: (isDirty: boolean) => void;
}

const initialMetadata: PostMetadata = {
  title: '',
  subtitle: '',
  slug: '',
  excerpt: '',
  summary: '',
  summaryTitle: '',
  status: 'DRAFT',
  featured: false,
  featuredOrder: null,
  categoryIds: [],
  tagIds: [],
  authorId: '', // Should be set from authStore
};

const initialSEO: SEOMetadata = {
  schemaType: 'Article',
  robotsIndex: true,
};

export const useEditorStore = create<EditorState>((set, get) => ({
  blocks: [],
  metadata: initialMetadata,
  seo: initialSEO,
  isLoading: false,
  lastSaved: null,
  isDirty: false,

  setBlocks: (blocks) => set({ blocks, isDirty: true }),

  addBlock: (type, index, content) => {
    const newBlock: EditorBlock = {
      id: uuidv4(),
      type,
      content: content || getInitialContent(type),
      orderIndex: 0, // Will be recalculated or handled by index
    };

    const currentBlocks = [...get().blocks];
    if (typeof index === 'number') {
      currentBlocks.splice(index, 0, newBlock);
    } else {
      currentBlocks.push(newBlock);
    }

    // Update orderIndex based on position
    const updatedBlocks = currentBlocks.map((block, idx) => ({
      ...block,
      orderIndex: idx,
    }));

    set({ blocks: updatedBlocks, isDirty: true });
  },

  updateBlock: (id, content) => {
    set((state) => ({
      blocks: state.blocks.map((b) => (b.id === id ? { ...b, content } : b)),
      isDirty: true,
    }));
  },

  removeBlock: (id) => {
    set((state) => ({
      blocks: state.blocks.filter((b) => b.id !== id),
      isDirty: true,
    }));
  },

  moveBlock: (activeId, overId) => {
    const blocks = [...get().blocks];
    const oldIndex = blocks.findIndex((b) => b.id === activeId);
    const newIndex = blocks.findIndex((b) => b.id === overId);

    if (oldIndex !== -1 && newIndex !== -1) {
      const [movedBlock] = blocks.splice(oldIndex, 1);
      blocks.splice(newIndex, 0, movedBlock);

      const updatedBlocks = blocks.map((block, idx) => ({
        ...block,
        orderIndex: idx,
      }));

      set({ blocks: updatedBlocks, isDirty: true });
    }
  },

  duplicateBlock: (id) => {
    const blocks = [...get().blocks];
    const index = blocks.findIndex((b) => b.id === id);
    if (index !== -1) {
      const blockToDuplicate = blocks[index];
      const newBlock = {
        ...blockToDuplicate,
        id: uuidv4(),
        orderIndex: index + 0.5,
      };
      blocks.splice(index + 1, 0, newBlock);

      const updatedBlocks = blocks.map((block, idx) => ({
        ...block,
        orderIndex: idx,
      }));

      set({ blocks: updatedBlocks, isDirty: true });
    }
  },

  toggleCollapse: (id) => {
    set((state) => ({
      blocks: state.blocks.map((b) =>
        b.id === id ? { ...b, isCollapsed: !b.isCollapsed } : b
      ),
    }));
  },

  setMetadata: (metadata) =>
    set((state) => ({ metadata: { ...state.metadata, ...metadata }, isDirty: true })),

  setSEO: (seo) =>
    set((state) => ({ seo: { ...state.seo, ...seo }, isDirty: true })),

  setLoading: (isLoading) => set({ isLoading }),
  setLastSaved: (lastSaved) => set({ lastSaved, isDirty: false }),
  setDirty: (isDirty) => set({ isDirty }),
}));

function getInitialContent(type: BlockType) {
  switch (type) {
    case 'heading':
      return { level: 2, text: '', subtext: '' };
    case 'subheading':
      return { level: 3, text: '' };
    case 'paragraph':
      return { text: '' };
    case 'image':
      return { url: '', alt: '', caption: '', alignment: 'center' };
    case 'code':
      return { code: '', language: 'javascript', filename: '' };
    case 'quote':
      return { text: '', author: '', source: '' };
    case 'translationQuote':
      return { text: '', translation: '', meaning: '', author: '', source: '' };
    case 'callout':
      return { type: 'info', text: '' };
    case 'table':
      return { rows: [['', ''], ['', '']], headers: ['', ''] };
    case 'timeline':
      return { items: [{ date: '', title: '', description: '' }] };
    case 'reference':
      return { items: [{ id: '1', citation: '', url: '' }] };
    case 'list':
      return { type: 'bullet', items: [''] };
    case 'gallery':
      return {
        images: [],
        layout: 'carousel',
        transitionEffect: 'crossfade',
        displayDuration: 5,
        transitionDuration: 1000,
        autoPlay: true,
        showCaptions: true,
        showIndex: true
      };
    case 'keyInsight':
      return { title: 'The Core Insight', points: [''] };
    case 'divider':
      return { style: 'solid' };
    case 'video':
      return { url: '', caption: '' };
    case 'button':
      return { text: 'Learn More', url: '', variant: 'primary', alignment: 'center' };
    case 'personalTouch':
      return {
        text: ''
      };
    case 'summary':
      return {
        title: 'Quick Read',
        text: ''
      };
    default:
      return {};
  }
}
