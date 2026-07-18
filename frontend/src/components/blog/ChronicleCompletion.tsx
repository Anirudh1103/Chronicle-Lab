import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Check, Clock, Share2, Link2, QrCode, Compass, Home
} from 'lucide-react';

interface ChronicleCompletionProps {
  post: any;
  user: any;
  activeSeconds: number;
}

export const ChronicleCompletion: React.FC<ChronicleCompletionProps> = ({ post, user, activeSeconds }) => {
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    if (mins === 0) return `${secs} Sec`;
    return `${mins} Min ${secs} Sec`;
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mt-24 pt-16 border-t border-slate-100 dark:border-white/5 space-y-16 max-w-xl mx-auto px-4 md:px-0 select-none">
      
      {/* Dynamic Completion Text */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary border border-primary/20 animate-pulse mb-2">
          <Check size={22} className="stroke-[3]" />
        </div>
        <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Chronicle Complete</h2>
        <p className="text-2xl md:text-3xl font-editorial italic font-black text-slate-900 dark:text-white leading-tight">
          You have finished "{post.title}"
        </p>

        {/* Dynamic Read Time */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-white/5 border border-slate-150 dark:border-white/10 rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-200 mt-4 select-none">
          <Clock size={13} className="text-primary animate-spin" style={{ animationDuration: '6s' }} />
          <span>Time Spent: <span className="font-mono text-primary font-black">{formatTime(activeSeconds)}</span></span>
          <span className="text-slate-350 dark:text-white/10">|</span>
          <span>Estimated: {post.readingTime} Min</span>
        </div>
      </div>

      {/* Share Box */}
      <div className="glass p-8 rounded-[3rem] border border-slate-150 dark:border-white/5 space-y-6 bg-white/50 dark:bg-slate-950/20 shadow-xl">
        <div className="space-y-2 text-center">
          <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Share this Chronicle</h3>
          <p className="text-xs text-slate-500 font-medium">Extend the boundary of learning. Share this archive with fellow history and technology enthusiasts.</p>
        </div>

        <div className="flex justify-center gap-3 flex-wrap">
          {navigator.share && (
            <button
              onClick={() => navigator.share({ title: post.title, url: window.location.href })}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-xs font-black uppercase tracking-wider hover:bg-primary/90 transition-colors shadow"
            >
              <Share2 size={13} /> Native Share
            </button>
          )}
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-250 text-xs font-black uppercase tracking-wider hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
          >
            <Link2 size={13} /> {copied ? 'Copied' : 'Copy Link'}
          </button>
          <button
            onClick={() => setShowQR(!showQR)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-250 text-xs font-black uppercase tracking-wider hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
          >
            <QrCode size={13} /> QR Code
          </button>
        </div>

        {showQR && (
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="p-4 bg-white rounded-3xl border border-slate-100 dark:border-slate-800 flex flex-col items-center gap-3 w-40 shadow-2xl mt-4 mx-auto"
          >
            <img 
              src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(window.location.href)}`} 
              alt="QR Code"
              className="w-24 h-24"
            />
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Scan to Read</span>
          </motion.div>
        )}
      </div>

      {/* Book-Ending Goodbye Footer */}
      <div className="pt-8 text-center space-y-8 pb-10">
        <h3 className="font-editorial italic text-xl md:text-2xl font-black text-slate-900 dark:text-white leading-relaxed">
          "Every chronicle ends, but curiosity never should."
        </h3>
        
        <div className="flex justify-center gap-4">
          <Link
            to="/library"
            className="px-6 py-3.5 rounded-2xl border border-slate-200 dark:border-white/5 hover:border-primary text-slate-800 dark:text-white hover:text-primary text-xs font-black uppercase tracking-wider bg-white/30 dark:bg-slate-900/30 transition-all flex items-center gap-2"
          >
            <Compass size={14} /> Explore the Library
          </Link>
          <Link
            to="/"
            className="px-6 py-3.5 rounded-2xl bg-primary hover:bg-primary/95 text-white text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 shadow"
          >
            <Home size={14} /> Return Home
          </Link>
        </div>
      </div>

    </div>
  );
};
