import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { 
  PlusCircle, 
  Search, 
  MapPin, 
  Calendar, 
  Users, 
  Compass, 
  DollarSign, 
  Share2, 
  Trash2, 
  Clock, 
  Sparkles,
  ArrowRight,
  TrendingUp,
  Globe2
} from 'lucide-react';
import { api } from '../services/api';
import { Trip, TripType } from '../types';
import { ShareModal } from '../components/share/ShareModal';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [shareTrip, setShareTrip] = useState<Trip | null>(null);

  const { data: trips = [], isLoading } = useQuery({
    queryKey: ['trips', search, selectedType],
    queryFn: () => api.getTrips(search, selectedType),
  });

  const deleteMutation = useMutation({
    mutationFn: (tripId: string) => api.deleteTrip(tripId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
    },
  });

  const handleDelete = (e: React.MouseEvent, tripId: string) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this trip itinerary?')) {
      deleteMutation.mutate(tripId);
    }
  };

  const handleShare = (e: React.MouseEvent, trip: Trip) => {
    e.stopPropagation();
    setShareTrip(trip);
  };

  // Metrics computation
  const totalTrips = trips.length;
  const totalBudget = trips.reduce((acc, t) => acc + (t.budget || 0), 0);
  const totalSpent = trips.reduce((acc, t) => acc + (t.total_cost || 0), 0);
  const uniqueDestinations = new Set(trips.map(t => t.destination.split(',')[0].trim())).size;

  const typePills = [
    { id: 'all', label: 'All Trips' },
    { id: 'solo', label: 'Solo' },
    { id: 'couple', label: 'Couple' },
    { id: 'group', label: 'Group' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Welcome & Actions Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Travel Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage your AI-crafted journeys, explore days, and track expenses.
          </p>
        </div>

        <Link
          to="/builder"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/30 hover:scale-[1.02] transition-all self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Plan New Trip</span>
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Total Trips</span>
            <Compass className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">{totalTrips}</div>
          <div className="text-[11px] text-slate-400 mt-1">Planned & active</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Budget Managed</span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            ${totalBudget.toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-semibold">
            ${totalSpent.toLocaleString()} spent
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Destinations</span>
            <Globe2 className="w-4 h-4 text-sky-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">{uniqueDestinations}</div>
          <div className="text-[11px] text-slate-400 mt-1">Cities & regions</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">AI Assistant</span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">Active</div>
          <div className="text-[11px] text-indigo-600 dark:text-indigo-400 mt-1 font-semibold">
            Mock & Gemini ready
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search trips by destination or title..."
            className="w-full pl-9 pr-4 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          {typePills.map((pill) => (
            <button
              key={pill.id}
              onClick={() => setSelectedType(pill.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                selectedType === pill.id
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      {/* Trips Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-64 rounded-3xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
      ) : trips.length === 0 ? (
        <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 p-8">
          <Compass className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-extrabold text-slate-800 dark:text-white">
            No trips found matching criteria
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            Try adjusting your search query, selecting "All Trips", or start a new itinerary.
          </p>
          <button
            onClick={() => navigate('/builder')}
            className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Plan New Itinerary</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map((trip) => {
            const typeColor = {
              solo: 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
              couple: 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
              group: 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
            }[trip.trip_type] || 'bg-slate-100 text-slate-700';

            return (
              <div
                key={trip.id}
                onClick={() => navigate(`/trips/${trip.id}`)}
                className="group relative rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-xl hover:border-indigo-400 dark:hover:border-indigo-600 transition-all duration-200 overflow-hidden cursor-pointer flex flex-col justify-between"
              >
                <div>
                  {/* Image Cover */}
                  <div className="relative h-44 w-full overflow-hidden">
                    <img
                      src={trip.cover_image || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600'}
                      alt={trip.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/20 to-transparent" />
                    
                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg border backdrop-blur-md ${typeColor}`}>
                        {trip.trip_type}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-lg bg-black/40 backdrop-blur-md text-white border border-white/20 capitalize">
                        {trip.pace} pace
                      </span>
                    </div>

                    <div className="absolute bottom-3 left-4 right-4 text-white">
                      <div className="flex items-center gap-1 text-xs text-slate-200">
                        <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                        <span className="truncate">{trip.destination}</span>
                      </div>
                      <h3 className="text-base font-extrabold truncate mt-0.5">
                        {trip.title}
                      </h3>
                    </div>
                  </div>

                  {/* Body Info */}
                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{trip.start_date} – {trip.end_date}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        <span>{trip.travelers} traveler{trip.travelers > 1 ? 's' : ''}</span>
                      </div>
                    </div>

                    {trip.ai_summary && (
                      <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                        {trip.ai_summary}
                      </p>
                    )}

                    {/* Interest tags */}
                    {trip.interests && trip.interests.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {trip.interests.slice(0, 3).map((tag, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-semibold text-slate-600 dark:text-slate-400"
                          >
                            {tag}
                          </span>
                        ))}
                        {trip.interests.length > 3 && (
                          <span className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-400">
                            +{trip.interests.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Cost & Actions */}
                <div className="p-4 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                      Budget / Spent
                    </div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">
                      ${trip.total_cost || 0} / <span className="text-slate-500">${trip.budget}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={(e) => handleShare(e, trip)}
                      title="Share trip"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => handleDelete(e, trip.id)}
                      title="Delete trip"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Share Modal */}
      {shareTrip && (
        <ShareModal
          tripId={shareTrip.id}
          shareToken={shareTrip.share_token}
          tripTitle={shareTrip.title}
          onClose={() => setShareTrip(null)}
        />
      )}
    </div>
  );
};
