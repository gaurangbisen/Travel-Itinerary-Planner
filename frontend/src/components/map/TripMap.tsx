import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { ItineraryItem } from '../../types';

interface TripMapProps {
  items: ItineraryItem[];
  destination: string;
  selectedItemId?: string | null;
  onSelectItem?: (itemId: string) => void;
  height?: string;
}

export const TripMap: React.FC<TripMapProps> = ({
  items,
  destination,
  selectedItemId,
  onSelectItem,
  height = '420px',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [id: string]: L.Marker }>({});
  const polylineRef = useRef<L.Polyline | null>(null);

  // Category color mapping
  const categoryColors: { [key: string]: string } = {
    attraction: '#4f46e5', // indigo
    dining: '#ea580c',     // orange
    accommodation: '#059669', // emerald
    transport: '#0284c7',  // sky
    activity: '#7c3aed',   // purple
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Default to Europe center before items load
      const map = L.map(mapContainerRef.current, {
        zoomControl: true,
        scrollWheelZoom: true,
      }).setView([48.8566, 2.3522], 13);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Clear existing markers and polyline
    Object.values(markersRef.current).forEach(marker => marker.remove());
    markersRef.current = {};
    if (polylineRef.current) {
      polylineRef.current.remove();
      polylineRef.current = null;
    }

    if (!items || items.length === 0) return;

    const coordinates: [number, number][] = [];
    const bounds = L.latLngBounds([]);

    items.forEach((item, index) => {
      if (item.lat && item.lng) {
        const color = categoryColors[item.type] || '#4f46e5';
        const isSelected = selectedItemId === item.id;

        const customIcon = L.divIcon({
          className: 'custom-pin-marker',
          html: `
            <div class="pin-bubble" style="
              background-color: ${color}; 
              ${isSelected ? 'transform: scale(1.3); border-color: #facc15; box-shadow: 0 0 12px rgba(250, 204, 21, 0.8);' : ''}
            ">
              ${index + 1}
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
          popupAnchor: [0, -18],
        });

        const marker = L.marker([item.lat, item.lng], { icon: customIcon }).addTo(map);

        const popupContent = `
          <div style="font-family: inherit; padding: 2px;">
            <div style="font-size: 10px; font-weight: 700; color: ${color}; text-transform: uppercase;">
              ${item.type} • Stop #${index + 1}
            </div>
            <div style="font-size: 14px; font-weight: 700; color: #1e293b; margin-top: 2px;">
              ${item.title}
            </div>
            <div style="font-size: 12px; color: #64748b; margin-top: 2px;">
              📍 ${item.location_name}
            </div>
            <div style="font-size: 11px; color: #334155; margin-top: 4px;">
              ⏰ <strong>${item.start_time} - ${item.end_time}</strong> (${item.duration_minutes} min)
            </div>
            <div style="font-size: 11px; color: #047857; margin-top: 2px;">
              💵 Est. Cost: <strong>$${item.cost.toFixed(2)}</strong>
            </div>
            ${item.tips ? `<div style="font-size: 11px; color: #d97706; margin-top: 4px; background: #fffbeb; padding: 4px 6px; border-radius: 4px;">💡 ${item.tips}</div>` : ''}
          </div>
        `;

        marker.bindPopup(popupContent);

        marker.on('click', () => {
          if (onSelectItem) onSelectItem(item.id);
        });

        markersRef.current[item.id] = marker;
        coordinates.push([item.lat, item.lng]);
        bounds.extend([item.lat, item.lng]);
      }
    });

    // Draw route polyline between ordered stops
    if (coordinates.length > 1) {
      polylineRef.current = L.polyline(coordinates, {
        color: '#6366f1',
        weight: 3.5,
        opacity: 0.75,
        dashArray: '6, 8',
      }).addTo(map);
    }

    // Auto-fit map to show all items
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [45, 45], maxZoom: 15 });
    }
  }, [items, selectedItemId]);

  return (
    <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm">
      <div ref={mapContainerRef} style={{ height, width: '100%' }} className="z-10" />
      <div className="absolute top-3 right-3 z-20 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-300 shadow-sm flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span>{items.length} stops mapped</span>
      </div>
    </div>
  );
};
