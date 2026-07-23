import React from 'react';
import { X, Monitor, Tablet, Smartphone } from 'lucide-react';
import { cn } from '../../utils/cn';
import { EditorBlock, PostMetadata } from '../../types/editor';
import { TableOfContents } from './TableOfContents';
import { getUploadUrl } from '../../utils/url';
import { BlogGallery } from '../blog/BlogGallery';

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  metadata: PostMetadata;
  blocks: EditorBlock[];
}

type DeviceType = 'desktop' | 'tablet' | 'mobile';

export const PreviewModal: React.FC<PreviewModalProps> = ({ isOpen, onClose, metadata, blocks }) => {
  const [device, setDevice] = React.useState<DeviceType>('desktop');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-white dark:bg-slate-950">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 px-6 py-3 dark:border-slate-800">
        <div className="flex items-center gap-6">
          <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400">Live Preview</h2>
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg dark:bg-slate-900">
            <button
              onClick={() => setDevice('desktop')}
              className={cn("p-1.5 rounded-md transition-all", device === 'desktop' ? "bg-white shadow-sm text-blue-600 dark:bg-slate-800" : "text-slate-400")}
            >
              <Monitor size={18} />
            </button>
            <button
              onClick={() => setDevice('tablet')}
              className={cn("p-1.5 rounded-md transition-all", device === 'tablet' ? "bg-white shadow-sm text-blue-600 dark:bg-slate-800" : "text-slate-400")}
            >
              <Tablet size={18} />
            </button>
            <button
              onClick={() => setDevice('mobile')}
              className={cn("p-1.5 rounded-md transition-all", device === 'mobile' ? "bg-white shadow-sm text-blue-600 dark:bg-slate-800" : "text-slate-400")}
            >
              <Smartphone size={18} />
            </button>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full dark:hover:bg-slate-900 transition-colors">
          <X size={20} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-slate-100 dark:bg-slate-900 p-8">
        <div
          className={cn(
            "mx-auto bg-white dark:bg-slate-950 shadow-2xl transition-all duration-300 min-h-full",
            device === 'desktop' && "w-full max-w-5xl",
            device === 'tablet' && "w-[768px]",
            device === 'mobile' && "w-[375px]"
          )}
        >
          {/* Rendered Blog Content */}
          <article className="px-8 py-16 md:px-16 md:py-24">
            <header className="mb-12">
              <h1 className="text-4xl md:text-5xl font-editorial font-black text-slate-900 dark:text-white leading-tight">
                {metadata.title || 'Untitled Post'}
              </h1>
              {metadata.subtitle && (
                <p className="mt-4 text-xl text-slate-500 dark:text-slate-400 font-medium">
                  {metadata.subtitle}
                </p>
              )}
              {metadata.coverImage && (
                <div className="mt-8 rounded-2xl overflow-hidden">
                  <img src={getUploadUrl(metadata.coverImage)} alt={metadata.coverImageAlt} loading="lazy" decoding="async" className="w-full object-cover" />
                  {metadata.coverImageCaption && (
                    <p className="mt-3 text-center text-sm text-slate-400 italic">{metadata.coverImageCaption}</p>
                  )}
                </div>
              )}
            </header>

            {metadata.summary && (
              <div className="mb-8 p-6 rounded-2xl bg-slate-50 border border-slate-100 dark:bg-slate-900/50 dark:border-slate-800">
                <div className="text-sm font-sans font-extrabold uppercase tracking-widest text-blue-600 mb-2">
                  {metadata.summaryTitle || 'Quick Read'}
                </div>
                <p className="text-slate-700 dark:text-slate-350 whitespace-pre-line text-sm leading-relaxed">
                  {metadata.summary}
                </p>
              </div>
            )}

            <TableOfContents blocks={blocks} />

            <div className="space-y-8">
              {blocks.map((block) => (
                <div key={block.id} id={block.id}>
                  {renderBlockPreview(block)}
                </div>
              ))}
            </div>
          </article>
        </div>
      </div>
    </div>
  );
};

