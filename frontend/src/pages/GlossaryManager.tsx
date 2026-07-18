import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Plus, Trash2, Edit3, X, AlertCircle, Save } from 'lucide-react';
import { blogApi } from '../api/blog.api';
import { cn } from '../utils/cn';
import { createPortal } from 'react-dom';

interface GlossaryTerm {
  id: string;
  term: string;
  definition: string;
  category: string;
  createdAt: string;
}

export function GlossaryManager() {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [selectedTerm, setSelectedTerm] = useState<GlossaryTerm | null>(null);
  
  // Form fields
  const [term, setTerm] = useState('');
  const [definition, setDefinition] = useState('');
  const [category, setCategory] = useState<string>('history');
  const [error, setError] = useState<string | null>(null);

  // Fetch glossary terms
  const { data: terms = [], isLoading } = useQuery<GlossaryTerm[]>({
    queryKey: ['glossary-admin'],
    queryFn: async () => {
      const data = await blogApi.getGlossary();
      return data;
    }
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  const filteredTerms = terms.filter((item) => {
    const matchesSearch = 
      item.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.definition.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesCategory = filterCategory === 'all' || item.category.toLowerCase() === filterCategory.toLowerCase();
    
    return matchesSearch && matchesCategory;
  });

  // Create/Update Mutation
  const saveMutation = useMutation({
    mutationFn: async (payload: { id?: string; term: string; definition: string; category: string }) => {
      const data = await blogApi.saveGlossary(payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['glossary-admin'] });
      queryClient.invalidateQueries({ queryKey: ['glossary'] });
      closeForm();
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || error.message || 'Failed to save glossary term.';
      setError(msg);
    }
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await blogApi.deleteGlossary(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['glossary-admin'] });
      queryClient.invalidateQueries({ queryKey: ['glossary'] });
    }
  });

  const openNewForm = () => {
    setSelectedTerm(null);
    setTerm('');
    setDefinition('');
    setCategory('history');
    setError(null);
    setIsEditing(true);
  };

  const openEditForm = (item: GlossaryTerm) => {
    setSelectedTerm(item);
    setTerm(item.term);
    setDefinition(item.definition);
    setCategory(item.category);
    setError(null);
    setIsEditing(true);
  };

  const closeForm = () => {
    setIsEditing(false);
    setSelectedTerm(null);
    setTerm('');
    setDefinition('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!term.trim() || !definition.trim()) {
      setError('All fields are required.');
      return;
    }
    saveMutation.mutate({
      id: selectedTerm?.id,
      term: term.trim(),
      definition: definition.trim(),
      category
    });
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this term? Matched text on all articles will revert to default rendering.')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
            <BookOpen className="text-primary" size={36} /> Glossary Dictionary
          </h1>
          <p className="text-muted-foreground mt-2">Manage definitions highlighted inline across history, technology, and cybersecurity blogs.</p>
        </div>
        <button
          onClick={openNewForm}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3.5 rounded-2xl font-black hover:opacity-90 transition-all shadow-lg shadow-primary/20 hover:scale-105 active:scale-95"
        >
          <Plus size={20} /> Add Term
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 w-full glass p-4 rounded-3xl border border-white/5">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search glossary by word, definition or category..."
          className="flex-1 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-2xl py-3 px-5 outline-none focus:border-primary/50 text-xs font-bold text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
        />
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-2xl py-3 px-5 outline-none focus:border-primary/50 text-xs font-bold text-slate-800 dark:text-white"
        >
          <option value="all">All Categories</option>
          <option value="history">History</option>
          <option value="technology">Technology</option>
          <option value="cybersecurity">Cyber Security</option>
          <option value="military">Military</option>
          <option value="politics">Politics</option>
          <option value="android">Android</option>
          <option value="networking">Networking</option>
          <option value="programming">Programming</option>
          <option value="general">General</option>
        </select>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {isLoading ? (
          <div className="space-y-4">
            <div className="h-20 bg-muted animate-pulse rounded-2xl w-full" />
            <div className="h-20 bg-muted animate-pulse rounded-2xl w-full" />
            <div className="h-20 bg-muted animate-pulse rounded-2xl w-full" />
          </div>
        ) : terms.length === 0 ? (
          <div className="glass p-20 rounded-[3rem] text-center border-white/5 space-y-4">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto opacity-20">
              <BookOpen size={32} />
            </div>
            <p className="italic font-medium text-muted-foreground">The glossary dictionary is empty.</p>
            <p className="text-[10px] uppercase font-black tracking-widest opacity-40">Add terms to trigger automatic inline hover definitions</p>
          </div>
        ) : filteredTerms.length === 0 ? (
          <div className="glass p-20 rounded-[3rem] text-center border-white/5 space-y-4">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto opacity-20">
              <X size={32} />
            </div>
            <p className="italic font-medium text-muted-foreground">No matches found for your search query.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredTerms.map((item) => (
              <motion.div
                layout
                key={item.id}
                className="glass p-6 rounded-[2rem] border-white/5 space-y-4 flex flex-col justify-between hover:border-primary/20 transition-all duration-300"
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-start gap-4">
                    <h3 className="text-2xl font-black tracking-tight">{item.term}</h3>
                    <span className={cn(
                      "text-[9px] font-black uppercase tracking-[0.2em] px-2.5 py-1 rounded-full text-white border",
                      item.category.toLowerCase() === 'history' ? 'bg-amber-500/20 text-amber-400 border-amber-500/20' :
                      item.category.toLowerCase() === 'technology' ? 'bg-blue-500/20 text-blue-400 border-blue-500/20' :
                      item.category.toLowerCase() === 'cybersecurity' ? 'bg-red-500/20 text-red-400 border-red-500/20' :
                      'bg-slate-500/20 text-slate-400 border-slate-500/20'
                    )}>
                      {item.category}
                    </span>
                  </div>
                  <p className="text-muted-foreground text-sm font-medium leading-relaxed">{item.definition}</p>
                </div>
                
                <div className="flex gap-3 justify-end pt-4 border-t border-white/5">
                  <button
                    onClick={() => openEditForm(item)}
                    className="p-3 bg-white/5 hover:bg-primary/10 hover:text-primary rounded-xl text-slate-400 transition-all"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-3 bg-white/5 hover:bg-destructive/10 hover:text-destructive rounded-xl text-slate-400 transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Editor Modal */}
      {createPortal(
        <AnimatePresence>
          {isEditing && (
            <motion.div
              key="glossary-modal-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[20000] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="glass p-8 rounded-[2.5rem] w-full max-w-lg space-y-6 shadow-2xl border-white/10 relative overflow-hidden text-slate-900 dark:text-white"
              >
              <div className="flex justify-between items-center">
                <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                  {selectedTerm ? 'Edit Term' : 'Add Term'}
                </h2>
                <button onClick={closeForm} className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-all text-slate-400 hover:text-slate-800 dark:hover:text-white">
                  <X size={20} />
                </button>
              </div>

              {error && (
                <div className="bg-red-500/10 text-red-500 p-4 rounded-xl flex items-center gap-3 text-xs font-bold border border-red-500/20">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Glossary Keyword</label>
                  <input
                    type="text"
                    value={term}
                    onChange={(e) => setTerm(e.target.value)}
                    placeholder="e.g. Deccan"
                    className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl py-4 px-5 outline-none focus:border-primary/50 text-slate-900 dark:text-white font-bold"
                  />
                  {selectedTerm && (
                    <p className="text-[9px] text-slate-500 font-medium px-1">
                      Note: Changing the keyword will update all existing article highlights.
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-405">Definition Content</label>
                  <textarea
                    value={definition}
                    onChange={(e) => setDefinition(e.target.value)}
                    placeholder="Provide a clear, brief historical or technical definition..."
                    rows={4}
                    className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl py-4 px-5 outline-none focus:border-primary/50 text-slate-900 dark:text-white font-medium leading-relaxed resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-405">Category Tag</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl py-4 px-5 outline-none focus:border-primary/50 text-slate-900 dark:text-white font-bold"
                  >
                    <option value="history">History</option>
                    <option value="technology">Technology</option>
                    <option value="cybersecurity">Cyber Security</option>
                    <option value="military">Military</option>
                    <option value="politics">Politics</option>
                    <option value="android">Android</option>
                    <option value="networking">Networking</option>
                    <option value="programming">Programming</option>
                    <option value="general">General</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={saveMutation.isPending}
                  className="w-full bg-primary text-primary-foreground py-4 rounded-2xl font-black text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-50 shadow-xl"
                >
                  <Save size={18} /> {saveMutation.isPending ? 'Saving...' : 'Save Definition'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>,
      document.body
    )}
    </div>
  );
}
