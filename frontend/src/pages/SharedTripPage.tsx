import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  Compass, 
  MapPin, 
  Calendar, 
  Users, 
  Share2, 
  Calendar as CalendarIcon, 
  FileText, 
  Lock, 
  ExternalLink 
} from 'lucide-react';
import { api } from '../services/api';
import { TimelineCard } from '../components/itinerary/TimelineCard';
import { TripMap } from '../components/map/TripMap';
import { CostTrackerSidebar } from '../components/analytics/CostTrackerSidebar';
import { ItineraryDay, ItineraryItem } from '../types';

export const SharedTripPage: React.FC = () => {
  const { shareToken } = useParams<{ shareToken: string }>();
  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  const { data: trip, isLoading, error } = useQuery({
    queryKey: ['shared-trip', shareToken],
    queryFn: () => api.getSharedTrip(shareToken!),
    enabled: !!shareToken,
  });

  const { data: costSummary, isLoading: loadingCost } = useQuery({
    queryKey: ['shared-cost', shareToken],
    queryFn: () => api.getSharedTripCostSummary(shareToken!),
    enabled: !!shareToken,
  });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          Loading shared itinerary...
        </p>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Shared Trip Not Found</h3>
        <p className="text-xs text-slate-500 mt-1">
          This itinerary link may have expired or is invalid.
        </p>
        <Link
          to="/"
          className="mt-4 inline-block px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
        >
          Go to Wayfare Home
        </Link>
      </div>
    );
  }

  const activeDay: ItineraryDay | undefined = trip.days?.[activeDayIndex] || trip.days?.[0];
  const activeItems: ItineraryItem[] = activeDay?.items || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Read-Only Shared Banner */}
      <div className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-between text-xs text-indigo-900 dark:text-indigo-200">
        <div className="flex items-center gap-2">
          <Share2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span>
            You are viewing a <strong>read-only shared itinerary</strong> on Wayfare.
          </span>
        </div>
        <Link
          to="/builder"
          className="font-bold underline text-indigo-600 dark:text-indigo-400 hover:text-indigo-800"
        >
          Plan Your Own Trip &rarr;
        </Link>
      </div>

      {/* Header Info */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                {trip.trip_type}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 capitalize">
                {trip.pace} Pace
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {trip.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-1 font-semibold text-slate-900 dark:text-slate-200">
                <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                <span>{trip.destination}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{trip.start_date} – {trip.end_date}</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                <span>{trip.travelers} traveler{trip.travelers > 1 ? 's' : ''}</span>
              </div>
            </div>

            {trip.ai_summary && (
              <p className="text-xs text-slate-600 dark:text-slate-300 italic pt-1 max-w-3xl leading-relaxed">
                "{trip.ai_summary}"
              </p>
            )}
          </div>

          {/* Export tools */}
          <div className="flex items-center gap-2 self-start lg:self-auto">
            <a
              href={api.getExportIcsUrl(trip.id)}
              download
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <CalendarIcon className="w-3.5 h-3.5 text-indigo-500" />
              <span>Calendar .ICS</span>
            </a>
            <a
              href={api.getExportPdfUrl(trip.id)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </a>
          </div>
        </div>
      </div>

      {/* Day Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {trip.days.map((day, idx) => {
          const isActive = idx === activeDayIndex;
          return (
            <button
              key={day.id}
              onClick={() => {
                setActiveDayIndex(idx);
                setSelectedItemId(null);
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25 scale-[1.02]'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/90 dark:border-slate-800'
              }`}
            >
              <span>Day {day.day_number}</span>
              <span className={`text-[10px] ${isActive ? 'text-indigo-100' : 'text-slate-400'}`}>
                ({day.date})
              </span>
            </button>
          );
        })}
      </div>

      {/* 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Timeline (read-only) */}
        <div className="lg:col-span-7 space-y-3">
          {activeDay && (
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs mb-3">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Day {activeDay.day_number}: {activeDay.title || activeDay.date}
              </h3>
              {activeDay.theme && (
                <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold mt-0.5">
                  Theme: {activeDay.theme}
                </p>
              )}
            </div>
          )}

          {activeItems.map((item, idx) => (
            <TimelineCard
              key={item.id}
              item={item}
              index={idx}
              isSelected={selectedItemId === item.id}
              onSelect={() => setSelectedItemId(item.id)}
              onToggleLock={() => {}}
              onSuggestAlternatives={() => {}}
              onEdit={() => {}}
              onDelete={() => {}}
              readOnly={true}
            />
          ))}
        </div>

        {/* Map & Cost */}
        <div className="lg:col-span-5 space-y-6 sticky top-20">
          <TripMap
            items={activeItems}
            destination={trip.destination}
            selectedItemId={selectedItemId}
            onSelectItem={(id) => setSelectedItemId(id)}
            height="360px"
          />

          <CostTrackerSidebar
            costSummary={costSummary || null}
            isLoading={loadingCost}
          />
        </div>
      </div>
    </div>
  );
};
