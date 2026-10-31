import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  GripVertical, 
  Lock, 
  Unlock, 
  Sparkles, 
  Edit3, 
  Trash2, 
  Clock, 
  MapPin, 
  Navigation, 
  DollarSign, 
  Lightbulb 
} from 'lucide-react';
import { ItineraryItem, ItemType } from '../../types';

interface TimelineCardProps {
  item: ItineraryItem;
  index: number;
  isSelected?: boolean;
  onSelect?: () => void;
  onToggleLock: (id: string) => void;
  onSuggestAlternatives: (item: ItineraryItem) => void;
  onEdit: (item: ItineraryItem) => void;
  onDelete: (id: string) => void;
  readOnly?: boolean;
}

export const TimelineCard: React.FC<TimelineCardProps> = ({
  item,
  index,
  isSelected,
  onSelect,
  onToggleLock,
  onSuggestAlternatives,
  onEdit,
  onDelete,
  readOnly = false,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id, disabled: readOnly });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const categoryStyles: Record<ItemType, { badge: string; border: string; bg: string }> = {
    attraction: {
      badge: 'bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
      border: 'border-l-indigo-600',
      bg: 'hover:border-indigo-200 dark:hover:border-indigo-800',
    },
    dining: {
      badge: 'bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
      border: 'border-l-amber-600',
      bg: 'hover:border-amber-200 dark:hover:border-amber-800',
    },
    accommodation: {
      badge: 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
      border: 'border-l-emerald-600',
      bg: 'hover:border-emerald-200 dark:hover:border-emerald-800',
    },
    transport: {
      badge: 'bg-sky-100 dark:bg-sky-950/70 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800',
      border: 'border-l-sky-600',
      bg: 'hover:border-sky-200 dark:hover:border-sky-800',
    },
    activity: {
      badge: 'bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
      border: 'border-l-purple-600',
      bg: 'hover:border-purple-200 dark:hover:border-purple-800',
    },
  };

  const styleConfig = categoryStyles[item.type] || categoryStyles.activity;

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onSelect}
      className={`group relative bg-white dark:bg-slate-900 rounded-2xl border ${
        isSelected
          ? 'border-indigo-500 shadow-md ring-2 ring-indigo-500/20'
          : 'border-slate-200/90 dark:border-slate-800 shadow-sm'
      } ${styleConfig.border} border-l-[5px] p-4 transition-all duration-150 mb-3.5`}
    >
      {/* Transit Connector from previous stop if exists */}
      {index > 0 && item.travel_time_minutes > 0 && (
        <div className="absolute -top-3.5 left-7 -translate-x-1/2 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 shadow-xs z-10">
          <Navigation className="w-2.5 h-2.5 text-indigo-500" />
          <span>{item.travel_time_minutes} min {item.travel_mode}</span>
        </div>
      )}

      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {/* Drag handle */}
          {!readOnly && (
            <button
              {...attributes}
              {...listeners}
              aria-label="Drag to reorder"
              className="mt-0.5 text-slate-300 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-300 cursor-grab active:cursor-grabbing p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <GripVertical className="w-4 h-4" />
            </button>
          )}

          {/* Main info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${styleConfig.badge}`}>
                {item.type}
              </span>

              <div className="flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-400">
                <Clock className="w-3.5 h-3.5" />
                <span>{item.start_time} - {item.end_time}</span>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <span className="text-[11px] text-slate-500">{item.duration_minutes}m</span>
              </div>

              {item.is_locked && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                  <Lock className="w-2.5 h-2.5" />
                  <span>Locked</span>
                </span>
              )}
            </div>

            <h4 className="text-base font-bold text-slate-900 dark:text-white truncate">
              {item.title}
            </h4>

            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400" />
              <span className="truncate">{item.location_name}</span>
            </div>

            {item.description && (
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 line-clamp-2 leading-relaxed">
                {item.description}
              </p>
            )}

            {item.tips && (
              <div className="flex items-start gap-1.5 mt-2.5 p-2 rounded-lg bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/40 text-[11px] text-amber-900 dark:text-amber-200">
                <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Insider Tip:</strong> {item.tips}</span>
              </div>
            )}
          </div>
        </div>

        {/* Cost & Action Toolbar */}
        <div className="flex flex-col items-end justify-between shrink-0 self-stretch">
          <div className="flex items-center gap-0.5 font-extrabold text-sm text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/60 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
            <DollarSign className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{item.cost > 0 ? item.cost.toFixed(2) : 'Free'}</span>
          </div>

          {!readOnly && (
            <div className="flex items-center gap-1 mt-3">
              {/* Suggest Alternatives */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSuggestAlternatives(item);
                }}
                title="Suggest 3 AI alternatives"
                className="p-1.5 rounded-lg text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
              </button>

              {/* Toggle Lock */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleLock(item.id);
                }}
                title={item.is_locked ? 'Unlock item (can be regenerated)' : 'Lock item (protect from day regeneration)'}
                className={`p-1.5 rounded-lg transition-colors ${
                  item.is_locked
                    ? 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {item.is_locked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
              </button>

              {/* Edit */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(item);
                }}
                title="Edit item details"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>

              {/* Delete */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(item.id);
                }}
                title="Remove item"
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
