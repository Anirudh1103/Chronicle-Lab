import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Home,
  User,
  FileText,
  Moon,
  Sun,
  MessageSquare,
  Command,
  HelpCircle,
  TrendingUp,
  Tag as TagIcon,
  Compass,
  ArrowRight,
  BookOpen,
  Sparkles,
  ChevronRight,
  CornerDownLeft,
  X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { blogApi } from '../api/blog.api';
import { cn } from '../utils/cn';
import api from '../api/client';

interface CommandCenterProps {
  isOpen: boolean;
  onClose: () => void;
  toggleTheme: () => void;
  theme: 'light' | 'dark';
}

const placeholders = [
  "Search Shivaji Maharaj...",
  "Search Operation Sindoor...",
  "Search Swarajya...",
  "Search Android...",
  "Search Security...",
  "Search Deccan...",
  "Search Blogs...",
  "Search Categories...",
  "Search Author..."
];

export const CommandCenter: React.FC<CommandCenterProps> = ({ isOpen, onClose, toggleTheme, theme }) => {
  const [query, setQuery] = useState('');
  const [dataPosts, setDataPosts] = useState<any[]>([]);
  const [dataCategories, setDataCategories] = useState<any[]>([]);
  const [dataGlossary, setDataGlossary] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [viewingGlossaryItem, setViewingGlossaryItem] = useState<any | null>(null);
  const navigate = useNavigate();

  // Load local index data when search panel opens
  useEffect(() => {
    if (!isOpen) return;
    const fetchIndexData = async () => {
      setLoadingData(true);
      try {
        const [posts, categories, glossary] = await Promise.all([
          blogApi.getAllPosts('PUBLISHED').catch(() => []),
          blogApi.getCategories().catch(() => []),
          api.get('glossary').then(r => r.data).catch(() => [])
        ]);
        setDataPosts(posts);
        setDataCategories(categories);
        setDataGlossary(glossary);
      } catch (err) {
        console.error("Failed to build local search index:", err);
      } finally {
        setLoadingData(false);
      }
    };
    fetchIndexData();
    setQuery('');
    setActiveIndex(0);
  }, [isOpen]);

  // Rotate placeholders every 3 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  // Static Navigation items
  const navigationItems = useMemo(() => [
    { label: 'Home', path: '/', description: 'Go to the main laboratory portal', icon: '🏠' },
    { label: 'Library', path: '/library', description: 'Browse every Chronicle', icon: '📚' },
    { label: 'About', path: '/about', description: 'Learn about the authors and mission', icon: '🏛' },
    { label: 'Portfolio', path: 'https://portfolio.chroniclelab.com', isExternal: true, description: 'Explore external project showcase', icon: '💼' },
    { label: 'Feedback', path: '/feedback', description: 'Give your feedback and suggestions', icon: '💬' },
    { label: 'Dashboard', path: '/admin', description: 'Administrative central control room', icon: '⚙️' },
    { label: 'Write', path: '/admin/editor', description: 'Etch new chronicles into database', icon: '✍️' }
  ], []);

  // Quick actions
  const quickActions = useMemo(() => [
    { icon: <Compass size={16} />, label: 'Feeling Curious?', action: 'random' },
    { icon: theme === 'light' ? <Moon size={16} /> : <Sun size={16} />, label: `Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`, action: 'theme' },
    { icon: <MessageSquare size={16} />, label: 'Give Feedback', action: 'feedback' },
  ], [theme]);

  // Handle Action Trigger
  const handleTriggerAction = useCallback((item: any) => {
    if (item.type === 'glossary') {
      setViewingGlossaryItem(item);
      return;
    }
    if (item.action === 'random') {
      if (dataPosts.length > 0) {
        const randIdx = Math.floor(Math.random() * dataPosts.length);
        navigate(`/blog/${dataPosts[randIdx].slug}`);
        onClose();
      }
    } else if (item.action === 'theme') {
      toggleTheme();
    } else if (item.action === 'feedback') {
      navigate('/feedback');
      onClose();
    } else if (item.path) {
      if (item.isExternal) {
        window.open(item.path, '_blank');
      } else {
        navigate(item.path);
      }
      onClose();
    }
  }, [dataPosts, navigate, onClose, toggleTheme]);

  // Concept suggest mappers for empty results state
  const getConceptSuggestions = useCallback((q: string) => {
    const term = q.toLowerCase();
    if (term.includes('navy') || term.includes('sea') || term.includes('naval') || term.includes('ship')) {
      return ['Shivaji Maharaj', 'Kanhoji Angre', 'Swarajya', 'Naval Warfare'];
    }
    if (term.includes('elephant') || term.includes('animal') || term.includes('horse') || term.includes('cavalry')) {
      return ['War Animals', 'Battle Logistics', 'Medieval Warfare', 'Military Strategy', 'Historical Transport'];
    }
    if (term.includes('code') || term.includes('java') || term.includes('kotlin') || term.includes('programming') || term.includes('compil')) {
      return ['Android Engineering', 'AOSP Architecture', 'System Optimization', 'Refactoring'];
    }
    if (term.includes('hack') || term.includes('virus') || term.includes('exploit') || term.includes('penetration') || term.includes('security')) {
      return ['Cyber Security', 'Network Auditing', 'MFA Implementation', 'Reverse Engineering'];
    }
    return ['Shivaji Maharaj', 'Android Security', 'Swarajya', 'AOSP', 'Glossary'];
  }, []);

  // Search filter and intelligent scoring
  const searchResults = useMemo(() => {
    if (!query.trim()) return null;

    const startTime = performance.now();
    const q = query.toLowerCase().trim();

    const matchingNav: any[] = [];
    const matchingBlogs: any[] = [];
    const matchingSections: any[] = [];
    const matchingGlossary: any[] = [];
    const matchingCategories: any[] = [];

    // Concept tags
    const shivSynonyms = ['shiv', 'shivaji', 'maharaj', 'shivneri', 'fort', 'swarajya', 'maratha', 'chhatrapati'];
    const warSynonyms = ['war', 'campaign', 'battle', 'conflict', 'fight', 'sindoor', 'army', 'military', 'naval'];
    const empireSynonyms = ['empire', 'mughal', 'adilshahi', 'bijapur', 'aurangzeb', 'british', 'portuguese', 'kingdom'];

    const isShivSearch = shivSynonyms.some(s => q.includes(s));
    const isWarSearch = warSynonyms.some(s => q.includes(s));
    const isEmpireSearch = empireSynonyms.some(s => q.includes(s));

    // 1. Navigation search
    navigationItems.forEach(item => {
      const label = item.label.toLowerCase();
      const desc = item.description.toLowerCase();
      let score = 0;
      if (label === q) score += 100;
      else if (label.startsWith(q)) score += 80;
      else if (label.includes(q)) score += 50;
      else if (desc.includes(q)) score += 20;

      if (score > 0) {
        matchingNav.push({ ...item, type: 'navigation', score });
      }
    });

    // 2. Categories search
    dataCategories.forEach(cat => {
      const name = cat.name.toLowerCase();
      const slug = cat.slug.toLowerCase();
      let score = 0;
      if (name === q) score += 100;
      else if (name.startsWith(q)) score += 80;
      else if (name.includes(q)) score += 50;
      else if (slug.includes(q)) score += 30;

      if (q.includes('history') && name.includes('history')) score += 90;
      if (q.includes('tech') && (name.includes('technology') || name.includes('android'))) score += 90;

      if (score > 0) {
        matchingCategories.push({
          id: cat.id,
          type: 'category',
          label: cat.name,
          path: `/library?category=${cat.id}`,
          icon: '🏷️',
          score
        });
      }
    });

    // 3. Glossary search
    dataGlossary.forEach(term => {
      const word = term.term.toLowerCase();
      const def = term.definition.toLowerCase();
      const cat = term.category.toLowerCase();
      let score = 0;
      if (word === q) score += 100;
      else if (word.startsWith(q)) score += 80;
      else if (word.includes(q)) score += 50;
      else if (def.includes(q)) score += 30;
      else if (cat.includes(q)) score += 20;

      if (score > 0) {
        matchingGlossary.push({
          ...term,
          type: 'glossary',
          label: term.term,
          icon: '📖',
          score
        });
      }
    });

    // 4. Blogs & Sections search
    dataPosts.forEach(post => {
      const title = post.title.toLowerCase();
      const subtitle = (post.subtitle || '').toLowerCase();
      const excerpt = (post.excerpt || '').toLowerCase();
      const categoryName = (post.category?.name || '').toLowerCase();
      const body = (post.content || '').toLowerCase();

      let score = 0;

      if (isShivSearch && (title.includes('shivaji') || title.includes('swarajya') || body.includes('shivaji'))) {
        score += 85;
      }
      if (isWarSearch && (title.includes('sindoor') || title.includes('battle') || title.includes('campaign') || body.includes('campaign'))) {
        score += 85;
      }
      if (isEmpireSearch && (title.includes('mughal') || title.includes('adilshahi') || body.includes('empire'))) {
        score += 85;
      }

      if (title === q) score += 120;
      else if (title.startsWith(q)) score += 100;
      else if (title.includes(q)) score += 80;
      else if (subtitle.includes(q)) score += 60;
      else if (excerpt.includes(q)) score += 40;
      else if (categoryName.includes(q)) score += 30;
      else if (body.includes(q)) score += 15;

      if (score > 0) {
        matchingBlogs.push({
          ...post,
          type: 'blog',
          label: post.title,
          path: `/blog/${post.slug}`,
          icon: '🏛️',
          score
        });
      }

      // Inside sections / headers
      if (post.blocks) {
        post.blocks.forEach((block: any) => {
          if (block.type === 'heading' || block.type === 'header') {
            const hText = block.content.toLowerCase();
            let blockScore = 0;
            if (hText.includes(q)) {
              blockScore += 60;
              matchingSections.push({
                id: block.id,
                postId: post.id,
                postTitle: post.title,
                slug: post.slug,
                label: block.content,
                subLabel: `Section in: ${post.title}`,
                path: `/blog/${post.slug}#${block.id}`,
                icon: '🔖',
                score: blockScore,
                type: 'section'
              });
            }
          }
        });
      }
    });

    const sortFn = (a: any, b: any) => b.score - a.score;
    matchingNav.sort(sortFn);
    matchingBlogs.sort(sortFn);
    matchingSections.sort(sortFn);
    matchingGlossary.sort(sortFn);
    matchingCategories.sort(sortFn);

    const endTime = performance.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    return {
      navigation: matchingNav,
      blogs: matchingBlogs,
      sections: matchingSections,
      glossary: matchingGlossary,
      categories: matchingCategories,
      totalCount: matchingNav.length + matchingBlogs.length + matchingSections.length + matchingGlossary.length + matchingCategories.length,
      timeTaken: duration
    };
  }, [query, dataPosts, dataCategories, dataGlossary, navigationItems]);

  // Flattened results for continuous keyboard navigation index
  const flattenedResults = useMemo(() => {
    if (!query.trim()) {
      return [
        ...navigationItems.map(item => ({ ...item, type: 'navigation' })),
        ...quickActions.map(action => ({ ...action, type: 'action' }))
      ];
    }
    if (!searchResults) return [];
    return [
      ...(searchResults.navigation || []),
      ...(searchResults.blogs || []),
      ...(searchResults.sections || []),
      ...(searchResults.glossary || []),
      ...(searchResults.categories || [])
    ];
  }, [query, searchResults, navigationItems, quickActions]);

  // Selected item tracking
  const selectedItem = useMemo(() => {
    if (activeIndex < 0 || activeIndex >= flattenedResults.length) return null;
    return flattenedResults[activeIndex];
  }, [activeIndex, flattenedResults]);

  // Tab section jumping
  const handleTabSection = useCallback((e: KeyboardEvent) => {
    e.preventDefault();
    if (flattenedResults.length === 0) return;
    const currentType = flattenedResults[activeIndex]?.type;
    let nextIdx = activeIndex + 1;
    while (nextIdx < flattenedResults.length) {
      if (flattenedResults[nextIdx].type !== currentType) {
        setActiveIndex(nextIdx);
        return;
      }
      nextIdx++;
    }
    // wrap around
    nextIdx = 0;
    while (nextIdx < activeIndex) {
      if (flattenedResults[nextIdx].type !== currentType) {
        setActiveIndex(nextIdx);
        return;
      }
      nextIdx++;
    }
  }, [activeIndex, flattenedResults]);

  // Keyboard navigation effects
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex(prev => (prev < flattenedResults.length - 1 ? prev + 1 : prev));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex(prev => (prev > 0 ? prev - 1 : 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (selectedItem) {
          handleTriggerAction(selectedItem);
        }
      } else if (e.key === 'Tab') {
        handleTabSection(e);
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, flattenedResults, activeIndex, selectedItem, handleTriggerAction, handleTabSection, onClose]);

  // Reset active index when query changes
  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  // Groups computed for render loop
  const groups = useMemo(() => {
    if (!query.trim()) {
      return [
        { title: 'Navigation Portal', items: flattenedResults.filter(r => r.type === 'navigation') },
        { title: 'Quick Actions', items: flattenedResults.filter(r => r.type === 'action') }
      ];
    }
    if (!searchResults) return [];
    return [
      { title: 'Navigation', items: searchResults.navigation || [] },
      { title: 'Chronicles', items: searchResults.blogs || [] },
      { title: 'Sections', items: searchResults.sections || [] },
      { title: 'Glossary Terms', items: searchResults.glossary || [] },
      { title: 'Categories', items: searchResults.categories || [] }
    ].filter(g => g.items.length > 0);
  }, [query, searchResults, flattenedResults]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[10vh] px-4">
        {/* dim backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-950/75 backdrop-blur-md"
        />

        {/* search panel container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -10 }}
          transition={{ type: "spring", damping: 26, stiffness: 260 }}
          className={cn(
            "relative w-full rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden grid transition-all duration-300",
            (selectedItem?.type === 'blog' || selectedItem?.type === 'glossary') ? "max-w-4xl grid-cols-1 md:grid-cols-[1.35fr_1fr]" : "max-w-2xl grid-cols-1"
          )}
        >
          {/* Left panel: Input & List */}
          <div className="flex flex-col min-w-0 h-[65vh]">
            {/* Input bar */}
            <div className="flex items-center px-6 py-5 border-b border-slate-100 dark:border-white/5 relative">
              <Search size={20} className="text-slate-400 mr-4 flex-shrink-0" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={placeholders[placeholderIndex]}
                className="flex-1 bg-transparent border-none outline-none text-base text-slate-900 dark:text-white placeholder:text-slate-400 font-medium"
              />
              {loadingData && (
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin mr-3" />
              )}
              <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/5 rounded text-[8px] font-black text-slate-500 select-none">ESC</span>
            </div>

            {/* List area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-5 scrollbar-none">
              {groups.map((group, gIdx) => (
                <div key={gIdx} className="space-y-1.5">
                  <p className="px-3 text-[8.5px] font-black uppercase tracking-[0.25em] text-slate-500">{group.title}</p>
                  <div className="space-y-1">
                    {group.items.map((item) => {
                      const globalIdx = flattenedResults.indexOf(item);
                      const isSelected = activeIndex === globalIdx;
                      return (
                        <button
                          key={item.id || item.label}
                          onClick={() => handleTriggerAction(item)}
                          onMouseEnter={() => setActiveIndex(globalIdx)}
                          className={cn(
                            "w-full flex items-center justify-between p-3 rounded-2xl transition-all border text-left",
                            isSelected
                              ? "bg-primary/5 dark:bg-primary/10 border-primary/20 text-primary"
                              : "bg-transparent border-transparent text-slate-700 dark:text-slate-350 hover:text-slate-900 dark:hover:text-white"
                          )}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="text-lg shrink-0 select-none">
                              {item.icon || '👉'}
                            </span>
                            <div className="min-w-0">
                              <h4 className="text-xs font-bold truncate">
                                {item.label}
                              </h4>
                              {item.description && (
                                <p className={cn(
                                  "text-[10px] truncate leading-normal",
                                  isSelected ? "text-primary/70" : "text-slate-400 dark:text-slate-500"
                                )}>
                                  {item.description}
                                </p>
                              )}
                              {item.subLabel && (
                                <p className="text-[9px] text-slate-400 dark:text-slate-500 font-medium">
                                  {item.subLabel}
                                </p>
                              )}
                              {item.definition && (
                                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium line-clamp-1">
                                  "{item.definition}"
                                </p>
                              )}
                            </div>
                          </div>
                          {isSelected && (
                            <div className="flex items-center gap-1 text-[8.5px] font-black uppercase tracking-wider text-primary animate-pulse mr-1 shrink-0">
                              <span>Open</span>
                              <CornerDownLeft size={10} />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Empty State */}
              {query.trim() !== '' && flattenedResults.length === 0 && (
                <div className="py-10 px-4 text-center space-y-6 animate-in fade-in duration-300">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
                    <HelpCircle size={22} />
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      We couldn't find matches for "{query}"
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      Perhaps check spelling or explore matching concepts:
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 justify-center max-w-md mx-auto">
                    {getConceptSuggestions(query).map((sugg) => (
                      <button
                        key={sugg}
                        onClick={() => setQuery(sugg)}
                        className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/5 rounded-xl text-[10px] font-bold text-slate-600 dark:text-slate-400 hover:border-primary/20 hover:text-primary transition-all"
                      >
                        • {sugg}
                      </button>
                    ))}
                  </div>

                  <div className="border-t border-white/5 pt-6 flex flex-wrap gap-4 justify-center text-[9px] font-black uppercase tracking-wider">
                    <button onClick={() => navigate('/library')} className="text-slate-400 hover:text-primary">Explore Library</button>
                    <button onClick={() => { setQuery(''); }} className="text-slate-400 hover:text-primary">Clear Search</button>
                    <button onClick={() => { navigate('/'); onClose(); }} className="text-slate-400 hover:text-primary">Go Home</button>
                  </div>
                </div>
              )}
            </div>

            {/* Footer metrics bar */}
            <div className="px-6 py-4.5 bg-slate-50 dark:bg-slate-950/40 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-slate-400 shrink-0">
              <div className="flex items-center gap-4">
                {query.trim() && searchResults && (
                  <span className="text-slate-350 dark:text-slate-500 font-mono">
                    {searchResults.totalCount} results ({searchResults.timeTaken}s)
                  </span>
                )}
                {!query.trim() && (
                  <span className="flex items-center gap-1.5">
                    <Command size={10} /> K to open
                  </span>
                )}
                <span className="flex items-center gap-1">Tab to jump section</span>
              </div>
              <p className="text-primary tracking-[0.2em]">Chronicle Lab Command Center</p>
            </div>
          </div>

          {/* Right panel: Details Preview (for blogs/glossary) */}
          {selectedItem && (selectedItem.type === 'blog' || selectedItem.type === 'glossary') && (
            <div className="border-l border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-950/20 p-6 flex flex-col justify-between hidden md:flex h-[65vh] overflow-y-auto scrollbar-none animate-in fade-in duration-300">
              {selectedItem.type === 'blog' ? (
                <div className="space-y-6">
                  <div 
                    onClick={() => { navigate(`/blog/${selectedItem.slug}`); onClose(); }}
                    className="aspect-[16/10] w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-white/5 bg-slate-150 dark:bg-slate-950/40 shadow-inner shrink-0 relative cursor-pointer group/image hover:border-primary/40 transition-all duration-300"
                  >
                    {selectedItem.coverImage ? (
                      <img src={selectedItem.coverImage} className="w-full h-full object-cover group-hover/image:scale-[1.04] transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs font-black text-slate-500 bg-slate-900">CHRONICLE LAB</div>
                    )}
                  </div>

                  <div className="space-y-2.5">
                    <span className="px-2.5 py-1 bg-primary/10 text-primary text-[8.5px] font-black uppercase tracking-widest rounded-lg">
                      {selectedItem.category?.name || 'Chronicle'}
                    </span>
                    <h3 className="text-base font-black tracking-tight leading-tight text-slate-900 dark:text-white">
                      {selectedItem.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                      {selectedItem.excerpt || selectedItem.subtitle || "Exploring ideas with depth, curiosity, and purpose."}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-y-4 gap-x-2 border-t border-slate-100 dark:border-white/5 pt-4 text-[10px] font-bold text-slate-400">
                    <div className="space-y-0.5">
                      <p className="text-[8px] font-black uppercase tracking-widest text-slate-500">Reading Time</p>
                      <p className="text-slate-800 dark:text-slate-200">{selectedItem.readingTime || 5} min read</p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[8px] font-black uppercase tracking-widest text-slate-500">Difficulty</p>
                      <p className="text-slate-800 dark:text-slate-200">
                        {selectedItem.readingTime ? (selectedItem.readingTime < 6 ? 'Quick Read' : selectedItem.readingTime < 16 ? 'Deepen Knowledge' : 'Deep-Dive') : 'Quick Read'}
                      </p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[8px] font-black uppercase tracking-widest text-slate-500">Published</p>
                      <p className="text-slate-800 dark:text-slate-200">{new Date(selectedItem.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[8px] font-black uppercase tracking-widest text-slate-500">Likes & Views</p>
                      <p className="text-slate-800 dark:text-slate-200">{selectedItem.views || 0} views • {selectedItem.likes || 0} 👍</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="aspect-[16/10] w-full rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-100 dark:bg-slate-950/30 shadow-inner flex flex-col items-center justify-center p-6 text-center relative overflow-hidden shrink-0">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full bg-primary/10 blur-xl pointer-events-none" />
                    <BookOpen size={40} className="text-primary mb-2.5 relative z-10" />
                    <h4 className="text-lg font-black text-slate-800 dark:text-white tracking-tight relative z-10">{selectedItem.term}</h4>
                    <span className="px-2 py-0.5 mt-2 bg-primary/10 text-primary text-[8px] font-black uppercase tracking-widest rounded relative z-10">
                      {selectedItem.category}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <p className="text-[8px] font-black uppercase tracking-widest text-slate-450 dark:text-slate-500">Definition</p>
                    <p className="text-[11px] text-slate-650 dark:text-slate-350 leading-relaxed font-medium font-serif italic">
                      "{selectedItem.definition}"
                    </p>
                  </div>

                  <div className="border-t border-slate-100 dark:border-white/5 pt-4 text-[10px] font-bold text-slate-400">
                    <div className="space-y-0.5">
                      <p className="text-[8px] font-black uppercase tracking-widest text-slate-500">Indexed Date</p>
                      <p className="text-slate-800 dark:text-slate-200">{new Date(selectedItem.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              )}

              {selectedItem.type === 'blog' ? (
                <div className="border-t border-slate-100 dark:border-white/5 pt-4.5 flex justify-between items-center text-[9px] font-black text-primary uppercase tracking-widest shrink-0 mt-6">
                  <span>Enter to read</span>
                  <span className="flex items-center gap-1">Go to Article <ArrowRight size={10} /></span>
                </div>
              ) : (
                <div className="border-t border-slate-100 dark:border-white/5 pt-4.5 flex justify-between items-center text-[9px] font-black text-primary uppercase tracking-widest shrink-0 mt-6">
                  <span>Enter to view definition</span>
                  <span className="flex items-center gap-1">Read Definition <ArrowRight size={10} /></span>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>

      {/* Immersive Glossary Detail Dialog */}
      <AnimatePresence>
        {viewingGlossaryItem && (
          <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setViewingGlossaryItem(null)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-[3rem] p-8 md:p-10 shadow-2xl space-y-6 overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-purple-500 to-primary/20" />
              
              <div className="flex justify-between items-start">
                <div className="min-w-0">
                  <span className="px-3 py-1 bg-primary/10 text-primary text-[9px] font-black uppercase tracking-[0.2em] rounded-full">
                    Glossary: {viewingGlossaryItem.category}
                  </span>
                  <h2 className="text-3xl font-black text-slate-900 dark:text-white mt-3.5 tracking-tight leading-tight truncate">
                    {viewingGlossaryItem.term}
                  </h2>
                </div>
                <button
                  onClick={() => setViewingGlossaryItem(null)}
                  className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 rounded-full text-slate-400 hover:text-slate-800 dark:hover:text-white transition-all shadow-sm shrink-0 ml-4"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="w-full h-[1px] bg-slate-100 dark:bg-white/5" />

              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Definition & Context</p>
                <p className="text-sm text-slate-700 dark:text-slate-350 leading-relaxed font-medium font-serif italic">
                  "{viewingGlossaryItem.definition}"
                </p>
              </div>

              <div className="w-full h-[1px] bg-slate-150 dark:bg-white/5" />

              <div className="flex justify-between items-center text-[10px] font-bold text-slate-400">
                <span>Indexed on: {new Date(viewingGlossaryItem.createdAt).toLocaleDateString()}</span>
                <button
                  onClick={() => setViewingGlossaryItem(null)}
                  className="px-4 py-2 bg-primary text-white rounded-xl font-black uppercase tracking-wider text-[9px] hover:bg-primary/90 transition-all shadow-md shadow-primary/25"
                >
                  Done Reading
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AnimatePresence>
  );
};
