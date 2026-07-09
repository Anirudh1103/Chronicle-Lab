import React, { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { AdminDashboard } from './pages/AdminDashboard';
import { Footer } from './components/Footer';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useAuth } from './hooks/useAuth';

function App() {
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
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300 flex flex-col">
      <Navbar theme={theme} toggleTheme={toggleTheme} />

      <main className="pt-24 px-6 max-w-7xl mx-auto flex-1 w-full">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/blog/:slug" element={<BlogDetails />} />
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

function BlogDetails() {
  return (
    <div className="py-40 text-center">
      <h1 className="text-5xl font-black">Blog Details</h1>
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
