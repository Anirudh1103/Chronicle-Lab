import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, FileText, Cookie, Lock, Eye, Scale, ShieldAlert, Settings, MousePointer2 } from 'lucide-react';

export type LegalContentType = 'privacy' | 'terms' | 'cookies' | null;

interface LegalModalProps {
  type: LegalContentType;
  onClose: () => void;
}

export function LegalModal({ type, onClose }: LegalModalProps) {
  // Prevent background scrolling
  useEffect(() => {
    if (type) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [type]);

  // ESC key support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const content = {
    privacy: {
      title: 'Privacy Policy',
      icon: <Shield className="text-primary" size={32} />,
      sections: [
        {
          title: '1. Introduction',
          icon: <Eye size={18} className="text-primary" />,
          text: 'At Chronicle Lab, we value your privacy and are committed to protecting your personal data. This policy outlines how we handle information collected through our platform.'
        },
        {
          title: '2. Information We Collect',
          icon: <Lock size={18} className="text-primary" />,
          text: 'We collect minimal data to provide our services. This includes your email address when subscribing to our newsletter, and any identification details (Name/Email) you provide through our feedback or contact forms. We also gather anonymous usage statistics to improve site performance.'
        },
        {
          title: '3. Data Usage & Security',
          icon: <ShieldAlert size={18} className="text-primary" />,
          text: 'Your information is used strictly for technical investigations, newsletter delivery, and professional communication. We implement industry-standard encryption and security protocols to prevent unauthorized access. We never sell, trade, or rent your personal data to third parties.'
        },
        {
          title: '4. Your Rights',
          icon: <Scale size={18} className="text-primary" />,
          text: 'You have the right to request access to the data we hold about you, or to request its deletion at any time. You may unsubscribe from our chronicles using the link provided in every email signal.'
        }
      ]
    },
    terms: {
      title: 'Terms of Service',
      icon: <FileText className="text-primary" size={32} />,
      sections: [
        {
          title: '1. Acceptance & Scope',
          icon: <Scale size={18} className="text-primary" />,
          text: 'By accessing the laboratory at Chronicle Lab, you agree to comply with these terms. These terms govern your use of our technical research, narratives, and digital assets.'
        },
        {
          title: '2. Intellectual Property',
          icon: <Shield size={18} className="text-primary" />,
          text: 'All original content, including code snippets, historical research, and visual investigations, is the property of Anirudh CM. You may cite our work with proper attribution, but unauthorized commercial reproduction or redistribution is strictly prohibited.'
        },
        {
          title: '3. Disclaimer of Liability',
          icon: <ShieldAlert size={18} className="text-primary" />,
          text: 'Chronicle Lab provides technical and historical information for educational purposes. While we strive for extreme precision, the content is provided "as-is" without warranties. The author is not liable for any technical consequences or decisions made based on the research presented here.'
        },
        {
          title: '4. User Conduct',
          icon: <MousePointer2 size={18} className="text-primary" />,
          text: 'Users must interact with the platform in a respectful and lawful manner. Any attempt to bypass security measures or disrupt the archival signal will result in immediate restriction of access.'
        }
      ]
    },
    cookies: {
      title: 'Cookie Policy',
      icon: <Cookie className="text-primary" size={32} />,
      sections: [
        {
          title: '1. What are Cookies?',
          icon: <Settings size={18} className="text-primary" />,
          text: 'Cookies are small technical files stored on your machine to help the platform remember your preferences and maintain secure sessions.'
        },
        {
          title: '2. Essential & Functional',
          icon: <Lock size={18} className="text-primary" />,
          text: 'We use essential cookies to manage administrator sessions and functional cookies to remember your theme preferences (Light/Dark mode). These are mandatory for the stable operation of the laboratory.'
        },
        {
          title: '3. Analytics Signals',
          icon: <Eye size={18} className="text-primary" />,
          text: 'We use high-level anonymous analytics to understand how readers navigate our chronicles. This data helps us optimize the cinematic experience and loading speeds.'
        },
        {
          title: '4. Control',
          icon: <MousePointer2 size={18} className="text-primary" />,
          text: 'You can control or disable cookies through your browser settings. Please be aware that disabling essential cookies may impact your ability to access secure areas of the laboratory.'
        }
      ]
    }
  };

  const activeContent = type ? content[type] : null;

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {type && activeContent && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 md:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/95 backdrop-blur-3xl cursor-zoom-out"
          />

          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[3rem] shadow-[0_0_100px_rgba(0,0,0,0.5)] border border-white/5 overflow-hidden z-10"
          >
            <div className="p-8 md:p-14 space-y-10 overflow-y-auto max-h-[85vh] no-scrollbar">
              <div className="flex items-center justify-between sticky top-0 bg-inherit z-20 pb-4">
                <div className="flex items-center gap-5">
                  <div className="p-4 bg-primary/10 rounded-2xl shadow-inner">
                    {activeContent.icon}
                  </div>
                  <h2 className="text-4xl font-black tracking-tighter">{activeContent.title}</h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all text-slate-400 hover:text-slate-900 dark:hover:text-white hover:scale-110 active:scale-95"
                >
                  <X size={28} />
                </button>
              </div>

              <div className="space-y-10">
                {activeContent.sections.map((s, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-primary/5 rounded-lg border border-primary/10">
                            {s.icon}
                        </div>
                        <h3 className="text-xl font-black tracking-tight text-primary/80">{s.title}</h3>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 font-medium leading-[1.8] pl-10 border-l-2 border-primary/10">
                        {s.text}
                    </p>
                  </motion.div>
                ))}
              </div>

              <div className="pt-10 border-t border-slate-100 dark:border-white/5 text-center">
                 <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/5 rounded-full border border-primary/10">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Secure Archival Portal</span>
                 </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
