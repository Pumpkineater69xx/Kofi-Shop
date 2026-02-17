
import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { CurbsideItem, MapPosition } from '../types';
import { MAP_BOUNDS } from '../constants.tsx';

interface MapViewProps {
  items: CurbsideItem[];
  center: MapPosition;
  onMapClick: (pos: MapPosition) => void;
  onItemClick: (item: CurbsideItem) => void;
  selectedItemId?: string;
}

const MapView: React.FC<MapViewProps> = ({ items, center, onMapClick, onItemClick, selectedItemId }) => {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      zoomControl: false,
      attributionControl: false,
      maxBounds: MAP_BOUNDS,
      maxBoundsViscosity: 1.0
    }).setView([center.lat, center.lng], 14);
    
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 20,
      minZoom: 3,
      bounds: MAP_BOUNDS
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    map.on('click', (e: L.LeafletMouseEvent) => {
      onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng });
    });

    mapRef.current = map;

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    // Remove markers that are no longer in the list
    Object.keys(markersRef.current).forEach(id => {
      if (!items.find(i => i.id === id)) {
        markersRef.current[id].remove();
        delete markersRef.current[id];
      }
    });

    // Add/Update markers
    items.forEach(item => {
      const isSelected = item.id === selectedItemId;
      const isFound = item.isFound;
      
      const colorHex = isFound ? '#94a3b8' : // Gray for found
                       item.category === 'Furniture' ? '#f59e0b' :
                       item.category === 'Books' ? '#3b82f6' :
                       item.category === 'Toys' ? '#ef4444' :
                       item.category === 'Electronics' ? '#a855f7' :
                       item.category === 'Clothing' ? '#22c55e' : '#64748b';

      const icon = L.divIcon({
        className: 'custom-marker',
        html: `
          <div class="relative flex items-center justify-center ${isSelected ? 'active-marker' : ''} ${isFound ? 'opacity-60' : ''}">
            <div class="absolute w-10 h-10 bg-white rounded-full shadow-lg border-2 border-[${colorHex}] flex items-center justify-center transition-all">
              <span class="text-xl ${isFound ? 'grayscale' : ''}">${item.category === 'Furniture' ? '🛋️' : 
                                    item.category === 'Books' ? '📚' : 
                                    item.category === 'Toys' ? '🧸' : 
                                    item.category === 'Electronics' ? '🔌' : 
                                    item.category === 'Clothing' ? '👕' : '📦'}</span>
            </div>
            ${isSelected ? `<div class="absolute w-12 h-12 rounded-full border-4 border-blue-400 opacity-50"></div>` : ''}
            ${isFound ? `<div class="absolute -top-1 -right-1 bg-slate-500 text-white text-[8px] rounded-full px-1 font-bold">FOUND</div>` : ''}
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20]
      });

      if (markersRef.current[item.id]) {
        markersRef.current[item.id].setIcon(icon);
        markersRef.current[item.id].setLatLng([item.latitude, item.longitude]);
      } else {
        const marker = L.marker([item.latitude, item.longitude], { icon })
          .addTo(mapRef.current!)
          .on('click', (e) => {
            L.DomEvent.stopPropagation(e);
            onItemClick(item);
          });
        markersRef.current[item.id] = marker;
      }
    });
  }, [items, selectedItemId]);

  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.panTo([center.lat, center.lng], { animate: true });
    }
  }, [center]);

  return <div ref={containerRef} className="h-full w-full" />;
};

export default MapView;
