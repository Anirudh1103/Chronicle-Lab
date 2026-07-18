import React from 'react';
import { EditorBlock } from '../../types/editor';
import { HeadingBlock } from './blocks/HeadingBlock';
import { ParagraphBlock } from './blocks/ParagraphBlock';
import { CodeBlock } from './blocks/CodeBlock';
import { ImageBlock } from './blocks/ImageBlock';
import { TableBlock } from './blocks/TableBlock';
import { CalloutBlock } from './blocks/CalloutBlock';
import { QuoteBlock } from './blocks/QuoteBlock';
import { TranslationQuoteBlock } from './blocks/TranslationQuoteBlock';
import { TimelineBlock } from './blocks/TimelineBlock';
import { ReferenceBlock } from './blocks/ReferenceBlock';
import { ListBlock } from './blocks/ListBlock';
import { DividerBlock } from './blocks/DividerBlock';
import { VideoBlock } from './blocks/VideoBlock';
import { ButtonBlock } from './blocks/ButtonBlock';
import { PersonalTouchBlock } from './blocks/PersonalTouchBlock';
import { GalleryBlock } from './blocks/GalleryBlock';
import { KeyInsightBlock } from './blocks/KeyInsightBlock';
import { SummaryBlock } from './blocks/SummaryBlock';

interface BlockRendererProps {
  block: EditorBlock;
}

export const BlockRenderer: React.FC<BlockRendererProps> = ({ block }) => {
  const type = block.type.toLowerCase();

  switch (type) {
    case 'heading':
      return <HeadingBlock id={block.id} content={block.content} />;
    case 'subheading':
      return <HeadingBlock id={block.id} content={block.content} isSubheading />;
    case 'paragraph':
      return <ParagraphBlock id={block.id} content={block.content} />;
    case 'code':
      return <CodeBlock id={block.id} content={block.content} />;
    case 'image':
      return <ImageBlock id={block.id} content={block.content} />;
    case 'table':
      return <TableBlock id={block.id} content={block.content} />;
    case 'callout':
      return <CalloutBlock id={block.id} content={block.content} />;
    case 'quote':
      return <QuoteBlock id={block.id} content={block.content} />;
    case 'translationquote':
      return <TranslationQuoteBlock id={block.id} content={block.content} />;
    case 'timeline':
      return <TimelineBlock id={block.id} content={block.content} />;
    case 'reference':
      return <ReferenceBlock id={block.id} content={block.content} />;
    case 'list':
      return <ListBlock id={block.id} content={block.content} />;
    case 'divider':
      return <DividerBlock id={block.id} content={block.content} />;
    case 'video':
      return <VideoBlock id={block.id} content={block.content} />;
    case 'button':
      return <ButtonBlock id={block.id} content={block.content} />;
    case 'personaltouch':
      return <PersonalTouchBlock id={block.id} content={block.content} />;
    case 'gallery':
      return <GalleryBlock id={block.id} content={block.content} />;
    case 'keyinsight':
      return <KeyInsightBlock id={block.id} content={block.content} />;
    case 'summary':
      return <SummaryBlock id={block.id} content={block.content} />;
    default:
      return (
        <div className="p-4 bg-slate-100 rounded text-slate-500 text-sm">
          Block type "{block.type}" is not yet implemented.
        </div>
      );
  }
};
