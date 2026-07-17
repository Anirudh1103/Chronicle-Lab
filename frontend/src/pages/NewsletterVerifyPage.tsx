import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ShieldAlert, Sparkles, Compass } from 'lucide-react';
import { blogApi } from '../api/blog.api';

export function NewsletterVerifyPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('An unexpected error occurred.');

  useEffect(() => {
    document.title = "Verify Subscription | Chronicle Lab";
    const verifyToken = async () => {
      if (!token) {
        setStatus('error');
        setErrorMsg('Verification token is missing.');
        return;
      }

      try {
        await blogApi.verifyNewsletter(token);
        setStatus('success');
      } catch (error: any) {
        setStatus('error');
        const msg = error?.response?.data?.error || 'Verification failed. The link may have expired or is invalid.';
        setErrorMsg(msg);
      }
    };

    verifyToken();
  }, [token]);

  return (
    <div className="min-h-[80vh] py-20 px-6 flex flex-col justify-center items-center">
      <AnimatePresence mode="wait">
        {status === 'loading' && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-6"
          >
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            <p className="font-black text-xs uppercase tracking-[0.3em] text-slate-400">Verifying secure token...</p>
          </motion.div>
        )}

        {status === 'success' && (
          <motion.div
            key="success"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 100, damping: 15 }}
            className="text-center space-y-8 max-w-lg mx-auto"
          >
            <div className="relative inline-flex">
              <motion.div
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="p-8 bg-emerald-500/10 text-emerald-500 rounded-full border border-emerald-500/20 shadow-[0_0_50px_rgba(16,185,129,0.15)]"
              >
                <Check size={64} strokeWidth={2.5} />
              </motion.div>
              <motion.div
                animate={{ y: [-5, -25], opacity: [0, 1, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-4 -right-4 text-emerald-400"
              >
                <Sparkles size={32} />
              </motion.div>
            </div>

            <div className="space-y-4">
              <h1 className="text-5xl font-black tracking-tighter text-slate-900 dark:text-white">
                You're officially subscribed.
              </h1>
              <p className="text-xl text-muted-foreground font-medium leading-relaxed">
                Welcome to Chronicle Lab. You'll now receive our latest stories, blueprints, and deep dives.
              </p>
            </div>

            <div className="pt-8">
              <Link
                to="/library"
                className="inline-flex items-center gap-3 px-8 py-5 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20"
              >
                <Compass size={18} /> Explore Chronicle Lab
              </Link>
            </div>
          </motion.div>
        )}

        {status === 'error' && (
          <motion.div
            key="error"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center space-y-8 max-w-lg mx-auto"
          >
            <div className="p-8 bg-amber-500/10 text-amber-500 rounded-full inline-block border border-amber-500/20">
              <ShieldAlert size={64} strokeWidth={1.5} />
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white">
                Verification Failed
              </h1>
              <p className="text-lg text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                {errorMsg}
              </p>
            </div>

            <div className="pt-8">
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-8 py-4 bg-slate-100 dark:bg-slate-800 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-colors"
              >
                Return to Home
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
