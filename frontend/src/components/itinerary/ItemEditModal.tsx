import React, { useState } from 'react';
import { X, Save, Plus } from 'lucide-react';
import { ItineraryItem, ItemType, TravelMode } from '../../types';

interface ItemEditModalProps {
  item?: ItineraryItem | null;
  dayId: string;
  onSave: (data: Partial<ItineraryItem>) => Promise<void>;
  onClose: () => void;
}

export const ItemEditModal: React.FC<ItemEditModalProps> = ({
  item,
  dayId,
  onSave,
  onClose,
}) => {
  const isEditing = !!item;

  const [title, setTitle] = useState(item?.title || '');
  const [type, setType] = useState<ItemType>(item?.type || 'attraction');
  const [locationName, setLocationName] = useState(item?.location_name || '');
  const [lat, setLat] = useState(item?.lat || 48.8566);
  const [lng, setLng] = useState(item?.lng || 2.3522);
  const [startTime, setStartTime] = useState(item?.start_time || '10:00');
  const [durationMinutes, setDurationMinutes] = useState(item?.duration_minutes || 60);
  const [cost, setCost] = useState(item?.cost || 0);
  const [description, setDescription] = useState(item?.description || '');
  const [tips, setTips] = useState(item?.tips || '');
  const [travelMode, setTravelMode] = useState<TravelMode>(item?.travel_mode || 'walking');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSave({
        day_id: dayId,
        title,
        type,
        location_name: locationName,
        lat: Number(lat),
        lng: Number(lng),
        start_time: startTime,
        duration_minutes: Number(durationMinutes),
        cost: Number(cost),
        description,
        tips,
        travel_mode: travelMode,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 overflow-hidden">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
            {isEditing ? 'Edit Stop Details' : 'Add New Stop'}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 max-h-[75vh] overflow-y-auto pr-1">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Louvre Museum & Courtyard"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Category
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as ItemType)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="attraction">Attraction</option>
                <option value="dining">Dining</option>
                <option value="activity">Activity</option>
                <option value="transport">Transport</option>
                <option value="accommodation">Accommodation</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Est. Cost ($)
              </label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={cost}
                onChange={(e) => setCost(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Location Name
            </label>
            <input
              type="text"
              required
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              placeholder="e.g. Rue de Rivoli, 75001 Paris"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Start Time
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Duration (minutes)
              </label>
              <input
                type="number"
                min="15"
                step="15"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Insider Tip
            </label>
            <input
              type="text"
              value={tips}
              onChange={(e) => setTips(e.target.value)}
              placeholder="e.g. Enter through the Carrousel entrance to skip long lines"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-indigo-500"
            />
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
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-600/30 disabled:opacity-50 transition-all"
            >
              {isEditing ? <Save className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              <span>{isSubmitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Add Stop'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
