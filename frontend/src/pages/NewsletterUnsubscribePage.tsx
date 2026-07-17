import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MailX, ShieldAlert, RotateCcw } from 'lucide-react';
import { blogApi } from '../api/blog.api';

export function NewsletterUnsubscribePage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('An unexpected error occurred.');

  useEffect(() => {
    document.title = "Unsubscribe | Chronicle Lab";
    const unsubscribeUser = async () => {
      if (!token) {
        setStatus('error');
        setErrorMsg('Unsubscribe token is missing.');
        return;
      }

      try {
        await blogApi.unsubscribeNewsletter(token);
        setStatus('success');
      } catch (error: any) {
        setStatus('error');
        const msg = error?.response?.data?.error || 'Failed to unsubscribe. The link may be invalid or expired.';
        setErrorMsg(msg);
      }
    };

    unsubscribeUser();
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
            <p className="font-black text-xs uppercase tracking-[0.3em] text-slate-400">Processing unsubscription...</p>
          </motion.div>
        )}

        {status === 'success' && (
          <motion.div
            key="success"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center space-y-8 max-w-lg mx-auto"
          >
            <div className="p-8 bg-red-500/10 text-red-550 dark:text-red-400 rounded-full inline-block border border-red-500/20">
              <MailX size={64} strokeWidth={1.5} />
            </div>

            <div className="space-y-4">
              <h1 className="text-5xl font-black tracking-tighter text-slate-900 dark:text-white">
                You've been unsubscribed.
              </h1>
              <p className="text-xl text-muted-foreground font-medium leading-relaxed">
                You will no longer receive newsletters or announcements from Chronicle Lab.
              </p>
            </div>

            <div className="pt-8 space-y-4">
              <p className="text-sm text-slate-400 font-bold">Changed your mind?</p>
              <Link
                to="/"
                className="inline-flex items-center gap-2.5 px-6 py-4 bg-slate-100 dark:bg-slate-800 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-colors"
              >
                <RotateCcw size={16} /> Subscribe again
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
                Unsubscribe Failed
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
