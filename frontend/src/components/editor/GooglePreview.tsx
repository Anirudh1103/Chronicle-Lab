import React from 'react';

interface GooglePreviewProps {
  title: string;
  url: string;
  description: string;
}

export const GooglePreview: React.FC<GooglePreviewProps> = ({ title, url, description }) => {
  const displayUrl = `https://chroniclelab.com/blog/${url || 'your-slug'}`;

  return (
    <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm max-w-xl font-sans">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-7 h-7 bg-slate-100 rounded-full flex items-center justify-center text-[10px] text-slate-400">
          CL
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-slate-700 leading-none">Chronicle Lab</span>
          <span className="text-[10px] text-slate-500 leading-none mt-0.5">{displayUrl}</span>
        </div>
      </div>
      <h3 className="text-[#1a0dab] text-xl hover:underline cursor-pointer mb-1 truncate">
        {title || 'Title of your amazing blog post'}
      </h3>
      <p className="text-[#4d5156] text-sm line-clamp-2 leading-relaxed">
        {description || 'Provide a compelling meta description to increase your click-through rate in search results...'}
      </p>
    </div>
  );
};
