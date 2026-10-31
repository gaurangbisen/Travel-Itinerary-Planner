import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Compass, User, Heart, Users, Sparkles, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, switchDemoUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsSubmitting(true);
    try {
      await login(email);
      navigate(from, { replace: true });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoLogin = async (demoEmail: string) => {
    await switchDemoUser(demoEmail);
    navigate(from, { replace: true });
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white mx-auto shadow-md shadow-indigo-600/30">
            <Compass className="w-6 h-6 animate-pulse" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Welcome to Wayfare
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Sign in to start designing and sharing AI-powered travel itineraries
          </p>
        </div>

        {/* 1-Click Demo Personas */}
        <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 space-y-2.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-950 dark:text-indigo-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Instant 1-Click Demo Login</span>
          </div>
          <div className="grid grid-cols-1 gap-1.5">
            <button
              type="button"
              onClick={() => handleDemoLogin('alex@wayfare.ai')}
              className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-indigo-50/80 dark:hover:bg-slate-700/80 border border-slate-200/60 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors shadow-2xs"
            >
              <div className="flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-indigo-500" />
                <span>Alex Rivera (Solo Explorer)</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </button>

            <button
              type="button"
              onClick={() => handleDemoLogin('elena.leo@wayfare.ai')}
              className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-rose-50/80 dark:hover:bg-slate-700/80 border border-slate-200/60 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors shadow-2xs"
            >
              <div className="flex items-center gap-2">
                <Heart className="w-3.5 h-3.5 text-rose-500" />
                <span>Elena & Leo (Couple Getaway)</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </button>

            <button
              type="button"
              onClick={() => handleDemoLogin('group.lead@wayfare.ai')}
              className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-emerald-50/80 dark:hover:bg-slate-700/80 border border-slate-200/60 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors shadow-2xs"
            >
              <div className="flex items-center gap-2">
                <Users className="w-3.5 h-3.5 text-emerald-500" />
                <span>Tech Crew Lead (Group Roadtrip)</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Standard Email Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@domain.com"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 text-xs outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 text-xs outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/30 disabled:opacity-50 transition-all"
          >
            {isSubmitting ? 'Signing in...' : 'Sign In / Register'}
          </button>
        </form>
      </div>
    </div>
  );
};
