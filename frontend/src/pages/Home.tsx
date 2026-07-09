import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { PostCard } from '../components/PostCard';

export function Home() {
  const posts = [
    {
      id: '1',
      title: 'The Future of Web Development in 2024',
      subtitle: 'Exploring how AI and edge computing are reshaping the digital landscape and creating new opportunities for developers.',
      slug: 'future-web-2024',
      category: { name: 'Architecture' },
      author: { name: 'John Doe' },
      createdAt: '2024-03-12',
      readingTime: 8,
      coverImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop'
    },
    {
      id: '2',
      title: 'Mastering Framer Motion for Smooth UI',
      subtitle: 'A comprehensive guide to creating fluid animations that delight users without sacrificing performance or accessibility.',
      slug: 'mastering-framer-motion',
      category: { name: 'Design' },
      author: { name: 'Jane Smith' },
      createdAt: '2024-03-10',
      readingTime: 12,
      coverImage: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2070&auto=format&fit=crop'
    },
    {
      id: '3',
      title: 'Prisma vs. TypeORM: Which one to choose?',
      subtitle: 'Comparing the two most popular ORMs for Node.js and TypeScript. We dive deep into performance, developer experience, and more.',
      slug: 'prisma-vs-typeorm',
      category: { name: 'Backend' },
      author: { name: 'Alex Rivera' },
      createdAt: '2024-03-08',
      readingTime: 6,
      coverImage: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc48?q=80&w=2070&auto=format&fit=crop'
    }
  ];

  return (
    <div className="space-y-32 pb-32">
      {/* Premium Hero Section */}
      <section className="relative min-h-[70vh] flex flex-col items-center justify-center text-center px-4 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 -z-10">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{ duration: 10, repeat: Infinity }}
            className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px]"
          />
          <motion.div
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.2, 0.4, 0.2]
            }}
            transition={{ duration: 10, repeat: Infinity, delay: 2 }}
            className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[150px]"
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8 max-w-5xl"
        >
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full glass border-white/10 text-xs font-black uppercase tracking-[0.2em] text-primary">
            <Sparkles size={14} /> The Future of Tech Blogging
          </div>

          <h1 className="text-7xl md:text-9xl font-black tracking-tighter leading-[0.85] text-balance">
            Design. Code. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary/80 to-primary/40">
              Innovate.
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto font-medium leading-relaxed">
            A premium space for modern developers to explore software architecture,
            high-end UI design, and the evolving digital landscape.
          </p>

          <div className="flex flex-wrap justify-center gap-5 pt-4">
            <button className="bg-primary text-primary-foreground px-10 py-5 rounded-[2rem] font-black text-lg hover:scale-105 transition-all shadow-2xl shadow-primary/25 flex items-center gap-3">
              Start Reading <ArrowRight size={20} />
            </button>
            <button className="glass px-10 py-5 rounded-[2rem] font-black text-lg hover:bg-muted transition-all border-white/5">
              Newsletter
            </button>
          </div>
        </motion.div>
      </section>

      {/* Featured Articles Grid */}
      <section className="space-y-16">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6">
          <div className="space-y-4">
            <h2 className="text-5xl font-black tracking-tighter">Latest Stories</h2>
            <div className="h-1.5 w-20 bg-primary rounded-full" />
          </div>
          <p className="text-muted-foreground font-medium max-w-xs">
            Deep dives into modern technologies and best practices for building production-grade software.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {posts.map((post, index) => (
            <PostCard key={post.id} post={post} index={index} />
          ))}
        </div>
      </section>

      {/* Newsletter / CTA Section */}
      <section className="glass rounded-[4rem] p-16 md:p-24 text-center space-y-10 border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -ml-32 -mb-32" />

        <div className="max-w-2xl mx-auto space-y-6">
          <h2 className="text-5xl font-black tracking-tighter">Stay Ahead of the Curve</h2>
          <p className="text-xl text-muted-foreground font-medium">
            Join 10,000+ developers receiving curated insights and deep dives into the modern tech ecosystem.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 bg-muted/50 border border-white/5 rounded-2xl px-6 py-4 outline-none focus:ring-2 ring-primary/20 transition-all font-medium"
            />
            <button className="bg-primary text-primary-foreground px-8 py-4 rounded-2xl font-black hover:opacity-90 transition-all shadow-xl shadow-primary/20 whitespace-nowrap">
              Subscribe Now
            </button>
          </div>
          <p className="text-xs text-muted-foreground font-medium">
            No spam. Ever. Unsubscribe at any time.
          </p>
        </div>
      </section>
    </div>
  );
}
