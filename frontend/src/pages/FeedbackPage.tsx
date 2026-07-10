import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, MessageSquare, Heart, Sparkles, Star, Zap, Info } from 'lucide-react';
import { cn } from '../utils/cn';
import { blogApi } from '../api/blog.api';
import { useForm } from 'react-hook-form';

type FeedbackType = 'suggestion' | 'bug' | 'love';

interface FeedbackFormValues {
  name: string;
  email: string;
  message: string;
}

export function FeedbackPage() {
  const [submitted, setSubmitted] = useState(false);
  const [type, setType] = useState<FeedbackType>('love');
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, reset } = useForm<FeedbackFormValues>();

  const onSubmit = async (data: FeedbackFormValues) => {
    setLoading(true);
    try {
      await blogApi.submitFeedback({ ...data, type });
      setSubmitted(true);
      reset();
    } catch (error) {
      console.error('Feedback submission failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const types = [
    { id: 'love', label: 'Appreciation', icon: <Heart size={16} />, color: 'text-rose-500 bg-rose-500/10' },
    { id: 'suggestion', label: 'Suggestion', icon: <Sparkles size={16} />, color: 'text-amber-500 bg-amber-500/10' },
    { id: 'bug', label: 'Report Issue', icon: <Zap size={16} />, color: 'text-blue-500 bg-blue-500/10' },
  ];

  return (
    <div className="min-h-screen py-20 px-6 max-w-4xl mx-auto flex flex-col justify-center">
      <AnimatePresence mode="wait">
        {!submitted ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-12 items-start"
          >
            {/* Left Side: Copy */}
            <div className="space-y-8 pt-4">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full text-primary text-[10px] font-black uppercase tracking-widest">
                  <MessageSquare size={12} /> Communication Channel
                </div>
                <h1 className="text-6xl font-black tracking-tighter leading-[0.9]">
                  Let's Refine the <br /> <span className="text-primary">Chronicles.</span>
                </h1>
                <p className="text-xl text-muted-foreground font-medium leading-relaxed max-w-md">
                  Every entry in the lab is a work in progress. Your insights help bridge the gap between complexity and clarity.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 pt-8">
                 <div className="flex items-start gap-4 p-4 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                    <div className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm">
                       <Star size={20} className="text-amber-500" fill="currentColor" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">Direct Impact</h4>
                      <p className="text-xs text-muted-foreground mt-1">Your suggestions directly influence the next deep-dive investigation.</p>
                    </div>
                 </div>
                 <div className="flex items-start gap-4 p-4 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                    <div className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm">
                       <Info size={20} className="text-primary" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">Open Dialogue</h4>
                      <p className="text-xs text-muted-foreground mt-1">I personally read and reflect on every message sent to the lab.</p>
                    </div>
                 </div>
              </div>
            </div>

            {/* Right Side: Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="glass p-8 md:p-10 rounded-[3rem] border-white/10 shadow-2xl relative"
            >
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="flex gap-2">
                  {types.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setType(t.id as FeedbackType)}
                      className={cn(
                        "flex-1 flex flex-col items-center justify-center gap-2 py-3 rounded-2xl border transition-all",
                        type === t.id
                          ? cn("border-transparent shadow-lg scale-105", t.color)
                          : "border-slate-100 dark:border-white/5 text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5"
                      )}
                    >
                      {t.icon}
                      <span className="text-[10px] font-black uppercase tracking-wider">{t.label}</span>
                    </button>
                  ))}
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Identity</label>
                    <input
                      {...register('name', { required: true })}
                      type="text"
                      placeholder="Your Name"
                      className="w-full bg-slate-50 dark:bg-slate-950/20 border border-slate-200 dark:border-white/10 rounded-2xl py-4 px-6 outline-none focus:ring-2 ring-primary/20 transition-all font-medium"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Signal (Email)</label>
                    <input
                      {...register('email', { required: true })}
                      type="email"
                      placeholder="hello@example.com"
                      className="w-full bg-slate-50 dark:bg-slate-950/20 border border-slate-200 dark:border-white/10 rounded-2xl py-4 px-6 outline-none focus:ring-2 ring-primary/20 transition-all font-medium"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Transmission</label>
                    <textarea
                      {...register('message', { required: true })}
                      rows={4}
                      placeholder="Share your perspective..."
                      className="w-full bg-slate-50 dark:bg-slate-950/20 border border-slate-200 dark:border-white/10 rounded-2xl py-4 px-6 outline-none focus:ring-2 ring-primary/20 transition-all resize-none font-medium"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-primary-foreground py-5 rounded-[1.5rem] font-black flex items-center justify-center gap-3 hover:opacity-90 active:scale-[0.98] transition-all shadow-xl shadow-primary/20 uppercase text-xs tracking-[0.2em] disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send size={18} /> Broadcast Message
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="success"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center py-20 space-y-8 max-w-lg mx-auto"
          >
            <div className="relative inline-flex">
              <motion.div
                animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="p-8 bg-emerald-500/10 text-emerald-500 rounded-full"
              >
                <Heart size={64} fill="currentColor" />
              </motion.div>
              <motion.div
                animate={{ y: [-10, -30], opacity: [0, 1, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-4 -right-4 text-emerald-500"
              >
                <Sparkles size={32} />
              </motion.div>
            </div>

            <div className="space-y-4">
              <h2 className="text-5xl font-black tracking-tighter">Signal Received.</h2>
              <p className="text-xl text-muted-foreground font-medium leading-relaxed">
                Thank you for contributing to the collective knowledge of the lab. Your message has been safely stored in the archives.
              </p>
            </div>

            <div className="pt-8">
              <button
                onClick={() => setSubmitted(false)}
                className="inline-flex items-center gap-2 px-8 py-4 bg-slate-100 dark:bg-slate-800 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-colors"
              >
                Send Another Signal
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
