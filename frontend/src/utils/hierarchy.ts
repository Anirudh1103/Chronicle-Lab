import { EditorBlock, BlockType, BlockTypes } from '../types/editor';

export interface SubheadingNode {
  id: string;
  type: 'subheading';
  title: string;
  slug: string;
  description?: string;
  metadata?: any;
  orderIndex: number;
  parentId: string;
  contentBlocks: EditorBlock[];
}

export interface HeadingNode {
  id: string;
  type: 'heading';
  title: string;
  slug: string;
  description?: string;
  metadata?: any;
  orderIndex: number;
  parentId: string;
  subheadings: SubheadingNode[];
}

export interface ChapterNode {
  id: string;
  type: 'chapter';
  title: string;
  slug: string;
  description?: string;
  metadata?: any;
  orderIndex: number;
  parentId: string;
  headings: HeadingNode[];
  chapterNumber: number; // calculated dynamically
}

export interface PartNode {
  id: string;
  type: 'part';
  title: string;
  slug: string;
  description?: string;
  metadata?: any;
  orderIndex: number;
  parentId: null;
  chapters: ChapterNode[];
}

export function generateSlug(text: string): string {
  if (!text) return 'untitled';
  return text
    .toLowerCase()
    .replace(/<[^>]*>/g, '') // Strip HTML tags
    .replace(/[^\w\s-]/g, '') // Remove non-word characters
    .trim()
    .replace(/\s+/g, '-'); // Replace spaces with dashes
}

export function buildHierarchyTree(blocks: EditorBlock[]): PartNode[] {
  const hasParts = blocks.some(b => b.type === BlockTypes.PART);
  if (!hasParts) return [];

  const parts: PartNode[] = [];
  const chaptersMap = new Map<string, ChapterNode[]>();
  const headingsMap = new Map<string, HeadingNode[]>();
  const subheadingsMap = new Map<string, SubheadingNode[]>();
  const contentsMap = new Map<string, EditorBlock[]>();

  const sortedBlocks = [...blocks].sort((a, b) => a.orderIndex - b.orderIndex);

  sortedBlocks.forEach(block => {
    const parentId = block.parentId || '';
    if (block.type === BlockTypes.PART) {
      parts.push({
        id: block.id,
        type: 'part',
        title: block.content.title || block.content.text || 'Untitled Part',
        slug: block.content.slug || `part-${generateSlug(block.content.title || block.content.text)}`,
        description: block.content.description || '',
        metadata: block.content.metadata || {},
        orderIndex: block.orderIndex,
        parentId: null,
        chapters: []
      });
    } else if (block.type === BlockTypes.CHAPTER) {
      if (!chaptersMap.has(parentId)) chaptersMap.set(parentId, []);
      chaptersMap.get(parentId)!.push({
        id: block.id,
        type: 'chapter',
        title: block.content.title || block.content.text || 'Untitled Chapter',
        slug: block.content.slug || `chapter-${generateSlug(block.content.title || block.content.text)}`,
        description: block.content.description || '',
        metadata: block.content.metadata || {},
        orderIndex: block.orderIndex,
        parentId,
        headings: [],
        chapterNumber: 0
      });
    } else if (block.type === BlockTypes.HEADING) {
      if (!headingsMap.has(parentId)) headingsMap.set(parentId, []);
      headingsMap.get(parentId)!.push({
        id: block.id,
        type: 'heading',
        title: block.content.title || block.content.text || 'Untitled Heading',
        slug: block.content.slug || `heading-${generateSlug(block.content.title || block.content.text)}`,
        description: block.content.description || '',
        metadata: block.content.metadata || {},
        orderIndex: block.orderIndex,
        parentId,
        subheadings: []
      });
    } else if (block.type === BlockTypes.SUBHEADING) {
      if (!subheadingsMap.has(parentId)) subheadingsMap.set(parentId, []);
      subheadingsMap.get(parentId)!.push({
        id: block.id,
        type: 'subheading',
        title: block.content.title || block.content.text || 'Untitled Subheading',
        slug: block.content.slug || `subheading-${generateSlug(block.content.title || block.content.text)}`,
        description: block.content.description || '',
        metadata: block.content.metadata || {},
        orderIndex: block.orderIndex,
        parentId,
        contentBlocks: []
      });
    } else {
      if (!contentsMap.has(parentId)) contentsMap.set(parentId, []);
      contentsMap.get(parentId)!.push(block);
    }
  });

  parts.sort((a, b) => a.orderIndex - b.orderIndex);

  let chapterCounter = 1;

  parts.forEach(part => {
    const partChapters = chaptersMap.get(part.id) || [];
    partChapters.sort((a, b) => a.orderIndex - b.orderIndex);

    partChapters.forEach(chapter => {
      chapter.chapterNumber = chapterCounter++;

      const chapterHeadings = headingsMap.get(chapter.id) || [];
      chapterHeadings.sort((a, b) => a.orderIndex - b.orderIndex);

      chapterHeadings.forEach(heading => {
        const headingSubheadings = subheadingsMap.get(heading.id) || [];
        headingSubheadings.sort((a, b) => a.orderIndex - b.orderIndex);

        headingSubheadings.forEach(subheading => {
          const subContent = contentsMap.get(subheading.id) || [];
          subheading.contentBlocks = subContent.sort((a, b) => a.orderIndex - b.orderIndex);
        });

        heading.subheadings = headingSubheadings;
      });

      chapter.headings = chapterHeadings;
    });

    part.chapters = partChapters;
  });

  return parts;
}

