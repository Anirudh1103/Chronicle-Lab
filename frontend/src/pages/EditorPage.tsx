import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { TiptapEditor } from '../components/editor/TiptapEditor';
import { Save, Eye, Settings, Image as ImageIcon, ChevronLeft, Globe, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const postSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  subtitle: z.string().optional(),
  slug: z.string().min(1, 'Slug is required'),
  content: z.string().min(1, 'Content is required'),
  categoryId: z.string().optional(),
  featured: z.boolean().default(false),
  published: z.boolean().default(false),
});

type PostFormValues = z.infer<typeof postSchema>;

export function EditorPage() {
  const navigate = useNavigate();
  const [showSettings, setShowSettings] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PostFormValues>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      content: '<h2>Start writing your masterpiece...</h2>',
      featured: false,
      published: false,
    }
  });

  const content = watch('content');
  const title = watch('title');

  const onSubmit = async (data: PostFormValues) => {
    console.log('Saving post:', data);
    // TODO: Implement API call
  };

  return (
    <div className="max-w-6xl mx-auto py-10 space-y-10">
      {/* Header */}
      <header className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/posts')}
            className="p-2 hover:bg-muted rounded-full transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-black tracking-tight">
              {title || 'New Post'}
            </h1>
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" /> Draft
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2.5 rounded-xl border transition-all ${showSettings ? 'bg-primary text-primary-foreground' : 'glass hover:bg-muted'}`}
          >
            <Settings size={20} />
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 glass rounded-xl font-bold hover:bg-muted transition-colors">
            <Eye size={18} /> Preview
          </button>
          <button
            onClick={handleSubmit(onSubmit)}
            className="flex items-center gap-2 px-8 py-2.5 bg-primary text-primary-foreground rounded-xl font-black hover:opacity-90 transition-all shadow-xl shadow-primary/20"
          >
            <Save size={18} /> Save Changes
          </button>
        </div>
      </header>

      <div className="flex gap-10">
        {/* Editor Main Area */}
        <div className="flex-1 space-y-8">
          <div className="space-y-4">
            <input
              {...register('title')}
              placeholder="Article Title"
              className="w-full text-6xl font-black bg-transparent border-none outline-none placeholder:text-muted focus:ring-0"
            />
            <input
              {...register('subtitle')}
              placeholder="Add a subtitle..."
              className="w-full text-2xl font-medium text-muted-foreground bg-transparent border-none outline-none placeholder:text-muted/50 focus:ring-0"
            />
          </div>

          <TiptapEditor
            content={content}
            onChange={(html) => setValue('content', html, { shouldValidate: true })}
          />
        </div>

        {/* Sidebar Settings */}
        {showSettings && (
          <motion.aside
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-80 space-y-6"
          >
            <div className="glass p-6 rounded-[2rem] border-white/10 space-y-6">
              <h3 className="font-black flex items-center gap-2">
                <Globe size={18} /> Publishing
              </h3>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">URL Slug</label>
                  <input
                    {...register('slug')}
                    className="w-full bg-muted/50 border rounded-xl p-3 outline-none focus:ring-2 ring-primary/20 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Category</label>
                  <select
                    {...register('categoryId')}
                    className="w-full bg-muted/50 border rounded-xl p-3 outline-none focus:ring-2 ring-primary/20 transition-all"
                  >
                    <option value="">Uncategorized</option>
                    <option value="tech">Technology</option>
                    <option value="design">Design</option>
                  </select>
                </div>

                <div className="flex items-center justify-between p-3 glass rounded-xl">
                  <span className="text-sm font-bold">Featured Post</span>
                  <input type="checkbox" {...register('featured')} className="w-5 h-5 rounded-md accent-primary" />
                </div>

                <div className="flex items-center justify-between p-3 glass rounded-xl">
                  <span className="text-sm font-bold">Publicly Visible</span>
                  <input type="checkbox" {...register('published')} className="w-5 h-5 rounded-md accent-primary" />
                </div>
              </div>
            </div>

            <div className="glass p-6 rounded-[2rem] border-white/10 space-y-4">
              <h3 className="font-black flex items-center gap-2">
                <ImageIcon size={18} /> Cover Image
              </h3>
              <div className="aspect-video bg-muted/50 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-primary hover:border-primary transition-all cursor-pointer">
                <ImageIcon size={32} />
                <span className="text-xs font-bold">Click to upload</span>
              </div>
            </div>
          </motion.aside>
        )}
      </div>
    </div>
  );
}
