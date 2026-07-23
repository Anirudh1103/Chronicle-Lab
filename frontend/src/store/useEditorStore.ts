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
  addBlock: (type: BlockType, index?: number, content?: any, parentId?: string) => void;
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

  addBlock: (type, index, content, parentId) => {
    const newBlock: EditorBlock = {
      id: uuidv4(),
      type,
      content: content || getInitialContent(type),
      orderIndex: 0,
      parentId,
    };

    const currentBlocks = [...get().blocks];
    if (typeof index === 'number') {
      currentBlocks.splice(index, 0, newBlock);
    } else {
      currentBlocks.push(newBlock);
    }

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
    const blocks = get().blocks;
    const idsToRemove = new Set<string>([id]);
    
    // Find all descendants recursively
    let foundNew = true;
    while (foundNew) {
      foundNew = false;
      blocks.forEach(b => {
        if (b.parentId && idsToRemove.has(b.parentId) && !idsToRemove.has(b.id)) {
          idsToRemove.add(b.id);
          foundNew = true;
        }
      });
    }

    const updatedBlocks = blocks.filter((b) => !idsToRemove.has(b.id));
    const reindexed = updatedBlocks.map((block, idx) => ({
      ...block,
      orderIndex: idx,
    }));

    set({ blocks: reindexed, isDirty: true });
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
    const blocks = get().blocks;
    const index = blocks.findIndex((b) => b.id === id);
    if (index === -1) return;

    // Find all descendants recursively and preserve their order
    const descendants: EditorBlock[] = [];
    const getDescendants = (parentId: string) => {
      const children = blocks.filter(b => b.parentId === parentId).sort((a, b) => a.orderIndex - b.orderIndex);
      children.forEach(c => {
        descendants.push(c);
        getDescendants(c.id);
      });
    };
    getDescendants(id);

    // Map old IDs to new duplicated IDs
    const idMap: Record<string, string> = { [id]: uuidv4() };
    descendants.forEach(d => {
      idMap[d.id] = uuidv4();
    });

    const duplicatedBlocks: EditorBlock[] = [
      {
        ...blocks[index],
        id: idMap[id],
        parentId: blocks[index].parentId, // keep same parent
        orderIndex: index + 0.1
      },
      ...descendants.map(d => ({
        ...d,
        id: idMap[d.id],
        parentId: d.parentId ? idMap[d.parentId] : undefined,
        orderIndex: index + 0.1
      }))
    ];

    const currentBlocks = [...blocks];
    currentBlocks.splice(index + 1, 0, ...duplicatedBlocks);

    const reindexed = currentBlocks.map((b, idx) => ({
      ...b,
      orderIndex: idx
    }));

    set({ blocks: reindexed, isDirty: true });
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
    case BlockType.PART:
      return { title: '', slug: '', description: '', metadata: {} };
    case BlockType.CHAPTER:
      return { title: '', slug: '', description: '', metadata: {} };
    case BlockType.HEADING:
      return { level: 2, text: '', title: '', slug: '', description: '', metadata: {} };
    case BlockType.SUBHEADING:
      return { level: 3, text: '', title: '', slug: '', description: '', metadata: {} };
    case BlockType.PARAGRAPH:
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
