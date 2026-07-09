import { Block } from '../../types/blog';
import { Type, Image, Code, Quote, List, Plus, Trash2, MoveUp, MoveDown } from 'lucide-react';

interface BlockRendererProps {
  block: Block;
  onUpdate: (id: string, content: any) => void;
  onDelete: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
}

export function BlockRenderer({ block, onUpdate, onDelete, onMoveUp, onMoveDown }: BlockRendererProps) {
  const renderContent = () => {
    switch (block.type) {
      case 'heading-1':
        return (
          <input
            type="text"
            value={block.content}
            onChange={(e) => onUpdate(block.id, e.target.value)}
            placeholder="Heading 1"
            className="w-full text-4xl font-black bg-transparent border-none outline-none placeholder:text-muted"
          />
        );
      case 'heading-2':
        return (
          <input
            type="text"
            value={block.content}
            onChange={(e) => onUpdate(block.id, e.target.value)}
            placeholder="Heading 2"
            className="w-full text-3xl font-bold bg-transparent border-none outline-none placeholder:text-muted"
          />
        );
      case 'paragraph':
        return (
          <textarea
            value={block.content}
            onChange={(e) => onUpdate(block.id, e.target.value)}
            placeholder="Start typing..."
            className="w-full text-lg leading-relaxed bg-transparent border-none outline-none resize-none placeholder:text-muted"
            rows={1}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto';
              target.style.height = `${target.scrollHeight}px`;
            }}
          />
        );
      case 'code-block':
        return (
          <div className="bg-muted p-6 rounded-2xl space-y-4">
            <div className="flex justify-between items-center text-xs font-mono text-muted-foreground">
              <span>LANGUAGE</span>
              <input
                type="text"
                value={block.metadata?.language || 'typescript'}
                onChange={(e) => onUpdate(block.id, { ...block.content, language: e.target.value })}
                className="bg-transparent border-none outline-none text-right"
              />
            </div>
            <textarea
              value={block.content}
              onChange={(e) => onUpdate(block.id, e.target.value)}
              className="w-full font-mono bg-transparent border-none outline-none resize-none"
              rows={4}
            />
          </div>
        );
      default:
        return <div className="text-muted italic">Block type {block.type} not implemented yet</div>;
    }
  };

  return (
    <div className="group relative py-4 px-12 -mx-12 hover:bg-muted/30 transition-colors rounded-3xl">
      <div className="absolute left-0 top-1/2 -translate-y-1/2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={() => onMoveUp(block.id)} className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-primary">
          <MoveUp size={16} />
        </button>
        <button onClick={() => onMoveDown(block.id)} className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-primary">
          <MoveDown size={16} />
        </button>
      </div>

      <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={() => onDelete(block.id)} className="p-2 hover:bg-destructive/10 rounded-full text-muted-foreground hover:text-destructive transition-colors">
          <Trash2 size={18} />
        </button>
      </div>

      {renderContent()}
    </div>
  );
}
