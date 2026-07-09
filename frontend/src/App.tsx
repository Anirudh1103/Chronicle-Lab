import React, { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { AdminDashboard } from './pages/AdminDashboard';
import { Footer } from './components/Footer';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useAuth } from './hooks/useAuth';
import { IntroScreen } from './components/intro/IntroScreen';
import { AboutPage } from './pages/AboutPage';
import { FeedbackPage } from './pages/FeedbackPage';
import { BlogDetailsPage } from './pages/BlogDetailsPage';

import { BlogEditorPage } from './pages/BlogEditorPage';

function App() {
  const [showIntro, setShowIntro] = useState(() => {
    // Show intro only once per session
    return !sessionStorage.getItem('hasSeenIntro');
  });

  const handleIntroComplete = () => {
    sessionStorage.setItem('hasSeenIntro', 'true');
    setShowIntro(false);
  };

  // Use try-catch or ensure useAuth doesn't crash the render if backend is down
  try {
    useAuth();
  } catch (e) {
    console.error("Auth hook error:", e);
  }

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      return localStorage.getItem('theme') as 'light' | 'dark' || 'dark';
    } catch {
      return 'dark';
    }
  });

  useEffect(() => {
    try {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      localStorage.setItem('theme', theme);
    } catch (e) {
      console.error("Theme effect error:", e);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300 flex flex-col overflow-x-hidden">
      <AnimatePresence mode="wait">
        {showIntro ? (
          <IntroScreen key="intro" theme={theme} onComplete={handleIntroComplete} />
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 10, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col min-h-screen"
          >
            <Navbar theme={theme} toggleTheme={toggleTheme} />

            <main className="pt-24 px-6 max-w-7xl mx-auto flex-1 w-full">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/feedback" element={<FeedbackPage />} />
                <Route path="/blog/:slug" element={<BlogDetailsPage />} />
                <Route
                  path="/admin/*"
                  element={
                    <ProtectedRoute>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route path="/admin/editor/:id?" element={<ProtectedRoute><BlogEditorPage /></ProtectedRoute>} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>

            <Footer />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function NotFound() {
  return (
    <div className="py-40 text-center">
      <h1 className="text-5xl font-black">404 - Not Found</h1>
    </div>
  );
}

export default App;