export function flattenHierarchyTree(parts: PartNode[], legacyBlocks: EditorBlock[]): EditorBlock[] {
  const result: EditorBlock[] = [];

  parts.forEach((part, partIdx) => {
    result.push({
      id: part.id,
      type: BlockTypes.PART,
      content: {
        title: part.title,
        slug: part.slug || `part-${generateSlug(part.title)}`,
        description: part.description,
        metadata: part.metadata
      },
      orderIndex: partIdx,
      parentId: undefined
    });

    part.chapters.forEach((chapter, chapIdx) => {
      result.push({
        id: chapter.id,
        type: BlockTypes.CHAPTER,
        content: {
          title: chapter.title,
          slug: chapter.slug || `chapter-${generateSlug(chapter.title)}`,
          description: chapter.description,
          metadata: chapter.metadata
        },
        orderIndex: chapIdx,
        parentId: part.id
      });

      chapter.headings.forEach((heading, headIdx) => {
        result.push({
          id: heading.id,
          type: BlockTypes.HEADING,
          content: {
            title: heading.title,
            slug: heading.slug || `heading-${generateSlug(heading.title)}`,
            description: heading.description,
            metadata: heading.metadata
          },
          orderIndex: headIdx,
          parentId: chapter.id
        });

        heading.subheadings.forEach((subheading: SubheadingNode, subIdx: number) => {
          result.push({
            id: subheading.id,
            type: BlockTypes.SUBHEADING,
            content: {
              title: subheading.title,
              slug: subheading.slug || `subheading-${generateSlug(subheading.title)}`,
              description: subheading.description,
              metadata: subheading.metadata
            },
            orderIndex: subIdx,
            parentId: heading.id
          });

          subheading.contentBlocks.forEach((block: EditorBlock, blockIdx: number) => {
            result.push({
              ...block,
              orderIndex: blockIdx,
              parentId: subheading.id
            });
          });
        });
      });
    });
  });

  // Append any legacy blocks to prevent dataloss
  const processedIds = new Set(result.map(r => r.id));
  legacyBlocks.forEach(block => {
    if (!processedIds.has(block.id)) {
      result.push(block);
    }
  });

  return result;
}

export function validateHierarchy(blocks: EditorBlock[]): string | null {
  const hasParts = blocks.some(b => b.type === BlockTypes.PART);
  if (!hasParts) return null; // Flat structure is fine for legacy compatibility

  const blockMap = new Map<string, EditorBlock>();
  blocks.forEach(b => blockMap.set(b.id, b));

  for (const block of blocks) {
    const parent = block.parentId ? blockMap.get(block.parentId) : null;
    
    if (block.type === BlockTypes.PART) {
      if (block.parentId) {
        return `Part block '${block.content.title}' cannot be nested inside another block.`;
      }
    } else if (block.type === BlockTypes.CHAPTER) {
      if (!parent || parent.type !== BlockTypes.PART) {
        return `Chapter block '${block.content.title}' must be inside a Part block.`;
      }
    } else if (block.type === BlockTypes.HEADING) {
      if (!parent || parent.type !== BlockTypes.CHAPTER) {
        return `Heading block '${block.content.title}' must be inside a Chapter block.`;
      }
    } else if (block.type === BlockTypes.SUBHEADING) {
      if (!parent || parent.type !== BlockTypes.HEADING) {
        return `Subheading block '${block.content.title}' must be inside a Heading block.`;
      }
    } else {
      // Content blocks
      if (!parent || parent.type !== BlockTypes.SUBHEADING) {
        return `Content blocks must be nested inside a Subheading block. Found floating ${block.type} block.`;
      }
    }
  }

  return null;
}
