import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  FileText,
  FolderTree,
  Tag,
  MessageSquare,
  Settings,
  Plus,
  LogOut,
  ExternalLink,
  Image as ImageIcon,
  Trash2,
  Edit3,
  Eye,
  EyeOff,
  BarChart3,
  Quote,
  X,
  BookOpen,
  ShieldCheck,
  AlertCircle,
  TrendingUp,
  ThumbsUp,
  ThumbsDown,
  Share2,
  Menu,
  KeyRound
} from 'lucide-react';
import { EditorPage } from './EditorPage';
import { MediaLibrary } from './MediaLibrary';
import { useAuth } from '../hooks/useAuth';
import { blogApi } from '../api/blog.api';
import { cn } from '../utils/cn';
import { GlossaryManager } from './GlossaryManager';
import api from '../api/client';
import { AnalyticsDashboard } from './AnalyticsDashboard';
import { FeedbackManager } from './FeedbackManager';
import { CommentsManager } from './CommentsManager';
import SecurityCenter from './security/SecurityCenter';

export function AdminDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const sidebarLinks = [
    { icon: <LayoutDashboard size={20} />, label: 'Overview', path: '/admin' },
    { icon: <FileText size={20} />, label: 'All Posts', path: '/admin/posts' },
    { icon: <ImageIcon size={20} />, label: 'Media Library', path: '/admin/media' },
    { icon: <FolderTree size={20} />, label: 'Categories', path: '/admin/categories' },
    { icon: <Tag size={20} />, label: 'Tags', path: '/admin/tags' },
    { icon: <MessageSquare size={20} />, label: 'Comments', path: '/admin/comments' },
    { icon: <MessageSquare size={20} />, label: 'Feedback', path: '/admin/feedback' },
    { icon: <Quote size={20} />, label: 'Quotes', path: '/admin/quotes' },
    { icon: <BookOpen size={20} />, label: 'Glossary', path: '/admin/glossary' },
    { icon: <BarChart3 size={20} />, label: 'Analytics', path: '/admin/analytics' },
    { icon: <Settings size={20} />, label: 'Security Center', path: '/admin/settings' },
  ];

  return (
    <div className="flex flex-col lg:flex-row min-h-screen -mx-6 -mt-24 w-full">
      {/* Mobile Navigation Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-20 bg-card border-b z-[999] px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="p-2 -ml-2 text-slate-500 hover:text-slate-800 dark:hover:text-white rounded-lg hover:bg-muted transition-all"
          >
            <Menu size={24} />
          </button>
          <span className="font-black text-sm tracking-tight uppercase">Admin Panel</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-black text-xs">
            {user?.name?.[0].toUpperCase()}
          </div>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            key="mobile-sidebar-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden fixed inset-0 bg-black z-[1000] cursor-pointer"
          />
        )}
        
        {isMobileOpen && (
          <motion.aside
            key="mobile-sidebar-aside"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="lg:hidden fixed top-0 bottom-0 left-0 w-72 bg-card border-r z-[1001] px-6 flex flex-col justify-between pb-10 pt-6"
          >
            <div className="space-y-8">
              <div className="flex items-center justify-between border-b pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-black text-xs">
                    {user?.name?.[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs font-black tracking-tight">{user?.name}</p>
                    <p className="text-[10px] text-muted-foreground">{user?.role}</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsMobileOpen(false)}
                  className="p-1.5 hover:bg-muted rounded-lg transition-all text-slate-400"
                >
                  <X size={18} />
                </button>
              </div>

              <Link
                to="/admin/editor"
                onClick={() => setIsMobileOpen(false)}
                className="flex items-center justify-center gap-2 w-full bg-primary text-primary-foreground py-3.5 rounded-xl font-black hover:opacity-90 transition-all text-xs shadow-lg shadow-primary/20"
              >
                <Plus size={16} /> New Post
              </Link>

              <nav className="space-y-1 overflow-y-auto max-h-[60vh]">
                {sidebarLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all text-sm ${
                      location.pathname === link.path
                        ? 'bg-primary/5 text-primary shadow-sm'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    {link.icon}
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="space-y-2 border-t pt-4">
              <Link to="/" onClick={() => setIsMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-all">
                <ExternalLink size={18} /> View Website
              </Link>
              <button
                onClick={() => { setIsMobileOpen(false); handleLogout(); }}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-xl font-bold text-sm text-destructive hover:bg-destructive/5 transition-all"
              >
                <LogOut size={18} /> Sign Out
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-72 border-r bg-card pt-28 px-6 flex-col justify-between pb-10 flex-shrink-0 h-screen sticky top-0">
        <div className="flex flex-col flex-1 min-h-0 space-y-8">
          <div className="space-y-4 flex-shrink-0">
            <div className="px-2 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-black">
                {user?.name?.[0].toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-black tracking-tight">{user?.name}</p>
                <p className="text-xs text-muted-foreground">{user?.role}</p>
              </div>
            </div>

            <Link
              to="/admin/editor"
              className="flex items-center justify-center gap-2 w-full bg-primary text-primary-foreground py-4 rounded-[1.25rem] font-black hover:opacity-90 transition-all shadow-lg shadow-primary/20"
            >
              <Plus size={20} /> New Post
            </Link>
          </div>

          <nav className="space-y-1 flex-1 overflow-y-auto min-h-0 pr-1 no-scrollbar">
            {sidebarLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-bold transition-all ${
                  location.pathname === link.path
                    ? 'bg-primary/5 text-primary shadow-sm'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="space-y-2 flex-shrink-0 pt-4 border-t border-white/5">
          <Link to="/" className="flex items-center gap-3 px-4 py-3.5 rounded-xl font-bold text-muted-foreground hover:bg-muted hover:text-foreground transition-all">
            <ExternalLink size={20} /> View Website
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3.5 rounded-xl font-bold text-destructive hover:bg-destructive/5 transition-all"
          >
            <LogOut size={20} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 pt-24 lg:pt-28 px-4 md:px-12 overflow-y-auto bg-muted/20 w-full min-h-screen">
        <Routes>
          <Route path="/" element={<Overview />} />
          <Route path="/posts" element={<PostsList />} />
          <Route path="/media" element={<MediaLibrary />} />
          <Route path="/categories" element={<CategoriesManager />} />
          <Route path="/tags" element={<PlaceholderSection title="Tags Manager" />} />
          <Route path="/comments" element={<CommentsManager />} />
          <Route path="/feedback" element={<FeedbackManager />} />
          <Route path="/quotes" element={<QuotesPage />} />
          <Route path="/glossary" element={<GlossaryManager />} />
          <Route path="/analytics" element={<AnalyticsDashboard />} />
          <Route path="/settings" element={<SecurityCenter />} />
        </Routes>
      </main>
    </div>
  );
}

function PlaceholderSection({ title }: { title: string }) {
  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-black">{title}</h1>
      <div className="glass p-20 rounded-[3rem] text-center border-white/5 space-y-4">
        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto opacity-20">
          <Settings size={32} />
        </div>
        <p className="italic font-medium text-muted-foreground">This module is currently being optimized for high-security environments.</p>
        <p className="text-[10px] uppercase font-black tracking-widest opacity-40">Coming Soon to Chronicle Lab V1.1</p>
      </div>
    </div>
  );
}

function CategoriesManager() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newCat, setNewCat] = useState({ name: '', slug: '' });

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await blogApi.getCategories();
      setCategories(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAdd = async () => {
    if (!newCat.name || !newCat.slug) return;
    try {
      const cat = await blogApi.createCategory(newCat);
      setCategories([...categories, cat]);
      setNewCat({ name: '', slug: '' });
      setIsAdding(false);
    } catch (err) {
      alert('Failed to create category.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    try {
      await blogApi.deleteCategory(id);
      setCategories(categories.filter(c => c.id !== id));
    } catch (err) {
      alert('Failed to delete category.');
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-4xl font-black">Categories</h1>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 w-full sm:w-auto justify-center"
        >
          {isAdding ? <X size={16} /> : <Plus size={16} />} {isAdding ? 'Cancel' : 'Add New'}
        </button>
      </div>

      {isAdding && (
        <div className="glass p-8 rounded-[2.5rem] border-white/5 grid grid-cols-1 md:grid-cols-[1fr_1fr_200px] gap-4 items-end animate-in fade-in slide-in-from-top-4">
           <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Category Name</label>
              <input
                value={newCat.name}
                onChange={e => setNewCat({...newCat, name: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-')})}
                className="w-full bg-muted/20 border border-white/5 rounded-2xl p-4 text-sm outline-none focus:ring-2 ring-primary/20 transition-all font-medium"
                placeholder="e.g. Android Security"
              />
           </div>
           <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">URL Slug</label>
              <input
                value={newCat.slug}
                onChange={e => setNewCat({...newCat, slug: e.target.value})}
                className="w-full bg-muted/20 border border-white/5 rounded-2xl p-4 text-sm outline-none focus:ring-2 ring-primary/20 transition-all font-medium"
                placeholder="android-security"
              />
           </div>
           <button
            onClick={handleAdd}
            className="bg-primary text-primary-foreground py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:opacity-90 transition-all"
           >
             Save Category
           </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          [1, 2, 3].map(i => <div key={i} className="glass h-32 animate-pulse rounded-3xl" />)
        ) : categories.length === 0 ? (
          <div className="col-span-full glass p-20 rounded-[3rem] text-center space-y-4 border-white/5 opacity-40">
            <FolderTree size={48} className="mx-auto" />
            <p className="italic font-medium text-muted-foreground">No categories defined yet.</p>
          </div>
        ) : (
          categories.map(cat => (
            <div key={cat.id} className="glass p-6 rounded-3xl space-y-2 border-white/5 group hover:border-primary/20 transition-colors relative">
              <h3 className="font-black text-xl">{cat.name}</h3>
              <p className="text-xs text-muted-foreground font-mono uppercase tracking-widest">{cat.slug}</p>
              <button
                onClick={() => handleDelete(cat.id)}
                className="absolute top-4 right-4 text-slate-400 hover:text-destructive opacity-0 group-hover:opacity-100 transition-all"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function QuotesPage() {
  const [quotes, setQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<any | null>(null);
  const [newQuote, setNewQuote] = useState({ text: '', translation: '', meaning: '', author: '', category: 'History' });
  const [error, setError] = useState<string | null>(null);

  const fetchQuotes = async () => {
    setLoading(true);
    try {
      const data = await blogApi.getQuotes();
      setQuotes(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotes();
  }, []);

  const handleSave = async () => {
    if (!newQuote.text || !newQuote.author) {
      setError('Text and author are required.');
      return;
    }
    setError(null);
    try {
      if (selectedQuote) {
        // Edit existing quote
        const updated = await blogApi.updateQuote(selectedQuote.id, newQuote);
        setQuotes(quotes.map(q => q.id === selectedQuote.id ? updated : q));
        setSelectedQuote(null);
      } else {
        // Add new quote
        const q = await blogApi.addQuote(newQuote);
        setQuotes([q, ...quotes]);
      }
      setNewQuote({ text: '', translation: '', meaning: '', author: '', category: 'History' });
      setIsAdding(false);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to save quote.';
      setError(msg);
    }
  };

  const handleEditClick = (q: any) => {
    setSelectedQuote(q);
    setNewQuote({
      text: q.text,
      translation: q.translation || '',
      meaning: q.meaning || '',
      author: q.author,
      category: q.category
    });
    setError(null);
    setIsAdding(true);
  };

  const handleCloseForm = () => {
    setIsAdding(false);
    setSelectedQuote(null);
    setNewQuote({ text: '', translation: '', meaning: '', author: '', category: 'History' });
    setError(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Permanently delete this quote?')) return;
    try {
      await blogApi.deleteQuote(id);
      setQuotes(quotes.filter(q => q.id !== id));
    } catch (err) {
      alert('Failed to delete.');
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-4xl font-black">Quotes Library</h1>
          <p className="text-muted-foreground font-medium">Manage historical and inspirational thoughts.</p>
        </div>
        <button
          onClick={() => { if (isAdding) handleCloseForm(); else setIsAdding(true); }}
          className="bg-primary text-primary-foreground px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all w-full sm:w-auto justify-center"
        >
          {isAdding ? <X size={18} /> : <Plus size={18} />} {isAdding ? 'Close Portal' : 'New Broadcast'}
        </button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass p-8 md:p-10 rounded-[3rem] border-white/5 shadow-2xl space-y-6"
          >
            {error && (
              <div className="bg-red-500/10 text-red-500 p-4 rounded-xl flex items-center gap-3 text-xs font-bold border border-red-500/20">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">The Message</label>
              <textarea
                value={newQuote.text}
                onChange={e => setNewQuote({ ...newQuote, text: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-950/20 border border-slate-200 dark:border-white/10 rounded-3xl p-6 text-lg outline-none focus:ring-2 ring-primary/20 transition-all font-medium resize-none"
                rows={3}
                placeholder="What words shall be etched into the chronicles?"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Translation (Optional)</label>
                <textarea
                  value={newQuote.translation || ''}
                  onChange={e => setNewQuote({ ...newQuote, translation: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950/20 border border-slate-200 dark:border-white/10 rounded-2xl p-4 text-sm outline-none focus:ring-2 ring-primary/20 transition-all font-medium resize-none"
                  rows={2}
                  placeholder="Translation in Roman script..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Meaning (Optional)</label>
                <textarea
                  value={newQuote.meaning || ''}
                  onChange={e => setNewQuote({ ...newQuote, meaning: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950/20 border border-slate-200 dark:border-white/10 rounded-2xl p-4 text-sm outline-none focus:ring-2 ring-primary/20 transition-all font-medium resize-none"
                  rows={2}
                  placeholder="Deeper meaning or explanation..."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Attribution (Author)</label>
                  <input
                    value={newQuote.author}
                    onChange={e => setNewQuote({ ...newQuote, author: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950/20 border border-slate-200 dark:border-white/10 rounded-2xl p-4 text-sm outline-none focus:ring-2 ring-primary/20 transition-all font-medium"
                    placeholder="e.g. Bhagat Kabir Ji"
                  />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Classification</label>
                  <select
                    value={newQuote.category}
                    onChange={e => setNewQuote({ ...newQuote, category: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950/20 border border-slate-200 dark:border-white/10 rounded-2xl p-4 text-sm outline-none font-medium"
                  >
                    <option>History</option>
                    <option>Technology</option>
                    <option>Philosophy</option>
                    <option>CyberSecurity</option>
                  </select>
               </div>
            </div>

            <button
              onClick={handleSave}
              className="w-full bg-primary text-primary-foreground py-5 rounded-[1.5rem] font-black uppercase text-xs tracking-[0.3em] hover:opacity-90 shadow-xl shadow-primary/10 transition-all"
            >
              {selectedQuote ? 'Update Broadcast' : 'Broadcast to Chronicle Lab'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {loading ? (
          [1, 2, 3, 4].map(i => <div key={i} className="glass h-48 animate-pulse rounded-[2.5rem]" />)
        ) : quotes.length === 0 ? (
          <div className="col-span-full py-40 text-center space-y-4 opacity-30">
             <Quote size={64} className="mx-auto" />
             <p className="text-xl font-black uppercase tracking-tighter">No broadcasts found in memory</p>
          </div>
        ) : (
          quotes.map((q) => (
            <motion.div
              layout
              key={q.id}
              className="glass p-8 rounded-[2.5rem] border-white/5 space-y-6 group hover:border-primary/20 transition-all"
            >
              <div className="flex justify-between items-start">
                <span className="px-3 py-1 bg-primary/10 text-primary text-[9px] font-black uppercase tracking-widest rounded-lg">
                  {q.category}
                </span>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEditClick(q)}
                    className="p-2 text-slate-350 dark:text-slate-400 hover:text-primary hover:bg-primary/10 rounded-xl transition-all"
                  >
                    <Edit3 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(q.id)}
                    className="p-2 text-slate-355 dark:text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <p className="text-xl font-bold tracking-tight leading-relaxed italic text-slate-800 dark:text-slate-100">
                "{q.text}"
              </p>

              {q.translation && (
                <div className="pl-4 border-l-2 border-primary/20 space-y-1">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-405 text-slate-400">Translation</span>
                  <p className="text-sm font-serif italic text-slate-600 dark:text-slate-350">"{q.translation}"</p>
                </div>
              )}

              {q.meaning && (
                <div className="pl-4 border-l-2 border-primary/20 space-y-1">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-405 text-slate-400">Meaning</span>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">"{q.meaning}"</p>
                </div>
              )}

              <div className="pt-4 border-t border-white/5 flex items-center gap-3">
                 <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-xs text-slate-400">
                   {q.author[0]}
                 </div>
                 <p className="text-sm font-black uppercase tracking-widest text-slate-500">— {q.author}</p>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}

function CommentItemRow({
  item,
  onToggleVisibility,
  onReply
}: {
  item: any;
  onToggleVisibility: (id: string) => Promise<void>;
  onReply: (id: string, text: string) => Promise<void>;
}) {
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState(item.adminReply || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitReply = async () => {
    if (!replyText.trim()) return;
    setIsSubmitting(true);
    try {
      await onReply(item.id, replyText);
      setIsReplying(false);
    } catch (err) {
      alert('Failed to save reply.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={cn(
      "p-4 rounded-[1.5rem] border transition-all text-xs space-y-2.5 relative group",
      item.isHidden
        ? "bg-red-500/10 border-red-500/20 opacity-70"
        : "bg-slate-50 dark:bg-white/5 border-slate-150 dark:border-white/5 hover:border-primary/30"
    )}>
      <div className="flex justify-between items-start">
        <div className="min-w-0">
          <span className="font-black text-slate-900 dark:text-white truncate block text-sm">{item.authorName}</span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {item.isHidden && (
            <span className="text-[8px] font-black text-red-500 bg-red-500/10 px-1.5 py-0.5 rounded uppercase tracking-wider">
              Hidden
            </span>
          )}
          <button
            onClick={() => onToggleVisibility(item.id)}
            className="p-1 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all"
            title={item.isHidden ? "Show Comment" : "Hide Comment"}
          >
            {item.isHidden ? <Eye size={12} /> : <EyeOff size={12} />}
          </button>
        </div>
      </div>

      <p className="text-[12px] leading-relaxed text-slate-800 dark:text-slate-200 font-medium whitespace-pre-wrap">{item.content}</p>
      
      <div className="text-[8.5px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-wider flex flex-wrap items-center gap-1.5">
        <span className="truncate max-w-[150px]">Article: {item.post?.title || 'Unknown'}</span>
        <span>•</span>
        <span>{new Date(item.createdAt).toLocaleDateString()}</span>
      </div>

      {item.adminReply && !isReplying && (
        <div className="border-l-2 border-primary/30 pl-3 py-1.5 mt-2 bg-primary/5 rounded-r-xl space-y-1">
          <p className="text-[8px] uppercase tracking-widest font-black text-primary">Admin Response</p>
          <p className="italic font-medium text-slate-700 dark:text-slate-300">"{item.adminReply}"</p>
          <button
            onClick={() => setIsReplying(true)}
            className="text-[9px] text-slate-400 hover:text-primary font-bold mt-1 inline-block"
          >
            Edit Response
          </button>
        </div>
      )}

      {!item.adminReply && !isReplying && (
        <button
          onClick={() => setIsReplying(true)}
          className="text-[9px] text-slate-400 hover:text-primary font-bold flex items-center gap-1 mt-1"
        >
          <MessageSquare size={10} /> Reply Professionally
        </button>
      )}

      {isReplying && (
        <div className="space-y-2 mt-2 pt-2 border-t border-slate-100 dark:border-white/5 animate-in fade-in duration-200">
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-white/10 rounded-xl p-2.5 text-[11px] leading-normal outline-none focus:ring-1 focus:ring-primary/20 text-slate-800 dark:text-white resize-none font-medium"
            rows={2}
            placeholder="Type absolute professional response..."
          />
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setIsReplying(false)}
              className="px-2.5 py-1 rounded bg-slate-100 dark:bg-white/5 text-slate-400 hover:text-slate-900 dark:hover:text-white text-[9px] font-black uppercase tracking-wider"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmitReply}
              disabled={isSubmitting}
              className="px-2.5 py-1 rounded bg-primary text-white hover:bg-primary/95 text-[9px] font-black uppercase tracking-wider shadow"
            >
              {isSubmitting ? 'Posting...' : 'Post Reply'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Overview() {
  const [stats, setStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [trafficData, setTrafficData] = useState<any[]>([]);
  const [trafficLoading, setTrafficLoading] = useState(true);
  const [hoveredPointIdx, setHoveredPointIdx] = useState<number | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const data = await blogApi.getStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTraffic = async () => {
    setTrafficLoading(true);
    try {
      const { data } = await api.get('analytics/overview');
      if (data && data.trafficChart) {
        setTrafficData(data.trafficChart);
      }
    } catch (error) {
      console.error('Failed to fetch traffic metrics:', error);
    } finally {
      setTrafficLoading(false);
    }
  };

  const fetchComments = async () => {
    setCommentsLoading(true);
    try {
      const data = await blogApi.getAllComments();
      setComments(data);
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    } finally {
      setCommentsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchTraffic();
    fetchComments();
  }, []);

  const handleToggleVisibility = async (id: string) => {
    try {
      const updated = await blogApi.toggleCommentVisibility(id);
      setComments(prev => prev.map(c => c.id === id ? { ...c, isHidden: updated.isHidden } : c));
    } catch (err) {
      alert('Failed to update comment visibility.');
    }
  };

  const handleReply = async (id: string, text: string) => {
    try {
      const updated = await blogApi.replyToComment(id, text);
      setComments(prev => prev.map(c => c.id === id ? { ...c, adminReply: updated.adminReply } : c));
    } catch (err) {
      alert('Failed to post reply.');
    }
  };

  return (
    <div className="space-y-12 pb-10">
      <div className="space-y-1">
        <h1 className="text-4xl font-black">Welcome back, Admin</h1>
        <p className="text-muted-foreground">Here's what's happening with your blog today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          [1, 2, 3, 4].map(i => (
            <div key={i} className="glass p-8 rounded-3xl h-32 animate-pulse bg-slate-100 dark:bg-slate-800" />
          ))
        ) : (
          stats.map((stat) => (
            <div key={stat.label} className="glass p-8 rounded-3xl space-y-4">
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">{stat.label}</p>
              <div className="flex items-end justify-between">
                <h3 className="text-4xl font-black">{stat.value}</h3>
                <span className="text-emerald-500 font-bold text-sm bg-emerald-500/10 px-2 py-1 rounded-lg">
                  {stat.change}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left card: Views traffic graph */}
        <div className="glass p-6 rounded-[2.5rem] h-[340px] flex flex-col justify-between border-white/5 space-y-4 shadow-2xl relative overflow-hidden">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-black tracking-tight text-slate-800 dark:text-slate-100">Daily Traffic</h3>
              <p className="text-[10px] text-muted-foreground mt-0.5">Reader hits tracked over the last 30 days.</p>
            </div>
            <span className="text-[9px] font-black uppercase tracking-wider text-primary flex items-center gap-1">
              <TrendingUp size={12} /> 30-Day Trend
            </span>
          </div>

          <div className="flex-1 w-full bg-slate-150/40 dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 rounded-2xl p-4 flex items-end justify-between relative overflow-visible h-48">
            {trafficLoading ? (
              <div className="m-auto flex flex-col items-center justify-center gap-2">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-[10px] font-medium text-slate-400">Loading metrics...</p>
              </div>
            ) : trafficData.length > 0 ? (
              (() => {
                const maxCount = Math.max(1, ...trafficData.map(c => c.count));
                const points = trafficData.map((d, i) => {
                  const x = (i / (trafficData.length - 1)) * 500;
                  const y = 160 - (d.count / maxCount) * 130;
                  return { x, y };
                });

                const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
                const areaPath = `${linePath} L 500 180 L 0 180 Z`;

                return (
                  <div className="w-full relative">
                    <div className="absolute -top-12 left-0 right-0 flex justify-between items-center px-1 animate-in fade-in duration-200 min-h-[28px]">
                      {hoveredPointIdx !== null ? (
                        <div className="glass px-2.5 py-1 rounded-xl border border-primary/20 flex items-center gap-1.5 shadow-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                          <span className="text-[10px] font-black text-slate-800 dark:text-slate-100">{trafficData[hoveredPointIdx].count} Views</span>
                          <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">{new Date(trafficData[hoveredPointIdx].date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                        </div>
                      ) : (
                        <div className="text-[9px] text-slate-400 dark:text-slate-500 italic font-semibold">Hover line nodes to monitor details</div>
                      )}
                    </div>

                    <svg viewBox="0 0 500 180" className="w-full h-40 overflow-visible">
                      <defs>
                        <linearGradient id="stockAreaGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="rgb(59, 130, 246)" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="rgb(59, 130, 246)" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>

                      {/* Grid lines */}
                      <line x1="0" y1="30" x2="500" y2="30" className="stroke-slate-200 dark:stroke-white/5 stroke-px stroke-dasharray-4" />
                      <line x1="0" y1="95" x2="500" y2="95" className="stroke-slate-200 dark:stroke-white/5 stroke-px stroke-dasharray-4" />
                      <line x1="0" y1="160" x2="500" y2="160" className="stroke-slate-200 dark:stroke-white/5 stroke-px stroke-dasharray-4" />

                      {/* Filled Area */}
                      <path d={areaPath} fill="url(#stockAreaGradient)" className="transition-all duration-500" />

                      {/* Sparkline Line */}
                      <path
                        d={linePath}
                        fill="none"
                        stroke="rgb(59, 130, 246)"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="transition-all duration-500 drop-shadow-[0_2px_6px_rgba(59,130,246,0.25)]"
                      />

                      {/* Active Hover Nodes */}
                      {points.map((p, idx) => (
                        <g
                          key={idx}
                          onMouseEnter={() => setHoveredPointIdx(idx)}
                          onMouseLeave={() => setHoveredPointIdx(null)}
                          className="cursor-pointer"
                        >
                          <rect
                            x={p.x - 8}
                            y={0}
                            width={16}
                            height={180}
                            fill="transparent"
                          />
                          {hoveredPointIdx === idx && (
                            <line
                              x1={p.x}
                              y1={0}
                              x2={p.x}
                              y2={180}
                              className="stroke-primary/20 stroke-px"
                            />
                          )}
                          <circle
                            cx={p.x}
                            cy={p.y}
                            r={hoveredPointIdx === idx ? 4.5 : 0}
                            className="fill-primary stroke-white dark:stroke-slate-900 stroke-2 transition-all duration-100"
                          />
                        </g>
                      ))}
                    </svg>
                  </div>
                );
              })()
            ) : (
              <div className="m-auto text-muted-foreground text-xs italic">No traffic data recorded in this scope window.</div>
            )}
          </div>
        </div>

        {/* Right card: scrollable comments feed with professional replies and toggling */}
        <div className="glass p-6 rounded-[2.5rem] h-[340px] flex flex-col justify-between border-white/5 space-y-4 shadow-2xl relative">
          <div>
            <h3 className="text-base font-black tracking-tight text-slate-800 dark:text-slate-100">Discussions Feed</h3>
            <p className="text-[10px] text-muted-foreground mt-0.5">Moderate recent activity and reply professionals.</p>
          </div>

          <div className="flex-1 w-full overflow-y-auto no-scrollbar space-y-3 pr-1">
            {commentsLoading ? (
              <div className="flex flex-col items-center justify-center h-full gap-2">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-[10px] font-medium text-slate-400">Syncing discussions...</p>
              </div>
            ) : comments.length > 0 ? (
              comments.slice(0, 5).map((item) => (
                <CommentItemRow
                  key={item.id}
                  item={item}
                  onToggleVisibility={handleToggleVisibility}
                  onReply={handleReply}
                />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-center space-y-2 opacity-40">
                <MessageSquare size={24} />
                <p className="italic text-xs font-medium">Your laboratory is currently silent</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function PostsList() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const data = await blogApi.getAllPosts();
      setPosts(data);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm('CAUTION: This will permanently purge this chronicle. Proceed?')) return;
    try {
      await blogApi.deletePost(id);
      setPosts(posts.filter(p => p.id !== id));
    } catch (err) {
      alert('Failed to delete.');
    }
  };
  const handleToggleVisibility = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      const updated = await blogApi.togglePostVisibility(id);
      setPosts(posts.map((post) => post.id === id ? { ...post, status: updated.status } : post));
    } catch (err) {
      alert('Failed to update visibility.');
    }
  };


  return (
    <div className="space-y-8 pb-10">
      <h1 className="text-4xl font-black">All Posts</h1>
      <div className="glass rounded-[2.5rem] overflow-hidden border-white/5">
        <table className="w-full text-left">
          <thead className="border-b bg-muted/50">
            <tr>
              <th className="px-8 py-5 font-bold uppercase text-xs tracking-widest text-muted-foreground">Title</th>
              <th className="px-8 py-5 font-bold uppercase text-xs tracking-widest text-muted-foreground">Status</th>
              <th className="px-8 py-5 font-bold uppercase text-xs tracking-widest text-muted-foreground">Views</th>
              <th className="px-8 py-5 font-bold uppercase text-xs tracking-widest text-muted-foreground">Likes / Dislikes</th>
              <th className="px-8 py-5 font-bold uppercase text-xs tracking-widest text-muted-foreground">Shares</th>
              <th className="px-8 py-5 font-bold uppercase text-xs tracking-widest text-muted-foreground">Date</th>
              <th className="px-8 py-5 font-bold uppercase text-xs tracking-widest text-muted-foreground"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [1, 2, 3].map(i => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={7} className="px-8 py-6 h-16 bg-slate-50/50 dark:bg-slate-800/50" />
                </tr>
              ))
            ) : posts.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-8 py-12 text-center text-muted-foreground italic">
                  No posts found. Start by creating your first chronicle!
                </td>
              </tr>
            ) : (
              posts.map((post) => (
                <tr
                  key={post.id}
                  onClick={() => navigate(`/admin/editor/${post.id}`)}
                  className="border-b last:border-0 hover:bg-muted/30 transition-colors cursor-pointer group"
                >
                  <td className="px-8 py-6 font-bold group-hover:text-primary transition-colors">
                    {post.title}
                  </td>
                  <td className="px-8 py-6">
                    <span className={cn(
                      "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest",
                      post.status === 'PUBLISHED' ? "bg-emerald-500/10 text-emerald-500" :
                      post.status === 'HIDDEN' ? "bg-slate-500/10 text-slate-500" :
                      "bg-amber-500/10 text-amber-500"
                    )}>
                      {post.status === 'HIDDEN' ? 'Hidden' : post.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-muted-foreground font-medium">{post.views}</td>
                   <td className="px-8 py-6 text-muted-foreground font-medium">
                     <span className="inline-flex items-center gap-1 text-emerald-500">
                       <ThumbsUp size={12} className="stroke-[2.5]" />
                       {post.likes}
                     </span>
                     <span className="mx-2 text-slate-300 dark:text-white/10">/</span>
                     <span className="inline-flex items-center gap-1 text-red-500">
                       <ThumbsDown size={12} className="stroke-[2.5]" />
                       {post.dislikes || 0}
                     </span>
                   </td>
                   <td className="px-8 py-6 text-muted-foreground font-medium">
                     <span className="inline-flex items-center gap-1 text-primary">
                       <Share2 size={12} />
                       {post.shares || 0}
                     </span>
                   </td>
                  <td className="px-8 py-6 text-muted-foreground font-medium">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button
                      onClick={(e) => handleToggleVisibility(e, post.id)}
                      title={post.status === 'HIDDEN' ? 'Show on website' : 'Hide from website'}
                      className="mr-2 p-2 text-slate-400 hover:text-primary transition-colors"
                    >
                      {post.status === 'HIDDEN' ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>

                    <button
                      onClick={(e) => handleDelete(e, post.id)}
                      className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
