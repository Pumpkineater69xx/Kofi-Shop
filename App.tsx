import React, { useState, useEffect, useCallback } from 'react';
import { CurbsideItem, MapPosition, UserProfile } from './types';
import Sidebar from './components/Sidebar';
import MapView from './components/MapView';
import AddItemModal from './components/AddItemModal';
import Onboarding from './components/Onboarding';
import { DEFAULT_CENTER, MAP_BOUNDS } from './constants';
import { fetchItemsFromCloud, saveItemToCloud, updateItemInCloud } from './services/supabase';

const STORAGE_KEY = 'curbside_finds_v2';
const USER_KEY = 'curbside_user_v1';
const EXPIRATION_MS = 24 * 60 * 60 * 1000;

const App: React.FC = () => {
  const [items, setItems] = useState<CurbsideItem[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [selectedItem, setSelectedItem] = useState<CurbsideItem | null>(null);
  const [mapCenter, setMapCenter] = useState<MapPosition>(DEFAULT_CENTER);
  const [clickPos, setClickPos] = useState<MapPosition | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [showListOnMobile, setShowListOnMobile] = useState(false);
  const [userLocation, setUserLocation] = useState<MapPosition | null>(null);

  // Initial Data Fetch
  useEffect(() => {
    const savedUser = localStorage.getItem(USER_KEY);
    if (savedUser) {
      try { setCurrentUser(JSON.parse(savedUser)); } catch (e) { console.error(e); }
    }

    const syncItems = async () => {
      // 1. Load from local first for speed
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try { setItems(JSON.parse(saved)); } catch (e) { console.error(e); }
      }

      // 2. Fetch from cloud for freshness (cross-device sync)
      const cloudItems = await fetchItemsFromCloud();
      if (cloudItems) {
        setItems(cloudItems);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cloudItems));
      }
    };

    syncItems();

    // Set up auto-sync every 30 seconds
    const syncInterval = setInterval(syncItems, 30000);
    return () => clearInterval(syncInterval);
  }, []);

  // Location logic
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          if (loc.lat >= MAP_BOUNDS[0][0] && loc.lat <= MAP_BOUNDS[1][0] && 
              loc.lng >= MAP_BOUNDS[0][1] && loc.lng <= MAP_BOUNDS[1][1]) {
            setUserLocation(loc);
            setMapCenter(loc);
          }
        },
        () => console.warn("Location permission denied")
      );
    }
  }, []);

  const handleOnboardingComplete = (profile: UserProfile) => {
    setCurrentUser(profile);
    localStorage.setItem(USER_KEY, JSON.stringify(profile));
  };

  const handleMapClick = useCallback((pos: MapPosition) => {
    setClickPos(pos);
    setIsAdding(true);
  }, []);

  const handleSelectItem = useCallback((item: CurbsideItem) => {
    setSelectedItem(item);
    setMapCenter({ lat: item.latitude, lng: item.longitude });
    setShowListOnMobile(true);
  }, []);

  const handleSaveItem = async (itemData: Omit<CurbsideItem, 'id' | 'createdAt' | 'isFound'>) => {
    const newItem: CurbsideItem = {
      ...itemData,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: Date.now(),
      isFound: false,
      reporter: currentUser?.name || 'Anonymous',
      reporterAnimal: currentUser?.animal
    };
    
    // Save locally
    setItems(prev => [newItem, ...prev]);
    setIsAdding(false);
    setClickPos(null);
    setSelectedItem(newItem);

    // Save to Cloud
    await saveItemToCloud(newItem);
  };

  const handleMarkFound = async (id: string) => {
    const foundAt = Date.now();
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, isFound: true, foundAt } : item
    ));
    setSelectedItem(null);
    
    // Sync update to cloud
    await updateItemInCloud(id, { isFound: true, foundAt });
  };

  if (!currentUser) return <Onboarding onComplete={handleOnboardingComplete} />;

  return (
    <div className="flex flex-col md:flex-row h-screen w-screen overflow-hidden bg-white relative">
      {/* Sidebar Container */}
      <div className={`
        fixed inset-0 z-[1500] md:relative md:inset-auto md:z-10 md:w-[400px] transition-transform duration-300 ease-in-out
        ${showListOnMobile ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <Sidebar 
          items={items} 
          selectedItem={selectedItem}
          currentUser={currentUser}
          onSelectItem={handleSelectItem}
          onMarkFound={handleMarkFound}
          onCloseDetail={() => setSelectedItem(null)}
          onToggleMap={() => setShowListOnMobile(false)}
        />
      </div>

      <main className="flex-1 relative h-full w-full">
        <MapView 
          items={items} 
          center={mapCenter} 
          onMapClick={handleMapClick}
          onItemClick={handleSelectItem}
          selectedItemId={selectedItem?.id}
        />

        {/* Floating Controls */}
        <div className="absolute top-4 right-4 z-[1000] space-y-2">
          <button 
            onClick={() => userLocation && setMapCenter(userLocation)}
            className="w-12 h-12 bg-white/95 rounded-2xl shadow-xl flex items-center justify-center text-blue-600 border border-slate-200 active:scale-90 transition-all"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg>
          </button>
        </div>

        {/* Mobile FAB to see list */}
        {!showListOnMobile && (
          <button 
            onClick={() => setShowListOnMobile(true)}
            className="md:hidden absolute bottom-10 left-1/2 -translate-x-1/2 z-[1000] px-8 py-4 bg-slate-900 text-white rounded-full shadow-2xl font-black flex items-center gap-3 active:scale-95 transition-all"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 6h16M4 12h16M4 18h16"></path></svg>
            Show List
          </button>
        )}
      </main>

      {isAdding && (
        <AddItemModal 
          position={clickPos} 
          onClose={() => { setIsAdding(false); setClickPos(null); }}
          onSave={handleSaveItem}
        />
      )}
    </div>
  );
};

export default App;