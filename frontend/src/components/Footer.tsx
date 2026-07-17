import React, { useState } from 'react';
import { Github, Linkedin, Mail, Instagram } from 'lucide-react';
import { Link } from 'react-router-dom';
import { LegalModal, LegalContentType } from './LegalModal';
import { blogApi } from '../api/blog.api';
import { cn } from '../utils/cn';

export function Footer() {
  const [legalType, setLegalType] = useState<LegalContentType>(null);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'info' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;

    setLoading(true);
    setStatus('idle');
    setMessage('');

    // Simulate submission delay for a professional feel
    setTimeout(() => {
      setStatus('info');
      setMessage("Thank you! The Chronicle Lab newsletter system is currently under construction. We will register your email address and start broadcasting our briefings soon.");
      setEmail('');
      setLoading(false);
    }, 800);
  };

  return (
    <footer className="relative z-10 border-t py-20 px-6 bg-white dark:bg-slate-950">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 text-slate-900 dark:text-slate-100">
        <div className="space-y-6">
          <Link to="/" className="text-2xl font-black tracking-tighter">
            CHRONICLE<span className="text-primary/50">.LAB</span>
          </Link>
          <p className="text-muted-foreground leading-relaxed">
            Where History Meets Technology. A premium sanctuary for deep-dive explorations into modern engineering and historical narratives.
          </p>
          <div className="flex gap-4">
            <a href="https://www.linkedin.com/in/anirudh-c-m-01931624a/" target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-muted rounded-full transition-colors"><Linkedin size={20} /></a>
            <a href="https://www.instagram.com/anirudh_c_m/" target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-muted rounded-full transition-colors"><Instagram size={20} /></a>
            <a href="https://github.com/Anirudh1103" target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-muted rounded-full transition-colors"><Github size={20} /></a>
          </div>
        </div>

        <div>
          <h4 className="font-bold mb-6">Explore</h4>
          <ul className="space-y-4 text-muted-foreground font-medium">
            <li><Link to="/library?category=history" className="hover:text-primary transition-colors">History</Link></li>
            <li><Link to="/library?category=technology" className="hover:text-primary transition-colors">Technology</Link></li>
            <li><Link to="/library?category=cybersecurity" className="hover:text-primary transition-colors">CyberSecurity</Link></li>
            <li><Link to="/library" className="hover:text-primary transition-colors">Latest stories</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold mb-6">Contact</h4>
          <ul className="space-y-4 text-muted-foreground font-medium">
            <li className="flex items-center gap-2 italic">
              <Mail size={16} className="text-primary" />
              cmanirudh03@gmail.com
            </li>
            <li className="text-xs leading-relaxed mt-4 opacity-70">
              Exploring the intersection of History and Code.
            </li>
          </ul>
        </div>

        <div className="space-y-6">
          <h4 className="font-bold">Subscribe to our newsletter</h4>
          <p className="text-sm text-muted-foreground">Get the latest insights delivered straight to your inbox.</p>

          <form onSubmit={handleSubscribe} className="flex gap-2">
            <input
              type="email"
              required
              disabled={loading}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              className="bg-background border px-4 py-2 rounded-xl flex-1 focus:ring-2 ring-primary/20 outline-none transition-all disabled:opacity-50"
              aria-label="Email address for newsletter"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-primary text-white px-5 py-2 rounded-xl font-bold hover:opacity-90 transition-opacity flex items-center justify-center min-w-[70px] disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Join'
              )}
            </button>
          </form>

          {status !== 'idle' && (
            <div
              className={cn(
                "p-4 rounded-xl text-xs font-bold border leading-relaxed",
                status === 'success' && "bg-emerald-500/10 border-emerald-500/20 text-emerald-500",
                status === 'info' && "bg-blue-500/10 border-blue-500/20 text-blue-500 dark:text-blue-400",
                status === 'error' && "bg-red-500/10 border-red-500/20 text-red-500"
              )}
            >
              {message}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-20 pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500 dark:text-slate-400 font-bold">
        <p>© {new Date().getFullYear()} CHRONICLE LAB. All rights reserved.</p>
        <div className="flex gap-8">
          <button onClick={() => setLegalType('privacy')} className="hover:text-primary transition-colors">Privacy Policy</button>
          <button onClick={() => setLegalType('terms')} className="hover:text-primary transition-colors">Terms of Service</button>
          <button onClick={() => setLegalType('cookies')} className="hover:text-primary transition-colors">Cookies</button>
        </div>
      </div>

      <LegalModal type={legalType} onClose={() => setLegalType(null)} />
    </footer>
  );
}
