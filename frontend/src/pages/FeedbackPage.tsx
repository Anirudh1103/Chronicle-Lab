import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, MessageSquare, Heart, Sparkles } from 'lucide-react';

export function FeedbackPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-[80vh] py-20 px-6 max-w-2xl mx-auto">
      {!submitted ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-8 md:p-12 rounded-[3rem] border-white/10 space-y-8"
        >
          <div className="space-y-4 text-center">
            <div className="inline-flex p-3 bg-primary/10 rounded-2xl text-primary mb-4">
              <MessageSquare size={32} />
            </div>
            <h1 className="text-4xl font-black tracking-tighter">Share Your Thoughts</h1>
            <p className="text-muted-foreground font-medium">
              Every chronicle is better when shared. I'd love to hear your feedback or suggestions for future topics.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold ml-1">Your Name</label>
              <input
                required
                type="text"
                placeholder="Anirudh CM"
                className="w-full bg-muted/50 border border-white/5 rounded-2xl py-4 px-6 outline-none focus:ring-2 ring-primary/20 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold ml-1">Email Address</label>
              <input
                required
                type="email"
                placeholder="hello@example.com"
                className="w-full bg-muted/50 border border-white/5 rounded-2xl py-4 px-6 outline-none focus:ring-2 ring-primary/20 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold ml-1">Your Message</label>
              <textarea
                required
                rows={5}
                placeholder="What did you think of the latest chronicle?"
                className="w-full bg-muted/50 border border-white/5 rounded-2xl py-4 px-6 outline-none focus:ring-2 ring-primary/20 transition-all resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-primary text-primary-foreground py-4 rounded-2xl font-black flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-primary/20"
            >
              <Send size={20} /> Send Feedback
            </button>
          </form>
        </motion.div>
      ) : (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center py-20 space-y-6"
        >
          <div className="inline-flex p-6 bg-emerald-500/10 text-emerald-500 rounded-full mb-4">
            <Heart size={48} fill="currentColor" />
          </div>
          <h2 className="text-4xl font-black tracking-tighter">Thank you for the love!</h2>
          <p className="text-muted-foreground font-medium max-w-sm mx-auto text-lg">
            I appreciate you taking the time to share your thoughts. I'll read this with the same curiosity I use for my chronicles.
          </p>
          <div className="pt-8">
            <button
              onClick={() => setSubmitted(false)}
              className="text-primary font-black flex items-center gap-2 mx-auto hover:underline"
            >
              <Sparkles size={18} /> Send another message
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
