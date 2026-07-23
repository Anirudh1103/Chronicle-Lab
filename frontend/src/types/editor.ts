export type BlockType =
  | 'part'
  | 'chapter'
  | 'heading'
  | 'subheading'
  | 'paragraph'
  | 'image'
  | 'gallery'
  | 'table'
  | 'code'
  | 'quote'
  | 'translationQuote'
  | 'divider'
  | 'callout'
  | 'button'
  | 'video'
  | 'file'
  | 'checklist'
  | 'timeline'
  | 'personalTouch'
  | 'relatedLinks'
  | 'embed'
  | 'reference'
  | 'list'
  | 'keyInsight'
  | 'summary';

export const BlockTypes = {
  PART: 'part',
  CHAPTER: 'chapter',
  HEADING: 'heading',
  SUBHEADING: 'subheading',
  PARAGRAPH: 'paragraph',
  IMAGE: 'image',
  GALLERY: 'gallery',
  TABLE: 'table',
  CODE: 'code',
  QUOTE: 'quote',
  TRANSLATION_QUOTE: 'translationQuote',
  DIVIDER: 'divider',
  CALLOUT: 'callout',
  BUTTON: 'button',
  VIDEO: 'video',
  FILE: 'file',
  CHECKLIST: 'checklist',
  TIMELINE: 'timeline',
  PERSONAL_TOUCH: 'personalTouch',
  RELATED_LINKS: 'relatedLinks',
  EMBED: 'embed',
  REFERENCE: 'reference',
  LIST: 'list',
  KEY_INSIGHT: 'keyInsight',
  SUMMARY: 'summary'
} as const;

export interface EditorBlock {
  id: string;
  type: BlockType;
  content: any;
  orderIndex: number;
  parentId?: string;
  isCollapsed?: boolean;
}

export type PostStatus = 'DRAFT' | 'PUBLISHED' | 'SCHEDULED' | 'PRIVATE' | 'HIDDEN';

export interface PostMetadata {
  title: string;
  subtitle?: string;
  slug: string;
  excerpt?: string;
  summary?: string;
  summaryTitle?: string;
  status: PostStatus;
  featured: boolean;
  featuredOrder?: number | null;
  coverImage?: string;
  coverImageAlt?: string;
  coverImageCaption?: string;
  categoryIds: string[];
  tagIds: string[];
  authorId: string;
  completionQuote?: string;
  completionQuoteAuthor?: string;
}

export interface SEOMetadata {
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterImage?: string;
  schemaType: string;
  robotsIndex: boolean;
}

export interface Post extends PostMetadata, SEOMetadata {
  id: string;
  blocks: EditorBlock[];
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  scheduledAt?: string;
  readingTime: number;
  wordCount: number;
}
