import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ShieldAlert, ChevronLeft } from 'lucide-react';

export function Register() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass p-12 rounded-[3rem] w-full max-w-lg text-center space-y-8 border-white/10 shadow-2xl"
      >
        <div className="inline-flex p-4 bg-amber-500/10 text-amber-500 rounded-full mb-4">
          <ShieldAlert size={48} />
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl font-black tracking-tighter">Access Restricted</h1>
          <p className="text-muted-foreground text-lg font-medium leading-relaxed">
            Registration for <span className="text-primary font-bold">Chronicle Lab</span> is currently closed to the public.
          </p>
          <p className="text-slate-500 text-sm italic">
            "Only the architect can expand the laboratory."
          </p>
        </div>

        <div className="pt-8">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-2xl font-black hover:scale-[1.02] transition-all shadow-xl shadow-primary/20"
          >
            <ChevronLeft size={20} /> Back to Login
          </Link>
        </div>

        <p className="text-xs text-slate-400">
          If you are Anirudh and lost access, please use the administrative recovery channel.
        </p>
      </motion.div>
    </div>
  );
}
