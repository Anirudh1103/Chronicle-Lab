import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { AnimatedWordSequence } from './AnimatedWordSequence';
import { QuoteCard } from './QuoteCard';
import { ParticleBackground } from '../intro/ParticleBackground';

export const HeroSection: React.FC = () => {
  const [isSequenceComplete, setIsSequenceComplete] = useState(false);
  const [isDark, setIsDark] = useState(document.documentElement.classList.contains('dark'));

  React.useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const scrollToContent = () => {
    document.getElementById('featured-chronicles')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative flex min-h-[90vh] items-center px-6 pb-12 pt-8 sm:px-8 lg:px-12 lg:pb-16 lg:pt-0">
      {/* Background Layer */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <ParticleBackground isDark={isDark} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-primary/5 rounded-full blur-[160px]" />
      </div>

      <div className="mx-auto grid w-full max-w-[1440px] grid-cols-1 items-center gap-16 lg:grid-cols-[minmax(0,65fr)_minmax(20rem,35fr)] lg:gap-12 xl:gap-16">
        {/* Left Side: Storytelling */}
        <div className="min-w-0 max-w-[850px] space-y-12">
          <AnimatedWordSequence onComplete={() => setIsSequenceComplete(true)} />

          <div className="space-y-8">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
              className="text-xl font-editorial italic text-slate-500 md:text-2xl dark:text-slate-400"
            >
              Curiosity is where every Chronicle begins.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              className="space-y-10"
            >
              <p className="max-w-[650px] text-lg font-medium leading-8 text-slate-600 md:text-xl md:leading-9 dark:text-slate-400">
                Every great discovery begins with a question. From forgotten chapters of Indian history
                to Android engineering, AOSP, cybersecurity and artificial intelligence,
                Chronicle Lab exists to explore ideas with depth, curiosity, and purpose.
              </p>

              <div className="flex flex-wrap gap-4">
                <button
                  onClick={scrollToContent}
                  className="bg-primary text-primary-foreground px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20 flex items-center gap-3"
                >
                  Start Exploring <ArrowRight size={16} />
                </button>
                <button
                  onClick={() => document.getElementById('recent-chronicles')?.scrollIntoView({ behavior: 'smooth' })}
                  className="glass border-white/10 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/5 transition-all"
                >
                  Latest Articles
                </button>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Right Side: Quote Card */}
        <div className="w-full min-w-0 lg:flex lg:justify-end">
          <QuoteCard />
        </div>
      </div>


      {/* Scroll Indicator */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: isSequenceComplete ? 1 : 0 }}
        transition={{ delay: 2, duration: 1 }}
        onClick={scrollToContent}
        className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 lg:flex group cursor-pointer"
      >
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 group-hover:text-primary transition-colors">Explore</span>
        <motion.div
          animate={{ y: [0, 5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <ChevronDown size={20} className="text-slate-400 group-hover:text-primary transition-colors" />
        </motion.div>
      </motion.button>
    </section>
  );
};