function renderBlockPreview(block: EditorBlock) {
  const { type, content } = block;
  switch (type as string) {
    case 'heading':
      const HeadingTag = `h${content.level}` as keyof JSX.IntrinsicElements;
      const classes = {
        1: 'text-4xl font-black',
        2: 'text-3xl font-bold',
        3: 'text-2xl font-bold',
        4: 'text-xl font-semibold',
      }[content.level as 1 | 2 | 3 | 4] || 'text-lg font-semibold';
      return <HeadingTag className={cn(classes, "text-slate-900 dark:text-white")} dangerouslySetInnerHTML={{ __html: content.text }} />;

    case 'paragraph':
      return (
        <div
          className="prose prose-slate lg:prose-lg dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: content.text }}
        />
      );

    case 'quote':
      return (
        <blockquote className="my-8 border-l-4 border-primary pl-4 italic text-lg text-slate-700 dark:text-slate-350">
          <p dangerouslySetInnerHTML={{ __html: content.text }} />
          {content.author && <cite className="block mt-2 text-sm font-bold uppercase tracking-widest text-slate-500">— <span dangerouslySetInnerHTML={{ __html: content.author }} /></cite>}
        </blockquote>
      );

    case 'translationquote':
    case 'translationQuote':
      return (
        <div className="my-8 p-6 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4">
          <blockquote className="border-l-4 border-primary pl-4 italic text-lg text-slate-900 dark:text-white">
            <p dangerouslySetInnerHTML={{ __html: content.text }} />
          </blockquote>
          {content.translation && (
            <div className="pl-4 border-t border-slate-100 dark:border-white/5 pt-2">
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1">Translation:</span>
              <p className="text-sm italic font-serif text-slate-650 dark:text-slate-300" dangerouslySetInnerHTML={{ __html: content.translation }} />
            </div>
          )}
          {content.meaning && (
            <div className="pl-4 border-t border-slate-100 dark:border-white/5 pt-2">
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1">Meaning:</span>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium" dangerouslySetInnerHTML={{ __html: content.meaning }} />
            </div>
          )}
          {content.author && (
            <cite className="block pl-4 text-xs font-black uppercase tracking-[0.2em] text-primary">— <span dangerouslySetInnerHTML={{ __html: content.author }} /></cite>
          )}
        </div>
      );

    case 'image':
      return (
        <figure className={cn(
          "my-8",
          content.alignment === 'left' && "md:w-1/2 float-left mr-8",
          content.alignment === 'right' && "md:w-1/2 float-right ml-8",
          content.alignment === 'full' && "w-full"
        )}>
          <img src={getUploadUrl(content.url)} alt={content.alt} loading="lazy" decoding="async" className="rounded-xl w-full" />
          {content.caption && <figcaption className="mt-3 text-center text-sm text-slate-400 italic">{content.caption}</figcaption>}
        </figure>
      );

    case 'gallery':
      return <BlogGallery content={content} />;

    case 'code':
      return (
        <div className="my-6 rounded-xl overflow-hidden bg-slate-900 text-slate-100">
          {content.filename && (
            <div className="px-4 py-2 bg-slate-800 text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b border-slate-700">
              {content.filename}
            </div>
          )}
          <pre className="p-4 overflow-x-auto font-mono text-sm leading-relaxed">
            <code>{content.code}</code>
          </pre>
        </div>
      );

    case 'callout':
      const styles = {
        info: 'bg-blue-50 border-blue-100 text-blue-900 dark:bg-blue-900/20 dark:border-blue-800',
        warning: 'bg-amber-50 border-amber-100 text-amber-900 dark:bg-amber-900/20 dark:border-amber-800',
        success: 'bg-emerald-50 border-emerald-100 text-emerald-900 dark:bg-emerald-900/20 dark:border-emerald-800',
        error: 'bg-red-50 border-red-100 text-red-900 dark:bg-red-900/20 dark:border-red-800',
        tip: 'bg-purple-50 border-purple-100 text-purple-900 dark:bg-purple-900/20 dark:border-purple-800',
      };
      return (
        <div className={cn("p-4 rounded-xl border flex gap-4", styles[content.type as keyof typeof styles])}>
          <div className="flex-1 text-sm font-medium leading-relaxed">{content.text}</div>
        </div>
      );

    case 'table':
      return (
        <div className="my-6 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-sm">
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {content.rows.map((row: string[], i: number) => (
                <tr key={i} className="divide-x divide-slate-200 dark:divide-slate-800">
                  {row.map((cell: string, j: number) => (
                    <td key={j} className="p-3 text-slate-700 dark:text-slate-300">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    case 'reference':
      return (
        <div className="my-12 pt-8 border-t border-slate-200 dark:border-slate-800">
          <h4 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-6">Sources & References</h4>
          <ol className="space-y-4">
            {content.items.map((item: any, i: number) => (
              <li key={i} className="flex gap-4 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                <span className="font-bold text-slate-400">[{i + 1}]</span>
                <div>
                  {item.citation}
                  {item.url && (
                    <a href={item.url} target="_blank" rel="noreferrer" className="block text-blue-500 hover:underline mt-1 text-xs">
                      {item.url}
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </div>
      );

    case 'list':
      const ListTag = content.type === 'bullet' ? 'ul' : 'ol';
      return (
        <ListTag className={cn(
          "space-y-2 my-6",
          content.type === 'bullet' ? "list-disc pl-6" : "list-decimal pl-6"
        )}>
          {content.items.map((item: string, i: number) => (
            <li key={i} className="text-slate-700 dark:text-slate-300 leading-relaxed">
              {item}
            </li>
          ))}
        </ListTag>
      );

    case 'summary':
      return (
        <div className="my-8 p-6 rounded-2xl bg-slate-50 border border-slate-200 dark:bg-slate-900/50 dark:border-slate-800">
          <div className="text-sm font-sans font-extrabold uppercase tracking-widest text-blue-600 mb-2">
            {content.title || 'Quick Read'}
          </div>
          <div
            className="prose prose-slate lg:prose-lg dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 text-sm leading-relaxed"
            dangerouslySetInnerHTML={{ __html: content.text }}
          />
        </div>
      );

    default:
      return <div className="p-4 bg-slate-50 rounded italic text-slate-400 text-xs text-center">Block preview not available</div>;
  }
}
