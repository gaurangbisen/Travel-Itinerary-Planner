import React, { useState } from 'react';
import { X, RefreshCw, Lock, Sparkles } from 'lucide-react';
import { ItineraryDay } from '../../types';

interface RegenerateModalProps {
  day: ItineraryDay;
  onRegenerate: (instructions: string) => Promise<void>;
  onClose: () => void;
}

export const RegenerateModal: React.FC<RegenerateModalProps> = ({
  day,
  onRegenerate,
  onClose,
}) => {
  const [instructions, setInstructions] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const lockedCount = day.items.filter(i => i.is_locked).length;

  const handleRun = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onRegenerate(instructions);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const quickSuggestions = [
    'More hidden cafes & bakeries',
    'Scenic outdoor viewpoints & parks',
    'Budget-friendly street food options',
    'Historical architecture & museum focus',
    'Relaxed, slower afternoon pace',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 overflow-hidden">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <RefreshCw className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Regenerate Day {day.day_number}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {day.date} • {day.title || 'Itinerary Schedule'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Locked items badge notice */}
        <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300">
          <Lock className="w-4 h-4 text-amber-500 shrink-0" />
          <span>
            <strong>{lockedCount} item(s) locked:</strong> All locked items will be preserved and scheduled seamlessly around new recommendations.
          </span>
        </div>

        <form onSubmit={handleRun} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Custom AI Instructions (Optional)
            </label>
            <textarea
              rows={3}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="e.g. Focus on atmospheric vintage cafes, quiet green gardens, and romantic sunset stops..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 text-xs focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            />
          </div>

          {/* Quick presets */}
          <div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400 dark:text-slate-500 mb-2">
              <Sparkles className="w-3 h-3 text-indigo-500" />
              <span>Quick Prompt Modifiers</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {quickSuggestions.map((sug, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setInstructions(prev => prev ? `${prev}, ${sug}` : sug)}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-600 transition-colors"
                >
                  + {sug}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/30 disabled:opacity-50 transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSubmitting ? 'animate-spin' : ''}`} />
              <span>{isSubmitting ? 'Generating Day...' : 'Regenerate Day'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
