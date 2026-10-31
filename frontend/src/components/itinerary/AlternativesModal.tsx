import React, { useState } from 'react';
import { X, Sparkles, Star, MapPin, DollarSign, Clock, Check, ArrowRight } from 'lucide-react';
import { AlternativeOption, ItineraryItem } from '../../types';

interface AlternativesModalProps {
  originalItem: ItineraryItem;
  alternatives: AlternativeOption[];
  isLoading: boolean;
  onSwap: (selected: AlternativeOption) => Promise<void>;
  onClose: () => void;
}

export const AlternativesModal: React.FC<AlternativesModalProps> = ({
  originalItem,
  alternatives,
  isLoading,
  onSwap,
  onClose,
}) => {
  const [swappingIndex, setSwappingIndex] = useState<number | null>(null);

  const handleSelect = async (alt: AlternativeOption, index: number) => {
    setSwappingIndex(index);
    try {
      await onSwap(alt);
      onClose();
    } finally {
      setSwappingIndex(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                3 AI-Suggested Alternatives
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-md">
                Replacing: <strong>{originalItem.title}</strong> (${originalItem.cost.toFixed(2)})
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

        {/* Content list */}
        <div className="p-5 overflow-y-auto space-y-3.5 flex-1">
          {isLoading ? (
            <div className="py-16 text-center">
              <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Finding neighborhood alternatives with matching pace & budget...
              </p>
            </div>
          ) : alternatives.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              No alternatives found for this stop.
            </div>
          ) : (
            alternatives.map((alt, idx) => {
              const costDiff = alt.cost - originalItem.cost;
              const isSwapping = swappingIndex === idx;

              return (
                <div
                  key={idx}
                  className="group relative p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 transition-all shadow-xs hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300">
                          {alt.type}
                        </span>
                        <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <span>{alt.rating.toFixed(1)}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-slate-500">
                          <Clock className="w-3 h-3" />
                          <span>{alt.duration_minutes}m</span>
                        </div>
                      </div>

                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {alt.title}
                      </h4>

                      <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        <MapPin className="w-3 h-3 shrink-0" />
                        <span className="truncate">{alt.location_name}</span>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                        {alt.description}
                      </p>

                      <div className="mt-2.5 p-2 rounded-lg bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 text-[11px] text-indigo-900 dark:text-indigo-300">
                        <strong>Why AI recommends:</strong> {alt.reason_recommended}
                      </div>
                    </div>

                    {/* Swap CTA */}
                    <div className="flex flex-col items-end justify-between shrink-0 self-stretch">
                      <div className="text-right">
                        <div className="text-sm font-extrabold text-slate-900 dark:text-white">
                          ${alt.cost.toFixed(2)}
                        </div>
                        <div className={`text-[10px] font-bold ${
                          costDiff < 0 ? 'text-emerald-600 dark:text-emerald-400' : costDiff > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400'
                        }`}>
                          {costDiff < 0 ? `-$${Math.abs(costDiff).toFixed(2)} cheaper` : costDiff > 0 ? `+$${costDiff.toFixed(2)}` : 'Same cost'}
                        </div>
                      </div>

                      <button
                        onClick={() => handleSelect(alt, idx)}
                        disabled={isSwapping}
                        className="mt-4 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-sm"
                      >
                        {isSwapping ? (
                          <span>Swapping...</span>
                        ) : (
                          <>
                            <span>Swap In</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
