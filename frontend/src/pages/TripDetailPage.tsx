import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  MapPin,
  Calendar,
  Users,
  Sparkles,
  RefreshCw,
  Plus,
  Share2,
  DollarSign,
  ArrowLeft,
  Lock,
  Layers,
  Heart,
  User,
  Shield,
  Download
} from 'lucide-react';

import { api } from '../services/api';
import { 
  TripDetail, 
  ItineraryDay, 
  ItineraryItem, 
  AlternativeOption, 
  TripMember 
} from '../types';

import { TimelineCard } from '../components/itinerary/TimelineCard';
import { TripMap } from '../components/map/TripMap';
import { CostTrackerSidebar } from '../components/analytics/CostTrackerSidebar';
import { AlternativesModal } from '../components/itinerary/AlternativesModal';
import { RegenerateModal } from '../components/itinerary/RegenerateModal';
import { ItemEditModal } from '../components/itinerary/ItemEditModal';
import { GroupMembersModal } from '../components/members/GroupMembersModal';
import { ShareModal } from '../components/share/ShareModal';

export const TripDetailPage: React.FC = () => {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Active day index
  const [activeDayIndex, setActiveDayIndex] = useState<number>(0);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  // Modals state
  const [alternativesItem, setAlternativesItem] = useState<ItineraryItem | null>(null);
  const [alternativesList, setAlternativesList] = useState<AlternativeOption[]>([]);
  const [loadingAlternatives, setLoadingAlternatives] = useState<boolean>(false);

  const [regenerateDayModal, setRegenerateDayModal] = useState<ItineraryDay | null>(null);
  const [editItemModal, setEditItemModal] = useState<{ item?: ItineraryItem | null; dayId: string } | null>(null);
  const [membersModalOpen, setMembersModalOpen] = useState<boolean>(false);
  const [shareModalOpen, setShareModalOpen] = useState<boolean>(false);

  // Queries
  const { data: trip, isLoading, error } = useQuery({
    queryKey: ['trip', tripId],
    queryFn: () => api.getTrip(tripId!),
    enabled: !!tripId,
  });

  const { data: costSummary, isLoading: loadingCost } = useQuery({
    queryKey: ['cost-summary', tripId],
    queryFn: () => api.getCostSummary(tripId!),
    enabled: !!tripId,
  });

  // dnd-kit sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Active day computation
  const activeDay: ItineraryDay | undefined = trip?.days?.[activeDayIndex] || trip?.days?.[0];
  const activeItems: ItineraryItem[] = activeDay?.items || [];

  // Mutations
  const toggleLockMutation = useMutation({
    mutationFn: (itemId: string) => api.toggleItemLock(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trip', tripId] });
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: (itemId: string) => api.deleteItem(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trip', tripId] });
      queryClient.invalidateQueries({ queryKey: ['cost-summary', tripId] });
    },
  });

  const saveItemMutation = useMutation({
    mutationFn: async (itemData: Partial<ItineraryItem>) => {
      if (editItemModal?.item?.id) {
        return api.updateItem(editItemModal.item.id, itemData);
      } else {
        return api.createItem(itemData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trip', tripId] });
      queryClient.invalidateQueries({ queryKey: ['cost-summary', tripId] });
    },
  });

  const regenerateMutation = useMutation({
    mutationFn: ({ dayId, instructions }: { dayId: string; instructions: string }) =>
      api.regenerateDay(dayId, instructions),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trip', tripId] });
      queryClient.invalidateQueries({ queryKey: ['cost-summary', tripId] });
    },
  });

  const swapAlternativeMutation = useMutation({
    mutationFn: async ({ origItemId, alt }: { origItemId: string; alt: AlternativeOption }) => {
      return api.updateItem(origItemId, {
        title: alt.title,
        description: alt.description,
        location_name: alt.location_name,
        lat: alt.lat,
        lng: alt.lng,
        type: alt.type,
        cost: alt.cost,
        duration_minutes: alt.duration_minutes,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trip', tripId] });
      queryClient.invalidateQueries({ queryKey: ['cost-summary', tripId] });
    },
  });

  // Drag and drop reordering handler
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !activeDay) return;

    const oldIndex = activeItems.findIndex(i => i.id === active.id);
    const newIndex = activeItems.findIndex(i => i.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const newItems = arrayMove(activeItems, oldIndex, newIndex);
      const reorderedIds = newItems.map(i => i.id);

      // Optimistically update cache
      queryClient.setQueryData(['trip', tripId], (old: TripDetail | undefined) => {
        if (!old) return old;
        const updatedDays = [...old.days];
        updatedDays[activeDayIndex] = {
          ...updatedDays[activeDayIndex],
          items: newItems,
        };
        return { ...old, days: updatedDays };
      });

      try {
        await api.reorderItems(activeDay.id, reorderedIds);
        queryClient.invalidateQueries({ queryKey: ['trip', tripId] });
      } catch {
        queryClient.invalidateQueries({ queryKey: ['trip', tripId] });
      }
    }
  };

  const handleOpenAlternatives = async (item: ItineraryItem) => {
    setAlternativesItem(item);
    setLoadingAlternatives(true);
    try {
      const res = await api.suggestAlternatives(item.id);
      setAlternativesList(res.alternatives);
    } catch {
      setAlternativesList([]);
    } finally {
      setLoadingAlternatives(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          Loading itinerary schedule...
        </p>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Trip Not Found</h3>
        <p className="text-xs text-slate-500 mt-1">
          This itinerary may have been deleted or the link is expired.
        </p>
        <button
          onClick={() => navigate('/dashboard')}
          className="mt-4 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const typeColor = {
    solo: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
    couple: 'bg-rose-100 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300 border-rose-200 dark:border-rose-800',
    group: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
  }[trip.trip_type] || 'bg-slate-100 text-slate-700';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Back & Header */}
      <div>
        <button
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 mb-3 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Dashboard</span>
        </button>

        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-lg border ${typeColor}`}>
                  {trip.trip_type}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 capitalize">
                  {trip.pace} Pace
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 capitalize">
                  {trip.status}
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

            {/* Action Bar */}
            <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-auto shrink-0">
              <button
                onClick={() => setMembersModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shadow-2xs"
              >
                <Users className="w-3.5 h-3.5 text-indigo-500" />
                <span>Group ({trip.members.length})</span>
              </button>

              <button
                onClick={() => setShareModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shadow-2xs"
              >
                <Share2 className="w-3.5 h-3.5 text-indigo-500" />
                <span>Share & Export</span>
              </button>

              {activeDay && (
                <button
                  onClick={() => setRegenerateDayModal(activeDay)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors shadow-2xs"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Regenerate Day</span>
                </button>
              )}

              <button
                onClick={() => setEditItemModal({ dayId: activeDay?.id || '' })}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-600/30 transition-all hover:scale-[1.02]"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Stop</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Day Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {trip.days.map((day, idx) => {
          const isActive = idx === activeDayIndex;
          const lockedCount = day.items.filter(i => i.is_locked).length;

          return (
            <button
              key={day.id}
              onClick={() => {
                setActiveDayIndex(idx);
                setSelectedItemId(null);
              }}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25 scale-[1.02]'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/90 dark:border-slate-800'
              }`}
            >
              <div className="flex flex-col text-left">
                <span className="text-[11px] font-extrabold uppercase tracking-wider">
                  Day {day.day_number}
                </span>
                <span className={`text-[10px] ${isActive ? 'text-indigo-100' : 'text-slate-400'}`}>
                  {day.date}
                </span>
              </div>

              {lockedCount > 0 && (
                <div
                  title={`${lockedCount} locked stop(s)`}
                  className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] ${
                    isActive ? 'bg-indigo-700 text-amber-300' : 'bg-slate-100 dark:bg-slate-800 text-amber-500'
                  }`}
                >
                  <Lock className="w-2.5 h-2.5" />
                  <span>{lockedCount}</span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Main 2-Column Grid: Timeline (Left) & Map + Analytics (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Itinerary Timeline (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {activeDay && (
            <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Day {activeDay.day_number}: {activeDay.title || activeDay.date}
                </h3>
                {activeDay.theme && (
                  <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold mt-0.5">
                    Theme: {activeDay.theme}
                  </p>
                )}
              </div>
              <div className="text-xs font-bold text-slate-500 bg-slate-50 dark:bg-slate-800/80 px-2.5 py-1 rounded-lg">
                {activeItems.length} stops scheduled
              </div>
            </div>
          )}

          {activeItems.length === 0 ? (
            <div className="py-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 p-6">
              <Layers className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-slate-800 dark:text-white">No stops for this day</h4>
              <p className="text-xs text-slate-500 mt-1">Add your first stop or regenerate the day with AI.</p>
              <button
                onClick={() => setEditItemModal({ dayId: activeDay?.id || '' })}
                className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-indigo-600"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Stop</span>
              </button>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={activeItems.map(i => i.id)}
                strategy={verticalListSortingStrategy}
              >
                <div>
                  {activeItems.map((item, idx) => (
                    <TimelineCard
                      key={item.id}
                      item={item}
                      index={idx}
                      isSelected={selectedItemId === item.id}
                      onSelect={() => setSelectedItemId(item.id)}
                      onToggleLock={(id) => toggleLockMutation.mutate(id)}
                      onSuggestAlternatives={handleOpenAlternatives}
                      onEdit={(it) => setEditItemModal({ item: it, dayId: activeDay?.id || '' })}
                      onDelete={(id) => deleteItemMutation.mutate(id)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}

          {/* Quick add stop button at bottom of timeline */}
          {activeDay && (
            <button
              onClick={() => setEditItemModal({ dayId: activeDay.id })}
              className="w-full py-3 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 text-xs font-bold text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center justify-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Stop to Day {activeDay.day_number}</span>
            </button>
          )}
        </div>

        {/* Right Column: Map & Cost Tracker (5 cols) */}
        <div className="lg:col-span-5 space-y-6 sticky top-20">
          {/* Interactive Map */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Route & Neighborhood Map
              </span>
              <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold">
                Day {activeDay?.day_number || 1} Highlights
              </span>
            </div>
            <TripMap
              items={activeItems}
              destination={trip.destination}
              selectedItemId={selectedItemId}
              onSelectItem={(id) => setSelectedItemId(id)}
              height="380px"
            />
          </div>

          {/* Cost Tracker Sidebar with Recharts */}
          <CostTrackerSidebar
            costSummary={costSummary || null}
            isLoading={loadingCost}
          />
        </div>
      </div>

      {/* Modals */}
      {alternativesItem && (
        <AlternativesModal
          originalItem={alternativesItem}
          alternatives={alternativesList}
          isLoading={loadingAlternatives}
          onSwap={async (alt) => {
            await swapAlternativeMutation.mutateAsync({
              origItemId: alternativesItem.id,
              alt,
            });
          }}
          onClose={() => setAlternativesItem(null)}
        />
      )}

      {regenerateDayModal && (
        <RegenerateModal
          day={regenerateDayModal}
          onRegenerate={async (instructions) => {
            await regenerateMutation.mutateAsync({
              dayId: regenerateDayModal.id,
              instructions,
            });
          }}
          onClose={() => setRegenerateDayModal(null)}
        />
      )}

      {editItemModal && (
        <ItemEditModal
          item={editItemModal.item}
          dayId={editItemModal.dayId}
          onSave={async (data) => {
            await saveItemMutation.mutateAsync(data);
          }}
          onClose={() => setEditItemModal(null)}
        />
      )}

      {membersModalOpen && (
        <GroupMembersModal
          tripId={trip.id}
          members={trip.members}
          onAddMember={async (m) => {
            await api.addMember(trip.id, m);
            queryClient.invalidateQueries({ queryKey: ['trip', tripId] });
          }}
          onRemoveMember={async (mId) => {
            await api.removeMember(trip.id, mId);
            queryClient.invalidateQueries({ queryKey: ['trip', tripId] });
          }}
          onClose={() => setMembersModalOpen(false)}
        />
      )}

      {shareModalOpen && (
        <ShareModal
          tripId={trip.id}
          shareToken={trip.share_token}
          tripTitle={trip.title}
          onClose={() => setShareModalOpen(false)}
        />
      )}
    </div>
  );
};
