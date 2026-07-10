import React, { useEffect, useState } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, FolderTree, Tag, MessageSquare, Settings, Plus, LogOut, ExternalLink, Image as ImageIcon } from 'lucide-react';
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
          {/* Add other admin routes here */}
        </Routes>
      </main>
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
        <div className="glass p-8 rounded-[2.5rem] h-80 flex items-center justify-center text-muted-foreground italic border-white/5">
          Analytics Chart Placeholder
        </div>
        <div className="glass p-8 rounded-[2.5rem] h-80 flex items-center justify-center text-muted-foreground italic border-white/5">
          Recent Activity Placeholder
        </div>
      </div>
    </div>
  );
}

function PostsList() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const data = await blogApi.getAllPosts();
        setPosts(data);
      } catch (error) {
        console.error('Failed to fetch posts:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

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
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [1, 2, 3].map(i => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={4} className="px-8 py-6 h-16 bg-slate-50/50 dark:bg-slate-800/50" />
                </tr>
              ))
            ) : posts.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-8 py-12 text-center text-muted-foreground italic">
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
                      post.status === 'PUBLISHED' ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"
                    )}>
                      {post.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-muted-foreground font-medium">{post.views}</td>
                  <td className="px-8 py-6 text-muted-foreground font-medium">
                    {new Date(post.createdAt).toLocaleDateString()}
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
