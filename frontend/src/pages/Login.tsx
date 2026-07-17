import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck, Mail, Lock, AlertCircle, Terminal, Eye, EyeOff } from 'lucide-react';
import { cn } from '../utils/cn';

const loginSchema = z.object({
  email: z.string().email('Invalid credentials format'),
  password: z.string().min(6, 'Password requirement not met'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const TypingText: React.FC<{ messages: string[] }> = ({ messages }) => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    let timeout: any;

    if (currentMessageIndex < messages.length) {
      if (currentText.length < messages[currentMessageIndex].length) {
        timeout = setTimeout(() => {
          setCurrentText(messages[currentMessageIndex].slice(0, currentText.length + 1));
        }, 30);
      } else {
        timeout = setTimeout(() => {
          setCurrentMessageIndex(prev => prev + 1);
          setCurrentText('');
        }, 1000);
      }
    } else {
      setIsTyping(false);
      // Restart cycle or keep final state? Let's cycle the last one or show all.
      // Actually, let's just show all messages after typing finishes.
    }

    return () => clearTimeout(timeout);
  }, [currentText, currentMessageIndex, messages]);

  if (!isTyping) {
    return (
      <div className="space-y-1">
        {messages.map((m, i) => (
          <p key={i} className="text-sm font-mono text-primary leading-relaxed text-left">
            &gt; {m}
          </p>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {messages.slice(0, currentMessageIndex).map((m, i) => (
        <p key={i} className="text-sm font-mono text-primary leading-relaxed text-left">
          &gt; {m}
        </p>
      ))}
      <p className="text-sm font-mono text-primary leading-relaxed text-left">
        &gt; {currentText}<span className="animate-pulse">_</span>
      </p>
    </div>
  );
};

export function Login() {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [glitchText, setGlitchText] = useState('ROOT_ACCESS');

  const location = useLocation();
  const from = location.state?.from?.pathname || '/admin';

  useEffect(() => {
    const texts = ['ROOT_ACCESS', 'ENCRYPTED', 'AUTHORIZED_ONLY', 'ANIRUDH_CM'];
    let i = 0;
    const interval = setInterval(() => {
      setGlitchText(texts[i % texts.length]);
      i++;
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      await login(data);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError('root', {
        message: 'PERMISSION_DENIED: Critical Authentication Failure.'
      });
    }
  };

  const terminalMessages = [
    "STATUS: Restricted Access",
    "Handshake protocol initialized...",
    "WARNING: Only Anirudh CM can decrypt this layer. Unauthorized attempts will be logged and neutralized.",
    "Note: Only the Anirudh can unlock the chronicles. All other attempts are futile."
  ];

  return (
    <div className="min-h-[90vh] flex items-center justify-center p-6 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/5 via-background to-background">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass p-8 md:p-12 rounded-[2.5rem] w-full max-w-lg space-y-8 shadow-[0_0_50px_-12px_rgba(59,130,246,0.3)] border-slate-200 dark:border-white/10 relative overflow-hidden"
      >
        {/* Cyber Decor */}
        <div className="absolute top-0 right-0 p-4 opacity-5 dark:opacity-10 pointer-events-none">
          <Terminal size={120} />
        </div>

        <div className="text-center space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-lg text-primary text-[10px] font-black uppercase tracking-[0.3em] mb-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            {glitchText}
          </div>

          <h1 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white">Secure Gateway</h1>

          <div className="bg-slate-100 dark:bg-slate-950/50 p-4 rounded-2xl border border-slate-200 dark:border-white/5 min-h-[100px] flex items-center">
            <TypingText messages={terminalMessages} />
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 relative z-10">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 ml-1">Identity (Email)</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-primary transition-colors" size={18} />
                <input
                  {...register('email')}
                  type="email"
                  placeholder="admin@chroniclelab.com"
                  className="w-full bg-slate-50 dark:bg-slate-950/20 border border-slate-200 dark:border-white/10 focus:border-primary/50 rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-2 ring-primary/20 transition-all font-medium text-slate-900 dark:text-white"
                />
              </div>
              {errors.email && <p className="text-[10px] text-destructive font-black uppercase tracking-wider ml-1">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 ml-1">Pass-Key</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-primary transition-colors" size={18} />
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 dark:bg-slate-950/20 border border-slate-200 dark:border-white/10 focus:border-primary/50 rounded-2xl py-4 pl-12 pr-12 outline-none focus:ring-2 ring-primary/20 transition-all font-medium text-slate-900 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-primary transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className="text-[10px] text-destructive font-black uppercase tracking-wider ml-1">{errors.password.message}</p>}
            </div>
          </div>

          <AnimatePresence>
            {errors.root && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-red-500/10 text-red-500 p-4 rounded-2xl flex items-center gap-3 text-xs font-bold border border-red-500/20"
              >
                <AlertCircle size={18} />
                {errors.root.message}
              </motion.div>
            )}
          </AnimatePresence>

          <button
            disabled={isLoading}
            type="submit"
            className="w-full bg-primary text-primary-foreground py-4 rounded-2xl font-black text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 shadow-xl shadow-primary/20"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Initialize Handshake <ShieldCheck size={18} />
              </>
            )}
          </button>
        </form>

        <div className="text-center">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
            System Origin: <span className="text-slate-400">Chronicle Lab</span>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
