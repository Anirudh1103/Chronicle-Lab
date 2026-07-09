import React from 'react';
import { Github, Twitter, Linkedin, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="border-t py-20 px-6 bg-muted/30">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="space-y-6">
          <Link to="/" className="text-2xl font-black tracking-tighter">
            TECH<span className="text-primary/50">.BLOG</span>
          </Link>
          <p className="text-muted-foreground leading-relaxed">
            Building the future of the web, one block at a time. A premium space for modern developers.
          </p>
          <div className="flex gap-4">
            <a href="#" className="p-2 hover:bg-muted rounded-full transition-colors"><Twitter size={20} /></a>
            <a href="#" className="p-2 hover:bg-muted rounded-full transition-colors"><Github size={20} /></a>
            <a href="#" className="p-2 hover:bg-muted rounded-full transition-colors"><Linkedin size={20} /></a>
          </div>
        </div>

        <div>
          <h4 className="font-bold mb-6">Explore</h4>
          <ul className="space-y-4 text-muted-foreground">
            <li><Link to="/" className="hover:text-primary transition-colors">Home</Link></li>
            <li><Link to="/categories" className="hover:text-primary transition-colors">Categories</Link></li>
            <li><Link to="/featured" className="hover:text-primary transition-colors">Featured</Link></li>
            <li><Link to="/newsletter" className="hover:text-primary transition-colors">Newsletter</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold mb-6">Resources</h4>
          <ul className="space-y-4 text-muted-foreground">
            <li><a href="#" className="hover:text-primary transition-colors">Documentation</a></li>
            <li><a href="#" className="hover:text-primary transition-colors">Style Guide</a></li>
            <li><a href="#" className="hover:text-primary transition-colors">UI Kit</a></li>
            <li><a href="#" className="hover:text-primary transition-colors">Components</a></li>
          </ul>
        </div>

        <div className="space-y-6">
          <h4 className="font-bold">Subscribe to our newsletter</h4>
          <p className="text-sm text-muted-foreground">Get the latest insights delivered straight to your inbox.</p>
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="Email address"
              className="bg-background border px-4 py-2 rounded-xl flex-1 focus:ring-2 ring-primary/20 outline-none transition-all"
            />
            <button className="bg-primary text-primary-foreground px-4 py-2 rounded-xl font-bold hover:opacity-90 transition-opacity">
              Join
            </button>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-20 pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
        <p>© 2024 TECH.BLOG. All rights reserved.</p>
        <div className="flex gap-8">
          <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-primary transition-colors">Cookies</a>
        </div>
      </div>
    </footer>
  );
}
