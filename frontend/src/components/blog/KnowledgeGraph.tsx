import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Network, BookOpen, Tag, Sparkles, Compass } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface KnowledgeNode {
  id: string;
  label: string;
  type: 'root' | 'glossary' | 'category' | 'tag' | 'post';
  x: number;
  y: number;
  payload?: any;
}

interface KnowledgeGraphProps {
  post: any;
  glossaryList: any[];
  onGlossaryClick: (term: { term: string; definition: string }) => void;
}

export const KnowledgeGraph: React.FC<KnowledgeGraphProps> = ({ post, glossaryList, onGlossaryClick }) => {
  const navigate = useNavigate();
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  // Generate nodes and edges dynamically based on article data
  const { nodes, edges } = useMemo(() => {
    const list: KnowledgeNode[] = [];
    const connections: { from: string; to: string }[] = [];

    // 1. Root Node (Current Article) at Center
    const rootId = 'root';
    list.push({
      id: rootId,
      label: post.title,
      type: 'root',
      x: 300,
      y: 200
    });

    const outerItems: { label: string; type: 'glossary' | 'category' | 'tag' | 'post'; payload?: any }[] = [];

    // Add Category
    if (post.category) {
      outerItems.push({
        label: post.category.name,
        type: 'category',
        payload: post.category
      });
    }

    // Add Tags (up to 3)
    if (post.tags && post.tags.length > 0) {
      post.tags.slice(0, 3).forEach((tag: any) => {
        outerItems.push({
          label: tag.name,
          type: 'tag',
          payload: tag
        });
      });
    }

    // Add Matching Glossary terms (up to 4)
    // Scan post blocks for glossary words
    const contentText = JSON.stringify(post.blocks).toLowerCase();
    const matchedGlossary = glossaryList.filter(item => 
      contentText.includes(item.term.toLowerCase())
    ).slice(0, 4);

    matchedGlossary.forEach((term: any) => {
      outerItems.push({
        label: term.term,
        type: 'glossary',
        payload: term
      });
    });

    // Calculate positions in an oval orbit around center
    const numItems = outerItems.length;
    outerItems.forEach((item, idx) => {
      const angle = (idx / numItems) * 2 * Math.PI - Math.PI / 2;
      const rx = 200; // horizontal radius
      const ry = 120; // vertical radius
      const id = `outer-${idx}`;

      list.push({
        id,
        label: item.label,
        type: item.type,
        x: 300 + Math.cos(angle) * rx,
        y: 200 + Math.sin(angle) * ry,
        payload: item.payload
      });

      connections.push({ from: rootId, to: id });
    });

    return { nodes: list, edges: connections };
  }, [post, glossaryList]);

  const handleNodeClick = (node: KnowledgeNode) => {
    if (node.type === 'root') return;
    if (node.type === 'glossary' && node.payload) {
      onGlossaryClick({ term: node.payload.term, definition: node.payload.definition });
    } else if (node.type === 'category' && node.payload) {
      navigate(`/?category=${node.payload.id}`);
    } else if (node.type === 'tag' && node.payload) {
      navigate(`/?tag=${node.payload.id}`);
    }
  };

  const getStyleForType = (type: string, isHovered: boolean) => {
    switch (type) {
      case 'root':
        return {
          bg: 'bg-primary shadow-[0_0_20px_rgba(59,130,246,0.5)] border-primary/40',
          text: 'text-white font-black text-xs md:text-sm',
          icon: <Sparkles className="w-3.5 h-3.5" />
        };
      case 'glossary':
        return {
          bg: isHovered ? 'bg-indigo-600 shadow-[0_0_15px_rgba(99,102,241,0.5)] border-indigo-500' : 'bg-indigo-500/10 border-indigo-500/30 hover:bg-indigo-550/20',
          text: isHovered ? 'text-white' : 'text-indigo-650 dark:text-indigo-300 font-bold',
          icon: <BookOpen className="w-3 h-3" />
        };
      case 'category':
        return {
          bg: isHovered ? 'bg-emerald-600 shadow-[0_0_15px_rgba(16,185,129,0.5)] border-emerald-500' : 'bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-550/20',
          text: isHovered ? 'text-white' : 'text-emerald-650 dark:text-emerald-300 font-bold',
          icon: <Compass className="w-3 h-3" />
        };
      default: // tag
        return {
          bg: isHovered ? 'bg-amber-600 shadow-[0_0_15px_rgba(245,158,11,0.5)] border-amber-500' : 'bg-amber-500/10 border-amber-500/30 hover:bg-amber-550/20',
          text: isHovered ? 'text-white' : 'text-amber-650 dark:text-amber-300 font-bold',
          icon: <Tag className="w-3 h-3" />
        };
    }
  };

  return (
    <div className="glass p-8 rounded-[3.5rem] border border-white/5 shadow-2xl relative overflow-hidden my-16 select-none bg-slate-50/50 dark:bg-slate-950/20">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-xl font-black tracking-tight flex items-center gap-2">
            <Network className="text-primary animate-pulse" size={20} /> Article Knowledge Graph
          </h3>
          <p className="text-xs text-muted-foreground mt-1">Explore the interactive semantic network of historical entities, topics, and categories.</p>
        </div>
        <div className="flex gap-4 text-[10px] uppercase tracking-widest font-black text-slate-400">
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-indigo-500" /> Glossary</span>
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Categories</span>
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Tags</span>
        </div>
      </div>

      <div className="w-full relative h-[380px] rounded-3xl border border-slate-100 dark:border-white/5 bg-slate-100/50 dark:bg-slate-900/40 overflow-hidden">
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 600 400">
          {edges.map((edge, idx) => {
            const fromNode = nodes.find(n => n.id === edge.from);
            const toNode = nodes.find(n => n.id === edge.to);
            if (!fromNode || !toNode) return null;

            const isRelatedHovered = hoveredNode === fromNode.id || hoveredNode === toNode.id;

            return (
              <line
                key={idx}
                x1={fromNode.x}
                y1={fromNode.y}
                x2={toNode.x}
                y2={toNode.y}
                className="transition-all duration-300"
                stroke={isRelatedHovered ? 'var(--primary)' : 'rgba(148, 163, 184, 0.2)'}
                strokeWidth={isRelatedHovered ? 2.5 : 1}
              />
            );
          })}
        </svg>

        {nodes.map((node) => {
          const style = getStyleForType(node.type, hoveredNode === node.id);

          return (
            <motion.div
              key={node.id}
              drag
              dragConstraints={{ left: 50, right: 550, top: 50, bottom: 350 }}
              dragElastic={0.05}
              style={{
                position: 'absolute',
                left: node.x,
                top: node.y,
                x: '-50%',
                y: '-50%'
              }}
              whileHover={{ scale: 1.08 }}
              onHoverStart={() => setHoveredNode(node.id)}
              onHoverEnd={() => setHoveredNode(null)}
              onClick={() => handleNodeClick(node)}
              className={`px-4 py-2.5 rounded-2xl border flex items-center gap-2 cursor-pointer transition-all duration-300 backdrop-blur-md text-[11px] whitespace-nowrap ${style.bg}`}
            >
              {style.icon}
              <span className={`uppercase tracking-wider select-none ${style.text}`}>{node.label}</span>
            </motion.div>
          );
        })}
      </div>
      <div className="text-center text-[10px] text-slate-400 italic mt-3">💡 Tip: You can drag nodes to rearrange the graph layout manually.</div>
    </div>
  );
};
