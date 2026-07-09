import React from 'react';
import { motion } from 'framer-motion';
import { AmbientAura } from '../components/about/AmbientAura';
import { cn } from '../utils/cn';

const TextReveal: React.FC<{ children: React.ReactNode; className?: string; delay?: number }> = ({
  children,
  className,
  delay = 0
}) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-100px" }}
    transition={{ duration: 1, delay, ease: [0.16, 1, 0.3, 1] }}
    className={className}
  >
    {children}
  </motion.div>
);

export const AboutPage: React.FC = () => {
  return (
    <div className="relative min-h-screen bg-background pt-32 pb-48 overflow-hidden">
      <AmbientAura />

      <div className="relative z-10 max-w-5xl mx-auto px-6 space-y-48">
        {/* Section 1: Hero Statement */}
        <section className="text-center space-y-8 py-20">
          <TextReveal className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-editorial italic text-slate-400">
              Some stories shape history.
            </h2>
          </TextReveal>
          <TextReveal delay={0.4}>
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-none">
              Others shape the future.
            </h2>
          </TextReveal>
        </section>

        {/* Section 2: The Main Story */}
        <section className="max-w-2xl mx-auto space-y-16">
          <TextReveal className="space-y-6">
            <h3 className="text-4xl font-black tracking-tight">The Story Behind Chronicle Lab</h3>
            <div className="h-1 w-12 bg-primary rounded-full" />
          </TextReveal>

          <div className="space-y-12 text-lg md:text-xl text-muted-foreground font-medium leading-relaxed">
            <TextReveal delay={0.1}>
              <p>
                Chronicle Lab was created for people who enjoy looking beyond the obvious—those who believe that every historical event has lessons to teach and every piece of technology has a story worth understanding.
              </p>
            </TextReveal>

            <TextReveal delay={0.2}>
              <p>
                I'm <span className="text-foreground font-bold italic underline decoration-primary/30">Anirudh CM</span>, a Software Engineer driven by curiosity and a constant desire to learn.
              </p>
            </TextReveal>

            <TextReveal delay={0.3}>
              <p>
                My interests span Android application development, Android Open Source Project (AOSP), Android security, cybersecurity, artificial intelligence, and the fascinating history that has influenced civilizations and modern innovation alike.
              </p>
            </TextReveal>

            <TextReveal delay={0.4}>
              <p>
                For me, learning doesn't stop after reading documentation or finishing a project. I enjoy exploring how systems work beneath the surface, questioning assumptions, understanding design decisions, and sharing that journey with others.
              </p>
            </TextReveal>

            <TextReveal delay={0.5}>
              <p>
                Chronicle Lab is my digital laboratory—a place where research, engineering, and curiosity come together.
              </p>
            </TextReveal>

            <TextReveal delay={0.6}>
              <p>
                Every article is written with the goal of going deeper than headlines or tutorials, breaking down complex topics into something meaningful, practical, and enjoyable to read.
              </p>
            </TextReveal>

            <TextReveal delay={0.7}>
              <p>
                Whether you're here to discover untold chapters of Indian history, understand Android internals, explore cybersecurity concepts, or simply learn something new, I hope every visit leaves you with a fresh perspective.
              </p>
            </TextReveal>
          </div>
        </section>

        {/* Section 3: The Signature Quote */}
        <section className="py-20 flex flex-col items-center justify-center text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            className="relative group"
          >
            {/* Subtle Glow behind quote */}
            <div className="absolute inset-0 bg-primary/20 blur-[60px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

            <h2 className="relative text-4xl md:text-7xl font-editorial italic font-medium leading-tight text-slate-800 dark:text-white px-4">
              "Curiosity is where every <br className="hidden md:block" />
              <span className="relative inline-block">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-400 to-primary/60 animate-gradient-x">
                  Chronicle
                </span>
                <motion.div
                  animate={{ opacity: [0.4, 0.8, 0.4] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="absolute -inset-2 bg-primary/10 blur-xl -z-10 rounded-full"
                />
              </span> begins."
            </h2>
          </motion.div>
        </section>
      </div>
    </div>
  );
};
