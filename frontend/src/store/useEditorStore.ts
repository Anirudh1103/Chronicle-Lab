import { create } from 'zustand';
import { EditorBlock, PostMetadata, SEOMetadata, BlockType, BlockTypes } from '../types/editor';
import { v4 as uuidv4 } from 'uuid';

interface EditorState {
  blocks: EditorBlock[];
  metadata: PostMetadata;
  seo: SEOMetadata;
  isLoading: boolean;
  lastSaved: Date | null;
  isDirty: boolean;

  // Actions
  /**
   * Sets the complete list of blocks in the store.
   * @param {EditorBlock[]} blocks - The new list of blocks.
   */
  setBlocks: (blocks: EditorBlock[]) => void;

  /**
   * Appends or inserts a new block of the specified type.
   * @param {BlockType} type - The type of block to create.
   * @param {number} [index] - The position to insert the block at.
   * @param {any} [content] - Optional content override to merge.
   * @param {string} [parentId] - The ID of the parent structural node.
   * @returns {string} The auto-generated ID of the new block.
   */
  addBlock: (type: BlockType, index?: number, content?: any, parentId?: string) => string;

  /**
   * Updates content of a block by its ID.
   * Marks state as dirty.
   * @param {string} id - The ID of the block to update.
   * @param {any} content - The content fields to update.
   */
  updateBlock: (id: string, content: any) => void;

  /**
   * Removes a block and recursively removes all nested children.
   * Reindexes orderIndex values of remaining sibling blocks.
   * @param {string} id - The ID of the block to delete.
   */
  removeBlock: (id: string) => void;

  /**
   * Moves/reorders a block relative to another block.
   * Scopes reordering to siblings under the parent ID.
   * @param {string} activeId - The ID of the block being dragged.
   * @param {string} overId - The ID of the block being dragged over.
   */
  moveBlock: (activeId: string, overId: string) => void;

  /**
   * Duplicates a block and all its nested children.
   * @param {string} id - The ID of the block to duplicate.
   */
  duplicateBlock: (id: string) => void;

  /**
   * Toggles the collapsed state of a structural block.
   * @param {string} id - The ID of the block.
   */
  toggleCollapse: (id: string) => void;

  /**
   * Merges partial metadata changes into the store metadata.
   * @param {Partial<PostMetadata>} metadata - The fields to update.
   */
  setMetadata: (metadata: Partial<PostMetadata>) => void;

  /**
   * Merges partial SEO configuration changes into the store.
   * @param {Partial<SEOMetadata>} seo - The fields to update.
   */
  setSEO: (seo: Partial<SEOMetadata>) => void;

  /**
   * Sets the page loading state.
   * @param {boolean} isLoading - Loading flag.
   */
  setLoading: (isLoading: boolean) => void;

  /**
   * Sets the last saved date timestamp.
   * @param {Date} date - Timestamp when save completed.
   */
  setLastSaved: (date: Date) => void;

  /**
   * Sets the isDirty modification status.
   * @param {boolean} isDirty - Dirty modification status.
   */
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

/**
 * Zustand store hook for managing the state of the active blog editor session.
 * Tracks content blocks list, post metadata, SEO configurations, and saved status.
 */
export const useEditorStore = create<EditorState>((set, get) => ({
  blocks: [],
  metadata: initialMetadata,
  seo: initialSEO,
  isLoading: false,
  lastSaved: null,
  isDirty: false,

  setBlocks: (blocks) => set({ blocks, isDirty: true }),

  addBlock: (type, index, content, parentId) => {
    const id = uuidv4();
    const newBlock: EditorBlock = {
      id,
      type,
      content: content ? { ...getInitialContent(type), ...content } : getInitialContent(type),
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
    return id;
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
    const blocks = get().blocks;
    const activeBlock = blocks.find(b => b.id === activeId);
    const overBlock = blocks.find(b => b.id === overId);

    if (activeBlock && overBlock && activeBlock.parentId === overBlock.parentId) {
      const parentId = activeBlock.parentId;
      const siblings = blocks.filter(b => b.parentId === parentId).sort((a, b) => a.orderIndex - b.orderIndex);
      const oldIndex = siblings.findIndex(b => b.id === activeId);
      const newIndex = siblings.findIndex(b => b.id === overId);

      if (oldIndex !== -1 && newIndex !== -1) {
        const [moved] = siblings.splice(oldIndex, 1);
        siblings.splice(newIndex, 0, moved);

        const siblingUpdates = new Map<string, number>();
        siblings.forEach((b, idx) => {
          siblingUpdates.set(b.id, idx);
        });

        const updatedBlocks = blocks.map(b => {
          if (siblingUpdates.has(b.id)) {
            return {
              ...b,
              orderIndex: siblingUpdates.get(b.id)!
            };
          }
          return b;
        });

        set({ blocks: updatedBlocks, isDirty: true });
      }
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
    case BlockTypes.PART:
      return { title: '', slug: '', description: '', metadata: {} };
    case BlockTypes.CHAPTER:
      return { title: '', slug: '', description: '', metadata: {} };
    case BlockTypes.HEADING:
      return { level: 2, text: '', title: '', slug: '', description: '', metadata: {} };
    case BlockTypes.SUBHEADING:
      return { level: 3, text: '', title: '', slug: '', description: '', metadata: {} };
    case BlockTypes.PARAGRAPH:
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
