import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Check, Clock, Share2, Link2, QrCode, Compass, Home, X, Download
} from 'lucide-react';
import { cn } from '../../utils/cn';

interface ChronicleCompletionProps {
  post: any;
  user: any;
  activeSeconds: number;
}

export const ChronicleCompletion: React.FC<ChronicleCompletionProps> = ({ post, user, activeSeconds }) => {
  const [copied, setCopied] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);

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

  const handleNativeShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.subtitle || post.excerpt,
        url: window.location.href
      }).catch(err => console.error('Share failed:', err));
    } else {
      handleCopyLink();
    }
  };

  const handleDownloadQR = async () => {
    try {
      const url = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(window.location.href)}`;
      const res = await fetch(url);
      const blob = await res.blob();
      const fileUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = `${post.slug}-qr.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Download QR failed:', err);
    }
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
 
      {/* Redesigned Share Box */}
      <div className="p-8 md:p-12 rounded-[2.5rem] bg-slate-50 dark:bg-slate-900/30 border border-slate-150 dark:border-white/5 space-y-8 shadow-sm text-center relative overflow-hidden select-none">
        <div className="space-y-3 max-w-md mx-auto">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">Share this Chronicle</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
            Every great story deserves another reader.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-xs mx-auto">
          {/* Primary Accent Share Button */}
          <button
            onClick={handleNativeShare}
            className="w-full flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-primary hover:bg-primary/95 text-white dark:text-slate-950 text-xs font-black uppercase tracking-wider transition-all duration-300 shadow-md active:scale-95 cursor-pointer outline-none focus:outline-none"
          >
            <Share2 size={14} className="stroke-[3]" />
            <span>Share chronicle</span>
          </button>
        </div>

        {/* Secondary Actions Row */}
        <div className="flex items-center justify-center gap-3 pt-6 border-t border-slate-150 dark:border-white/5 max-w-xs mx-auto">
          <button
            onClick={handleCopyLink}
            className={cn(
              "flex items-center gap-2 px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 outline-none focus:outline-none active:scale-95 border",
              copied 
                ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.15)] font-black"
                : "bg-slate-900 dark:bg-white/5 border-slate-800 dark:border-white/10 hover:bg-slate-800 dark:hover:bg-white/10 text-white dark:text-slate-350"
            )}
          >
            {copied ? (
              <>
                <Check size={11} className="stroke-[3]" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Link2 size={11} />
                <span>Copy Link</span>
              </>
            )}
          </button>

          <button
            onClick={() => setShowQRModal(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-900 dark:bg-white/5 border border-slate-800 dark:border-white/10 hover:bg-slate-800 dark:hover:bg-white/10 text-white dark:text-slate-350 text-[10px] font-black uppercase tracking-widest transition-all duration-300 outline-none focus:outline-none active:scale-95"
          >
            <QrCode size={11} />
            <span>QR Code</span>
          </button>
        </div>
      </div>

      {/* Portal QR Code Modal */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {showQRModal && (
            <div className="fixed inset-0 z-[20000] flex items-center justify-center p-4 select-none">
              {/* Transparent Dark Overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowQRModal(false)}
                className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm"
              />

              {/* Modal Box */}
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 15 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 15 }}
                transition={{ type: 'spring', stiffness: 240, damping: 28 }}
                className="relative bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 max-w-sm w-full shadow-2xl space-y-6 text-center text-slate-900 dark:text-slate-100 z-55"
              >
                {/* Close Button */}
                <button
                  onClick={() => setShowQRModal(false)}
                  className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all outline-none focus:outline-none"
                >
                  <X size={15} />
                </button>

                <div className="space-y-1">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 dark:text-slate-500">Scan to Read</h4>
                  <h3 className="text-lg font-editorial italic font-black text-slate-900 dark:text-white">Chronicle Archive</h3>
                </div>

                <div className="flex justify-center p-2 bg-slate-50 dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 max-w-[180px] mx-auto">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(window.location.href)}`} 
                    alt="QR Code"
                    className="w-36 h-36 dark:invert-[0.05] rounded-2xl"
                  />
                </div>

                <div className="space-y-3 pt-2">
                  <button
                    onClick={handleDownloadQR}
                    className="flex items-center justify-center gap-2 w-full py-3.5 bg-slate-50 dark:bg-white/5 border border-slate-150 dark:border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-wider text-slate-650 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors outline-none focus:outline-none"
                  >
                    <Download size={12} />
                    <span>Download QR</span>
                  </button>

                  <div className="flex gap-2">
                    <button
                      onClick={handleCopyLink}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-1.5 py-3 rounded-2xl text-[9px] font-black uppercase tracking-wider transition-all duration-300 outline-none focus:outline-none border",
                        copied 
                          ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-[0_0_12px_rgba(16,185,129,0.15)] font-black"
                          : "bg-slate-900 dark:bg-white/5 border-slate-800 dark:border-white/10 hover:bg-slate-800 dark:hover:bg-white/10 text-white dark:text-slate-350"
                      )}
                    >
                      {copied ? <Check size={10} className="stroke-[3]" /> : <Link2 size={10} />}
                      <span>{copied ? 'Copied' : 'Copy'}</span>
                    </button>

                    <button
                      onClick={handleNativeShare}
                      className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-2xl bg-primary hover:bg-primary/95 text-white dark:text-slate-950 text-[9px] font-black uppercase tracking-wider transition-all duration-300 outline-none focus:outline-none"
                    >
                      <Share2 size={10} className="stroke-[3]" />
                      <span>Share</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
};
