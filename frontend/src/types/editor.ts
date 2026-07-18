export type BlockType =
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

export interface EditorBlock {
  id: string;
  type: BlockType;
  content: any;
  orderIndex: number;
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
  categoryId?: string;
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
