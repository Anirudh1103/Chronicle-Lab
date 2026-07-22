import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import api from '../../api/client';
import { AlertCircle, LogOut, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function IdleTimer() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [idleTimeout, setIdleTimeout] = useState<number>(30); // Default 30 minutes
  const [showWarning, setShowWarning] = useState(false);
  const [countdown, setCountdown] = useState(60);
  
  const timerRef = useRef<any>(null);
  const countdownRef = useRef<any>(null);

  // Fetch user settings and sync with localStorage fallback
  useEffect(() => {
    let active = true;
    
    // Check localStorage first for immediate responsiveness
    const local = localStorage.getItem('chronicle_security_settings');
    if (local) {
      try {
        const parsed = JSON.parse(local);
        if (parsed.idleTimeout !== undefined) {
          setIdleTimeout(parsed.idleTimeout);
        }
      } catch (_) {}
    }

    const fetchSettings = async () => {
      try {
        const res = await api.get('/security/settings');
        if (res.data && res.data.idleTimeout !== undefined && active) {
          setIdleTimeout(res.data.idleTimeout);
        }
      } catch (err) {
        console.warn('Failed to load settings from API, checked localStorage fallback:', err);
      }
    };
    fetchSettings();

    // Listen to settings update storage events from other tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'chronicle_security_settings' && e.newValue && active) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (parsed.idleTimeout !== undefined) {
            setIdleTimeout(parsed.idleTimeout);
          }
        } catch (_) {}
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      active = false;
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Sync activity across tabs
  const recordActivity = () => {
    localStorage.setItem('last_active_time', Date.now().toString());
  };

  useEffect(() => {
    if (idleTimeout <= 0) return; // 0 or Never means disabled

    // Listen to user events
    const events = ['mousemove', 'keydown', 'mousedown', 'touchstart', 'scroll', 'click'];
    events.forEach(event => window.addEventListener(event, recordActivity));
    
    // Set initial activity
    recordActivity();

    // Check timer every second
    timerRef.current = setInterval(() => {
      const lastActive = Number(localStorage.getItem('last_active_time') || Date.now());
      const elapsed = Date.now() - lastActive;
      const timeoutMs = idleTimeout * 60 * 1000;
      const warningMs = Math.max(0, timeoutMs - 60 * 1000); // Show modal 60s before timeout

      if (elapsed >= timeoutMs) {
        // Time expired! Log out immediately
        clearInterval(timerRef.current);
        if (countdownRef.current) clearInterval(countdownRef.current);
        handleAutoLogout();
      } else if (elapsed >= warningMs) {
        // Show warning modal
        const remainingSeconds = Math.ceil((timeoutMs - elapsed) / 1000);
        setCountdown(remainingSeconds);
        setShowWarning(true);
      } else {
        // Active! Hide modal if visible
        setShowWarning(false);
      }
    }, 1000);

    return () => {
      events.forEach(event => window.removeEventListener(event, recordActivity));
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [idleTimeout]);

  const handleAutoLogout = async () => {
    setShowWarning(false);
    await logout();
    navigate('/login');
  };

  const handleStayLoggedIn = () => {
    recordActivity();
    setShowWarning(false);
  };

  return (
    <AnimatePresence>
      {showWarning && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="w-full max-w-md bg-slate-900 border border-red-500/20 rounded-[2rem] p-8 shadow-2xl shadow-red-500/10 text-center relative overflow-hidden"
          >
            {/* Warning Ring Background Decor */}
            <div className="absolute -right-20 -top-20 w-48 h-48 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20 shadow-lg shadow-red-500/5 animate-pulse">
              <ShieldAlert size={32} />
            </div>

            <h3 className="text-xl font-black text-slate-100 tracking-tight mb-2">Inactivity Session Warning</h3>
            <p className="text-sm text-slate-400 leading-relaxed mb-6">
              You will be automatically signed out in{' '}
              <span className="font-extrabold text-red-400 text-base">{countdown} seconds</span>{' '}
              due to inactivity.
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={handleStayLoggedIn}
                className="w-full py-4 bg-primary text-primary-foreground font-black rounded-2xl hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-primary/20 text-sm"
              >
                Stay Logged In
              </button>
              <button
                onClick={handleAutoLogout}
                className="w-full py-4 bg-transparent text-slate-400 font-bold hover:text-red-400 active:scale-[0.98] transition-all text-sm flex items-center justify-center gap-2"
              >
                <LogOut size={16} /> Sign Out Now
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
