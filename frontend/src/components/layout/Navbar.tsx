import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Compass, 
  PlusCircle, 
  Sun, 
  Moon, 
  User, 
  LogOut, 
  Users, 
  Heart, 
  Check, 
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export const Navbar: React.FC = () => {
  const { user, logout, switchDemoUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const demoPersonas = [
    { email: 'alex@wayfare.ai', label: 'Alex (Solo Explorer)', icon: User, color: 'text-indigo-500' },
    { email: 'elena.leo@wayfare.ai', label: 'Elena & Leo (Couple)', icon: Heart, color: 'text-rose-500' },
    { email: 'group.lead@wayfare.ai', label: 'Tech Crew (Group Lead)', icon: Users, color: 'text-emerald-500' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/25 group-hover:scale-105 transition-transform">
            <Compass className="w-5 h-5 animate-[spin_10s_linear_infinite]" />
          </div>
          <div>
            <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400 bg-clip-text text-transparent">
              Wayfare
            </span>
            <span className="hidden sm:inline-block ml-1.5 text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60">
              AI Planner
            </span>
          </div>
        </Link>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-1">
          <Link
            to="/dashboard"
            className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
              location.pathname === '/dashboard'
                ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/80 dark:bg-indigo-950/40'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            My Trips
          </Link>
          <Link
            to="/builder"
            className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
              location.pathname === '/builder'
                ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/80 dark:bg-indigo-950/40'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            Trip Builder
          </Link>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* New Trip Button */}
          <Link
            to="/builder"
            className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-600/30 transition-all hover:shadow hover:scale-[1.02]"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Plan Trip</span>
          </Link>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* User & Demo Switcher Dropdown */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 p-1.5 pr-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 bg-white dark:bg-slate-800/80 transition-all"
              >
                <img
                  src={user.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                  alt={user.full_name || 'User'}
                  className="w-7 h-7 rounded-lg object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                />
                <span className="hidden sm:inline-block text-xs font-bold text-slate-700 dark:text-slate-200 max-w-[120px] truncate">
                  {user.full_name?.split(' ')[0] || user.email}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {dropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-2 z-50">
                    <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                      <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                        {user.full_name || 'Traveler'}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {user.email}
                      </p>
                    </div>

                    {/* Quick Demo Persona Switcher */}
                    <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5 px-1">
                        <Sparkles className="w-3 h-3 text-amber-500" />
                        <span>Switch Demo Persona</span>
                      </div>
                      <div className="space-y-1">
                        {demoPersonas.map((p) => {
                          const Icon = p.icon;
                          const isActive = user.email === p.email;
                          return (
                            <button
                              key={p.email}
                              onClick={async () => {
                                await switchDemoUser(p.email);
                                setDropdownOpen(false);
                                navigate('/dashboard');
                              }}
                              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                isActive
                                  ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
                                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <Icon className={`w-3.5 h-3.5 ${p.color}`} />
                                <span>{p.label}</span>
                              </div>
                              {isActive && <Check className="w-3.5 h-3.5" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="p-1">
                      <button
                        onClick={() => {
                          logout();
                          setDropdownOpen(false);
                          navigate('/login');
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="text-xs font-bold px-3 py-1.5 rounded-lg text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 transition-colors"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
