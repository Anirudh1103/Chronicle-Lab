import React, { useEffect, useState } from 'react';
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
  Eye,
  EyeOff,
  BarChart3,
  Quote,
  X
} from 'lucide-react';
import { EditorPage } from './EditorPage';
import { MediaLibrary } from './MediaLibrary';
import { useAuth } from '../hooks/useAuth';
import { blogApi } from '../api/blog.api';
import { cn } from '../utils/cn';

export function AdminDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();

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
    { icon: <Quote size={20} />, label: 'Quotes', path: '/admin/quotes' },
    { icon: <Settings size={20} />, label: 'Settings', path: '/admin/settings' },
  ];

  // No longer needed as we use BlogEditorPage via App.tsx routing
  // const isEditor = location.pathname.includes('/admin/new') || location.pathname.includes('/admin/edit');

  /*
  if (isEditor) {
    return (
      <main className="min-h-screen bg-background pt-24">
        <Routes>
          <Route path="/new" element={<EditorPage />} />
          <Route path="/edit/:id" element={<EditorPage />} />
        </Routes>
      </main>
    );
  }
  */

  return (
    <div className="flex min-h-screen -mx-6 -mt-24">
      {/* Sidebar */}
      <aside className="w-72 border-r bg-card pt-28 px-6 flex flex-col justify-between pb-10">
        <div className="space-y-8">
          <div className="space-y-4">
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

          <nav className="space-y-1">
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

        <div className="space-y-2">
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
      <main className="flex-1 pt-28 px-12 overflow-y-auto bg-muted/20">
        <Routes>
          <Route path="/" element={<Overview />} />
          <Route path="/posts" element={<PostsList />} />
          <Route path="/media" element={<MediaLibrary />} />
          <Route path="/categories" element={<CategoriesManager />} />
          <Route path="/tags" element={<PlaceholderSection title="Tags Manager" />} />
          <Route path="/comments" element={<PlaceholderSection title="Comments Manager" />} />
          <Route path="/quotes" element={<QuotesPage />} />
          <Route path="/settings" element={<SettingsPage />} />
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
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-black">Categories</h1>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2"
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
  const [newQuote, setNewQuote] = useState({ text: '', author: '', category: 'History' });

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

  const handleAdd = async () => {
    if (!newQuote.text || !newQuote.author) return;
    try {
      const q = await blogApi.addQuote(newQuote);
      setQuotes([q, ...quotes]);
      setNewQuote({ text: '', author: '', category: 'History' });
      setIsAdding(false);
    } catch (err) {
      alert('Failed to add quote.');
    }
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
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h1 className="text-4xl font-black">Quotes Library</h1>
          <p className="text-muted-foreground font-medium">Manage historical and inspirational thoughts.</p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="bg-primary text-primary-foreground px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
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
                    <option>Security</option>
                  </select>
               </div>
            </div>

            <button
              onClick={handleAdd}
              className="w-full bg-primary text-primary-foreground py-5 rounded-[1.5rem] font-black uppercase text-xs tracking-[0.3em] hover:opacity-90 shadow-xl shadow-primary/10 transition-all"
            >
              Broadcast to Chronicle Lab
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
                <button
                  onClick={() => handleDelete(q.id)}
                  className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              <p className="text-xl font-bold tracking-tight leading-relaxed italic text-slate-800 dark:text-slate-100">
                "{q.text}"
              </p>

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

function SettingsPage() {
  const [config, setConfig] = useState<Record<string, string>>({
    footer_text: '',
    contact_email: '',
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await blogApi.getConfig();
        setConfig(prev => ({ ...prev, ...data }));
      } catch (error) {
        console.error(error);
      }
    };
    load();
  }, []);

  const handleSaveConfig = async () => {
    setIsSaving(true);
    try {
      await blogApi.updateConfig(config);
      alert('System configuration updated.');
    } catch (error) {
      alert('Security Breach: Failed to update config.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-12 pb-20 max-w-2xl">
      <div className="space-y-1">
        <h1 className="text-4xl font-black">Laboratory Settings</h1>
        <p className="text-muted-foreground font-medium">Configure the core identity of the platform.</p>
      </div>

      <div className="space-y-8">
        <section className="space-y-6">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-primary/10 text-primary rounded-lg">
                <ExternalLink size={20} />
             </div>
             <h2 className="text-xl font-black tracking-tight">Identity & Branding</h2>
          </div>

          <div className="glass p-10 rounded-[3rem] border-white/5 space-y-8 shadow-2xl">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Footer Tagline</label>
              <textarea
                value={config.footer_text}
                onChange={e => setConfig({ ...config, footer_text: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-950/20 border border-slate-200 dark:border-white/10 rounded-[2rem] p-6 text-sm outline-none focus:ring-2 ring-primary/20 transition-all font-medium leading-relaxed"
                rows={4}
                placeholder="Where History Meets Technology..."
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Contact Signal (Email)</label>
              <input
                type="email"
                value={config.contact_email}
                onChange={e => setConfig({ ...config, contact_email: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-950/20 border border-slate-200 dark:border-white/10 rounded-2xl p-4 text-sm outline-none focus:ring-2 ring-primary/20 transition-all font-medium"
                placeholder="anirudh@chroniclelab.com"
              />
            </div>

            <button
              onClick={handleSaveConfig}
              disabled={isSaving}
              className="w-full bg-primary text-primary-foreground py-5 rounded-[1.5rem] font-black uppercase text-xs tracking-[0.3em] hover:opacity-90 shadow-xl shadow-primary/20 transition-all"
            >
              {isSaving ? 'Synchronizing System...' : 'Update Configuration'}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

function Overview() {
  const [stats, setStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await blogApi.getStats();
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

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
        <div className="glass p-8 rounded-[2.5rem] h-80 flex flex-col items-center justify-center text-muted-foreground border-white/5 space-y-4">
          <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full">
            <BarChart3 size={32} className="opacity-20" />
          </div>
          <p className="italic font-medium">Analytics engine initializing...</p>
          <p className="text-xs uppercase tracking-widest font-black opacity-40">Collect more data to reveal insights</p>
        </div>
        <div className="glass p-8 rounded-[2.5rem] h-80 flex flex-col items-center justify-center text-muted-foreground border-white/5 space-y-4">
          <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full">
            <MessageSquare size={32} className="opacity-20" />
          </div>
          <p className="italic font-medium">No recent activity detected.</p>
          <p className="text-xs uppercase tracking-widest font-black opacity-40">Your laboratory is currently silent</p>
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
              <th className="px-8 py-5 font-bold uppercase text-xs tracking-widest text-muted-foreground">Date</th>
              <th className="px-8 py-5 font-bold uppercase text-xs tracking-widest text-muted-foreground"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [1, 2, 3].map(i => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={5} className="px-8 py-6 h-16 bg-slate-50/50 dark:bg-slate-800/50" />
                </tr>
              ))
            ) : posts.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-8 py-12 text-center text-muted-foreground italic">
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
