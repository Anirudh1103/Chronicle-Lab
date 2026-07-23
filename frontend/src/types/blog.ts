export type BlockType =
  | 'heading-1'
  | 'heading-2'
  | 'heading-3'
  | 'subheading'
  | 'paragraph'
  | 'image'
  | 'code-block'
  | 'quote'
  | 'list-bullet'
  | 'list-number'
  | 'callout'
  | 'divider'
  | 'table'
  | 'video'
  | 'button'
  | 'personal-touch'
  | 'gallery'
  | 'summary';

export interface Block {
  id: string;
  type: BlockType;
  content: any; // Flexible content based on type
  metadata?: {
    className?: string;
    caption?: string;
    language?: string; // For code blocks
    level?: number; // For headings
  };
}

export interface Post {
  id: string;
  title: string;
  subtitle?: string;
  slug: string;
  summary?: string;
  summaryTitle?: string;
  coverImage?: string;
  content: Block[];
  published: boolean;
  featured: boolean;
  authorId: string;
  categories?: Array<{ id: string; name: string }>;
  tags: string[];
  views: number;
  likes: number;
  readingTime?: number;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}
