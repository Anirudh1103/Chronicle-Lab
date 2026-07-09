import React from 'react';
import { EditorBlock } from '../../types/editor';
import { HeadingBlock } from './blocks/HeadingBlock';
import { ParagraphBlock } from './blocks/ParagraphBlock';
import { CodeBlock } from './blocks/CodeBlock';
import { ImageBlock } from './blocks/ImageBlock';
import { TableBlock } from './blocks/TableBlock';
import { CalloutBlock } from './blocks/CalloutBlock';
import { FAQBlock } from './blocks/FAQBlock';
import { TimelineBlock } from './blocks/TimelineBlock';
import { ReferenceBlock } from './blocks/ReferenceBlock';

interface BlockRendererProps {
  block: EditorBlock;
}

export const BlockRenderer: React.FC<BlockRendererProps> = ({ block }) => {
  switch (block.type) {
    case 'heading':
      return <HeadingBlock id={block.id} content={block.content} />;
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
    case 'faq':
      return <FAQBlock id={block.id} content={block.content} />;
    case 'timeline':
      return <TimelineBlock id={block.id} content={block.content} />;
    case 'reference':
      return <ReferenceBlock id={block.id} content={block.content} />;
    default:
      return (
        <div className="p-4 bg-slate-100 rounded text-slate-500 text-sm">
          Block type "{block.type}" is not yet implemented.
        </div>
      );
  }
};
