import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { AnimatedWordSequence } from './AnimatedWordSequence';
import { QuoteCard } from './QuoteCard';
import { ParticleBackground } from '../intro/ParticleBackground';
import { cn } from '../../utils/cn';

export const HeroSection: React.FC = () => {
  const [isSequenceComplete, setIsSequenceComplete] = useState(false);

  const scrollToContent = () => {
    document.getElementById('featured-chronicles')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-[90vh] flex flex-col items-center justify-center pt-20 px-6 overflow-hidden">
      {/* Background Layer */}
      <div className="absolute inset-0 -z-10">
        <ParticleBackground isDark={true} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-primary/5 rounded-full blur-[160px]" />
      </div>

      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-20 items-center">
        {/* Left Side: Storytelling */}
        <div className="space-y-10">
          <AnimatedWordSequence onComplete={() => setIsSequenceComplete(true)} />

          <div className="space-y-6">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: isSequenceComplete ? 1 : 0 }}
              transition={{ duration: 1 }}
              className="text-xl md:text-2xl font-editorial italic text-slate-500 dark:text-slate-400"
            >
              Curiosity is where every Chronicle begins.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isSequenceComplete ? 1 : 0, y: isSequenceComplete ? 0 : 20 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="space-y-8"
            >
              <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl font-medium leading-relaxed">
                Every great discovery begins with a question. From forgotten chapters of Indian history
                to Android engineering, AOSP, cybersecurity and artificial intelligence,
                Chronicle Lab exists to explore ideas with depth, curiosity, and purpose.
              </p>

              <div className="flex flex-wrap gap-5">
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
        <div className="hidden lg:block">
          <QuoteCard />
        </div>
      </div>

      {/* Mobile Quote Card */}
      <div className="lg:hidden mt-20 w-full max-w-md">
        <QuoteCard />
      </div>

      {/* Scroll Indicator */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: isSequenceComplete ? 1 : 0 }}
        transition={{ delay: 2, duration: 1 }}
        onClick={scrollToContent}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 group cursor-pointer"
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
