import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { LogIn, Mail, Lock, AlertCircle } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function Login() {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/admin';

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      await login(data);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError('root', {
        message: err.response?.data?.message || 'Failed to login'
      });
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass p-10 rounded-[2.5rem] w-full max-w-md space-y-8 shadow-2xl border-white/10"
      >
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-black tracking-tighter">Welcome Back</h1>
          <p className="text-muted-foreground">Login to manage your technical blog.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-bold ml-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <input
                  {...register('email')}
                  type="email"
                  placeholder="admin@techblog.com"
                  className="w-full bg-muted/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-2 ring-primary/20 transition-all"
                />
              </div>
              {errors.email && <p className="text-xs text-destructive font-medium ml-1">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <input
                  {...register('password')}
                  type="password"
                  placeholder="••••••••"
                  className="w-full bg-muted/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-2 ring-primary/20 transition-all"
                />
              </div>
              {errors.password && <p className="text-xs text-destructive font-medium ml-1">{errors.password.message}</p>}
            </div>
          </div>

          {errors.root && (
            <div className="bg-destructive/10 text-destructive p-4 rounded-2xl flex items-center gap-3 text-sm font-medium">
              <AlertCircle size={18} />
              {errors.root.message}
            </div>
          )}

          <button
            disabled={isLoading}
            type="submit"
            className="w-full bg-primary text-primary-foreground py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-50"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <LogIn size={20} /> Sign In
              </>
            )}
          </button>
        </form>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary font-bold hover:underline">
              Register
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
