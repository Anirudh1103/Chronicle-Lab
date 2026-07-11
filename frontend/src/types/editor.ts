export type BlockType =
  | 'heading'
  | 'paragraph'
  | 'image'
  | 'gallery'
  | 'table'
  | 'code'
  | 'quote'
  | 'divider'
  | 'callout'
  | 'button'
  | 'video'
  | 'file'
  | 'checklist'
  | 'timeline'
  | 'faq'
  | 'relatedLinks'
  | 'embed';

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
  status: PostStatus;
  featured: boolean;
  coverImage?: string;
  coverImageAlt?: string;
  coverImageCaption?: string;
  categoryId?: string;
  tagIds: string[];
  authorId: string;
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
