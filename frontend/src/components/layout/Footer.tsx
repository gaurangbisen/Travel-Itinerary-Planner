import React from 'react';
import { Compass, Sparkles, Shield, Cpu } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-slate-200/80 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <Compass className="w-4 h-4 text-indigo-500" />
          <span className="font-bold text-slate-700 dark:text-slate-200">Wayfare</span>
          <span>– Next-Gen AI Travel Engine</span>
        </div>

        <div className="flex items-center gap-6 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-indigo-500" />
            <span>FastAPI + Gemini / Mock AI</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-emerald-500" />
            <span>Supabase RLS Ready</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Strict Pydantic Validation</span>
          </div>
        </div>

        <div className="text-xs text-slate-400 dark:text-slate-500">
          © {new Date().getFullYear()} Wayfare. Built for explorers.
        </div>
      </div>
    </footer>
  );
};
