import { useState } from 'react';
import { Block, BlockType } from '../../types/blog';
import { BlockRenderer } from './BlockRenderer';
import { Plus, Save, Eye, Settings, Image as ImageIcon, Type, Code, Quote, List } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function Editor() {
  const [blocks, setBlocks] = useState<Block[]>([
    { id: '1', type: 'heading-1', content: '' },
    { id: '2', type: 'paragraph', content: '' },
  ]);
  const [showBlockSelector, setShowBlockSelector] = useState(false);

  const addBlock = (type: BlockType) => {
    const newBlock: Block = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      content: '',
    };
    setBlocks([...blocks, newBlock]);
    setShowBlockSelector(false);
  };

  const updateBlock = (id: string, content: any) => {
    setBlocks(blocks.map(b => b.id === id ? { ...b, content } : b));
  };

  const deleteBlock = (id: string) => {
    setBlocks(blocks.filter(b => b.id !== id));
  };

  const moveBlock = (id: string, direction: 'up' | 'down') => {
    const index = blocks.findIndex(b => b.id === id);
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === blocks.length - 1)) return;

    const newBlocks = [...blocks];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [newBlocks[index], newBlocks[newIndex]] = [newBlocks[newIndex], newBlocks[index]];
    setBlocks(newBlocks);
  };

  return (
    <div className="max-w-4xl mx-auto py-20 space-y-12">
      {/* Editor Header */}
      <div className="flex justify-between items-center border-b pb-8">
        <div className="space-y-1">
          <h1 className="text-3xl font-black">Create New Post</h1>
          <p className="text-muted-foreground">Draft your masterpiece using dynamic blocks.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 hover:bg-muted rounded-full font-semibold transition-colors">
            <Eye size={18} /> Preview
          </button>
          <button className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-full font-bold hover:opacity-90 transition-opacity">
            <Save size={18} /> Publish
          </button>
        </div>
      </div>

      {/* Block List */}
      <div className="space-y-2">
        <AnimatePresence initial={false}>
          {blocks.map((block) => (
            <motion.div
              key={block.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <BlockRenderer
                block={block}
                onUpdate={updateBlock}
                onDelete={deleteBlock}
                onMoveUp={(id) => moveBlock(id, 'up')}
                onMoveDown={(id) => moveBlock(id, 'down')}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Add Block Trigger */}
      <div className="relative flex justify-center py-8">
        <button
          onClick={() => setShowBlockSelector(!showBlockSelector)}
          className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all duration-300 ${
            showBlockSelector ? 'bg-primary text-primary-foreground rotate-45' : 'glass hover:bg-muted'
          }`}
        >
          <Plus size={24} />
        </button>

        <AnimatePresence>
          {showBlockSelector && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              className="absolute bottom-24 glass p-6 rounded-3xl shadow-2xl border flex gap-6 z-10"
            >
              <BlockOption icon={<Type />} label="H1" onClick={() => addBlock('heading-1')} />
              <BlockOption icon={<Type size={20} />} label="H2" onClick={() => addBlock('heading-2')} />
              <BlockOption icon={<ImageIcon />} label="Image" onClick={() => addBlock('image')} />
              <BlockOption icon={<Code />} label="Code" onClick={() => addBlock('code-block')} />
              <BlockOption icon={<Quote />} label="Quote" onClick={() => addBlock('quote')} />
              <BlockOption icon={<List />} label="List" onClick={() => addBlock('list-bullet')} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function BlockOption({ icon, label, onClick }: { icon: React.ReactNode, label: string, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2 group"
    >
      <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
        {icon}
      </div>
      <span className="text-xs font-bold text-muted-foreground group-hover:text-primary">{label}</span>
    </button>
  );
}
