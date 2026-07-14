import React from 'react';
import { Minus } from 'lucide-react';

interface DividerBlockProps {
  id: string;
  content: {
    style?: 'solid' | 'dashed' | 'dots';
  };
}

export const DividerBlock: React.FC<DividerBlockProps> = () => {
  return (
    <div className="py-8 flex items-center justify-center">
      <div className="w-full h-px bg-slate-200 dark:bg-slate-800 relative">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-slate-950 px-4">
          <Minus className="text-slate-300 dark:text-slate-600" size={20} />
        </div>
      </div>
    </div>
  );
};
