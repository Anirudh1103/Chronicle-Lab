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
  KeyRound,
  Gauge,
  MoreHorizontal,
  Search,
  ChevronRight,
  User,
  PanelLeftClose,
  PanelLeftOpen,
  Globe,
  Settings2
} from 'lucide-react';
import { EditorPage } from './EditorPage';
import { MediaLibrary } from './MediaLibrary';
import { useAuth } from '../hooks/useAuth';
import { usePerformanceStore } from '../store/performanceStore';
import { blogApi } from '../api/blog.api';
import { cn } from '../utils/cn';
import { GlossaryManager } from './GlossaryManager';
import api from '../api/client';
import { AnalyticsDashboard } from './AnalyticsDashboard';
import { FeedbackManager } from './FeedbackManager';
import { CommentsManager } from './CommentsManager';
import SecurityCenter from './security/SecurityCenter';

import { getUploadUrl } from '../utils/url';

export function AdminDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { isDeveloperMode, setDeveloperMode } = usePerformanceStore();
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('admin_sidebar_collapsed') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('admin_sidebar_collapsed', String(isCollapsed));
  }, [isCollapsed]);

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
    { icon: <Settings2 size={20} />, label: 'Security Center', path: '/admin/settings' },
  ];

  return (
    <div className="flex flex-col lg:flex-row w-full lg:h-full lg:overflow-hidden relative -mx-6 lg:mx-0 -mt-24 lg:mt-0">
      {/* Mobile Navigation Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-slate-950/90 border-b border-white/5 z-[990] px-4 flex items-center justify-between backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Link to="/admin" className="font-black text-sm tracking-tight text-white flex items-center gap-1.5">
            <span className="text-primary font-black">CHRONICLE</span>
            <span className="text-xs text-cyan-400 font-mono">LAB</span>
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/admin/more"
            className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-black text-xs shadow"
          >
            {user?.name?.[0].toUpperCase() || 'A'}
          </Link>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isCollapsed ? 80 : 288 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="hidden lg:flex border-r bg-card flex-col flex-shrink-0 h-full overflow-hidden relative"
      >
        {/* Sidebar Header */}
        <div className="p-6 space-y-6 flex-shrink-0">
          <div className="flex items-center justify-between h-10 overflow-hidden">
            <AnimatePresence mode="wait">
              {!isCollapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="flex items-center gap-3 min-w-0"
                >
                  <div className="w-10 h-10 rounded-full bg-primary flex-shrink-0 flex items-center justify-center text-primary-foreground font-black shadow-lg shadow-primary/20">
                    {user?.name?.[0].toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-black tracking-tight truncate">{user?.name}</p>
                    <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">{user?.role}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {isCollapsed && (
               <div className="w-10 h-10 rounded-full bg-primary flex-shrink-0 flex items-center justify-center text-primary-foreground font-black mx-auto shadow-lg shadow-primary/20">
                 {user?.name?.[0].toUpperCase()}
               </div>
            )}
          </div>

          <Link
            to="/admin/editor"
            title={isCollapsed ? "New Post" : undefined}
            className={cn(
              "flex items-center justify-center gap-2 w-full bg-primary text-primary-foreground font-black hover:opacity-90 transition-all shadow-lg shadow-primary/20 overflow-hidden",
              isCollapsed ? "h-12 rounded-xl" : "py-4 rounded-[1.25rem]"
            )}
          >
            <Plus size={20} className="shrink-0" />
            {!isCollapsed && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }}>New Post</motion.span>}
          </Link>
        </div>

        {/* Navigation List (Scrollable) */}
        <nav className="flex-1 overflow-y-auto px-4 space-y-1 no-scrollbar scroll-smooth">
          {sidebarLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                title={isCollapsed ? link.label : undefined}
                className={cn(
                  "flex items-center gap-3 px-4 py-3.5 rounded-xl font-bold transition-all group relative overflow-hidden",
                  isActive
                    ? "bg-primary/5 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <div className={cn("flex-shrink-0 transition-transform", isCollapsed && "mx-auto")}>
                  {link.icon}
                </div>
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="truncate"
                  >
                    {link.label}
                  </motion.span>
                )}
                {isActive && (
                  <motion.div
                    layoutId="active-indicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Pinned Bottom Section */}
        <div className="p-4 space-y-2 flex-shrink-0 border-t border-white/5 bg-card/50 backdrop-blur-sm">
          {/* Collapse Toggle */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl font-bold text-muted-foreground hover:bg-muted hover:text-foreground transition-all group"
          >
            <div className={cn("shrink-0", isCollapsed && "mx-auto")}>
              {isCollapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
            </div>
            {!isCollapsed && <span className="text-sm">Collapse Sidebar</span>}
          </button>

          {/* Developer Mode */}
          <div
            className={cn(
              "flex items-center justify-between px-3 py-2.5 bg-muted/20 rounded-xl border border-white/5 overflow-hidden",
              isCollapsed && "justify-center px-0"
            )}
            title={isCollapsed ? "Toggle Developer Mode" : undefined}
          >
            <div className={cn("flex items-center gap-2.5", isCollapsed && "justify-center")}>
              <Gauge size={18} className={cn("shrink-0", isDeveloperMode ? 'text-primary' : 'text-muted-foreground')} />
              {!isCollapsed && (
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] font-black leading-none truncate uppercase tracking-widest">Dev Mode</span>
                  <span className="text-[8px] text-muted-foreground mt-1 font-black uppercase tracking-tighter">Performance HUD</span>
                </div>
              )}
            </div>
            {!isCollapsed && (
              <button
                type="button"
                onClick={() => setDeveloperMode(!isDeveloperMode)}
                className={cn(
                  "relative inline-flex h-4 w-7 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                  isDeveloperMode ? 'bg-primary' : 'bg-muted-foreground/30'
                )}
              >
                <span
                  className={cn(
                    "pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out",
                    isDeveloperMode ? 'translate-x-3' : 'translate-x-0'
                  )}
                />
              </button>
            )}
            {isCollapsed && (
              <button
                onClick={() => setDeveloperMode(!isDeveloperMode)}
                className="absolute inset-0 z-10 opacity-0"
              />
            )}
          </div>

          <Link
            to="/"
            title={isCollapsed ? "View Website" : undefined}
            className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
          >
            <div className={cn("shrink-0", isCollapsed && "mx-auto")}>
              <Globe size={20} />
            </div>
            {!isCollapsed && <span className="text-sm">View Website</span>}
          </Link>

          <button
            onClick={handleLogout}
            title={isCollapsed ? "Sign Out" : undefined}
            className={cn(
              "flex items-center gap-3 w-full px-4 py-3 rounded-xl font-bold transition-all group",
              "text-destructive hover:bg-destructive/10"
            )}
          >
            <div className={cn("shrink-0 text-destructive group-hover:scale-110 transition-transform", isCollapsed && "mx-auto")}>
              <LogOut size={20} />
            </div>
            {!isCollapsed && <span className="text-sm">Sign Out</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-muted/20 w-full h-full scrollbar-none relative">
        <div className="pt-20 lg:pt-10 pb-28 lg:pb-20 px-4 md:px-12 max-w-[1600px] mx-auto">
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
            <Route path="/more" element={<MobileMorePage />} />
          </Routes>
        </div>
      </main>

      {/* Mobile Fixed Bottom Navigation */}
      <MobileBottomNav />
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
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'PUBLISHED' | 'DRAFT'>('ALL');
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

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title?.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeFilter === 'ALL') return matchesSearch;
    if (activeFilter === 'PUBLISHED') return matchesSearch && (post.status === 'PUBLISHED' || post.status === 'published');
    if (activeFilter === 'DRAFT') return matchesSearch && (post.status === 'DRAFT' || post.status === 'draft');
    return matchesSearch;
  });

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl md:text-4xl font-black">Posts</h1>
      </div>

      {/* Mobile Search & Filters (Shown on Mobile & Tablet) */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search posts..."
            className="w-full bg-slate-900/60 border border-white/10 rounded-2xl pl-11 pr-4 py-3 text-sm outline-none focus:ring-2 ring-primary/30 transition-all font-medium text-white placeholder:text-muted-foreground"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => setActiveFilter('ALL')}
            className={cn(
              "px-4 py-1.5 rounded-full text-xs font-black transition-all whitespace-nowrap",
              activeFilter === 'ALL'
                ? "bg-primary text-primary-foreground shadow"
                : "bg-slate-900/60 border border-white/10 text-muted-foreground hover:text-white"
            )}
          >
            All ({posts.length})
          </button>
          <button
            onClick={() => setActiveFilter('PUBLISHED')}
            className={cn(
              "px-4 py-1.5 rounded-full text-xs font-black transition-all whitespace-nowrap",
              activeFilter === 'PUBLISHED'
                ? "bg-primary text-primary-foreground shadow"
                : "bg-slate-900/60 border border-white/10 text-muted-foreground hover:text-white"
            )}
          >
            Published ({posts.filter(p => p.status === 'PUBLISHED' || p.status === 'published').length})
          </button>
          <button
            onClick={() => setActiveFilter('DRAFT')}
            className={cn(
              "px-4 py-1.5 rounded-full text-xs font-black transition-all whitespace-nowrap",
              activeFilter === 'DRAFT'
                ? "bg-primary text-primary-foreground shadow"
                : "bg-slate-900/60 border border-white/10 text-muted-foreground hover:text-white"
            )}
          >
            Draft ({posts.filter(p => p.status === 'DRAFT' || p.status === 'draft').length})
          </button>
        </div>
      </div>

      {/* Mobile Compact Cards List (Shown on Mobile) */}
      <div className="md:hidden space-y-3">
        {loading ? (
          [1, 2, 3].map(i => (
            <div key={i} className="glass h-24 rounded-2xl animate-pulse" />
          ))
        ) : filteredPosts.length === 0 ? (
          <div className="glass p-12 rounded-3xl text-center text-muted-foreground italic text-xs border-white/5">
            No posts found matching filter.
          </div>
        ) : (
          filteredPosts.map((post) => (
            <div
              key={post.id}
              onClick={() => navigate(`/admin/editor/${post.id}`)}
              className="glass p-3.5 rounded-2xl border-white/5 flex items-center justify-between gap-3 cursor-pointer hover:border-primary/30 transition-all active:scale-[0.99]"
            >
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={getUploadUrl(post.coverImage)}
                  alt={post.title}
                  className="w-14 h-14 rounded-xl object-cover border border-white/10 bg-slate-900 shrink-0"
                  onError={(e: any) => { e.target.src = 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=200&auto=format&fit=crop&q=60'; }}
                />
                <div className="min-w-0 space-y-1">
                  <h3 className="font-bold text-sm text-white truncate leading-snug">{post.title}</h3>
                  <div className="flex items-center gap-2 flex-wrap text-[10px] text-muted-foreground font-medium">
                    <span className={cn(
                      "px-2 py-0.5 rounded-md font-black uppercase text-[8.5px] tracking-wider",
                      (post.status === 'PUBLISHED' || post.status === 'published')
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-slate-500/20 text-slate-400"
                    )}>
                      {post.status}
                    </span>
                    <span>•</span>
                    <span>{new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                    <span>•</span>
                    <span>{post.views || 0} views</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={(e) => handleToggleVisibility(e, post.id)}
                  className="p-2 text-slate-400 hover:text-white rounded-lg transition-colors"
                >
                  {post.status === 'HIDDEN' ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                <button
                  onClick={(e) => handleDelete(e, post.id)}
                  className="p-2 text-slate-400 hover:text-red-400 rounded-lg transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Table View (Hidden on Mobile) */}
      <div className="hidden md:block glass rounded-[2.5rem] overflow-hidden border-white/5">
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
            ) : filteredPosts.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-8 py-12 text-center text-muted-foreground italic">
                  No posts found matching filter.
                </td>
              </tr>
            ) : (
              filteredPosts.map((post) => (
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

function MobileBottomNav() {
  const location = useLocation();

  const navItems = [
    { label: 'Dashboard', icon: <LayoutDashboard size={18} />, path: '/admin' },
    { label: 'Posts', icon: <FileText size={18} />, path: '/admin/posts' },
    { label: 'FAB', isFab: true, path: '/admin/editor' },
    { label: 'Media', icon: <ImageIcon size={18} />, path: '/admin/media' },
    { label: 'More', icon: <MoreHorizontal size={18} />, path: '/admin/more' },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[999] bg-slate-950/95 border-t border-white/10 backdrop-blur-xl px-2 py-2 flex items-center justify-around select-none shadow-2xl">
      {navItems.map((item) => {
        if (item.isFab) {
          return (
            <Link
              key="fab"
              to="/admin/editor"
              className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/40 -translate-y-4 border-4 border-slate-950 font-black hover:scale-105 active:scale-95 transition-all"
              title="Create New Post"
            >
              <Plus size={24} />
            </Link>
          );
        }

        const isActive = location.pathname === item.path || (item.path === '/admin' && (location.pathname === '/admin/' || location.pathname === '/admin'));

        return (
          <Link
            key={item.path}
            to={item.path!}
            className={cn(
              "flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all text-[10px] font-bold",
              isActive ? "text-primary font-black scale-105" : "text-muted-foreground hover:text-white"
            )}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}

function MobileMorePage() {
  const { user, logout } = useAuth();
  const { isDeveloperMode, setDeveloperMode } = usePerformanceStore();

  const manageLinks = [
    { icon: <FolderTree size={18} />, label: 'Categories', path: '/admin/categories' },
    { icon: <ImageIcon size={18} />, label: 'Media Library', path: '/admin/media' },
    { icon: <MessageSquare size={18} />, label: 'Comments', path: '/admin/comments' },
    { icon: <MessageSquare size={18} />, label: 'Feedback', path: '/admin/feedback' },
    { icon: <Quote size={18} />, label: 'Quotes', path: '/admin/quotes' },
    { icon: <BookOpen size={18} />, label: 'Glossary', path: '/admin/glossary' },
    { icon: <BarChart3 size={18} />, label: 'Analytics', path: '/admin/analytics' },
  ];

  return (
    <div className="space-y-6 pb-20 lg:hidden">
      {/* Header Profile Card */}
      <div className="glass p-5 rounded-3xl border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-black text-lg shadow-lg shadow-primary/20">
            {user?.name?.[0].toUpperCase() || 'A'}
          </div>
          <div>
            <h2 className="text-base font-black">{user?.name || 'Admin'}</h2>
            <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-primary/10 text-primary">
              {user?.role || 'ADMIN'}
            </span>
          </div>
        </div>
      </div>

      {/* MANAGE Section */}
      <div className="space-y-2">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-2">Manage</h3>
        <div className="glass rounded-3xl border-white/5 overflow-hidden divide-y divide-white/5">
          {manageLinks.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="flex items-center justify-between px-5 py-4 text-sm font-bold hover:bg-muted/30 transition-all text-slate-200"
            >
              <div className="flex items-center gap-3">
                <span className="text-primary">{item.icon}</span>
                <span>{item.label}</span>
              </div>
              <ChevronRight size={18} className="text-muted-foreground opacity-60" />
            </Link>
          ))}
        </div>
      </div>

      {/* SETTINGS Section */}
      <div className="space-y-2">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-2">Settings</h3>
        <div className="glass rounded-3xl border-white/5 overflow-hidden divide-y divide-white/5">
          <Link
            to="/admin/settings"
            className="flex items-center justify-between px-5 py-4 text-sm font-bold hover:bg-muted/30 transition-all text-slate-200"
          >
            <div className="flex items-center gap-3">
              <span className="text-primary"><Settings size={18} /></span>
              <span>Security Center</span>
            </div>
            <ChevronRight size={18} className="text-muted-foreground opacity-60" />
          </Link>

          <div className="flex items-center justify-between px-5 py-4 text-sm font-bold text-slate-200">
            <div className="flex items-center gap-3">
              <span className="text-primary"><Gauge size={18} /></span>
              <div>
                <p className="leading-none">Developer Mode</p>
                <p className="text-[9px] text-muted-foreground mt-1">Perf Diagnostics</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setDeveloperMode(!isDeveloperMode)}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                isDeveloperMode ? 'bg-primary' : 'bg-muted-foreground/30'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  isDeveloperMode ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <Link
            to="/"
            className="flex items-center justify-between px-5 py-4 text-sm font-bold hover:bg-muted/30 transition-all text-slate-200"
          >
            <div className="flex items-center gap-3">
              <span className="text-slate-400"><ExternalLink size={18} /></span>
              <span>View Website</span>
            </div>
            <ChevronRight size={18} className="text-muted-foreground opacity-60" />
          </Link>

          <button
            onClick={() => logout()}
            className="flex items-center justify-between w-full px-5 py-4 text-sm font-bold text-destructive hover:bg-destructive/10 transition-all"
          >
            <div className="flex items-center gap-3">
              <LogOut size={18} />
              <span>Sign Out</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
