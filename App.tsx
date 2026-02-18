import React, { useState, useEffect, useCallback } from 'react';
import { CurbsideItem, MapPosition, UserProfile } from './types';
import Sidebar from './components/Sidebar';
import MapView from './components/MapView';
import AddItemModal from './components/AddItemModal';
import Onboarding from './components/Onboarding';
import { DEFAULT_CENTER, MAP_BOUNDS } from './constants';

const STORAGE_KEY = 'curbside_finds_v2';
const USER_KEY = 'curbside_user_v1';
const EXPIRATION_MS = 24 * 60 * 60 * 1000; // 24 hours

const App: React.FC = () => {
  const [items, setItems] = useState<CurbsideItem[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [selectedItem, setSelectedItem] = useState<CurbsideItem | null>(null);
  const [mapCenter, setMapCenter] = useState<MapPosition>(DEFAULT_CENTER);
  const [clickPos, setClickPos] = useState<MapPosition | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [showListOnMobile, setShowListOnMobile] = useState(false);
  const [userLocation, setUserLocation] = useState<MapPosition | null>(null);

  useEffect(() => {
    // Load User
    const savedUser = localStorage.getItem(USER_KEY);
    if (savedUser) {
      try { setCurrentUser(JSON.parse(savedUser)); } catch (e) { console.error(e); }
    }

    // Load Items
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try { 
        const parsed: CurbsideItem[] = JSON.parse(saved);
        const now = Date.now();
        const validItems = parsed.filter(item => {
          if (item.isFound && item.foundAt) {
            return (now - item.foundAt) < EXPIRATION_MS;
          }
          return true;
        });
        setItems(validItems); 
      } catch (e) { 
        console.error(e); 
      }
    }

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          
          if (lat >= MAP_BOUNDS[0][0] && lat <= MAP_BOUNDS[1][0] && 
              lng >= MAP_BOUNDS[0][1] && lng <= MAP_BOUNDS[1][1]) {
            const loc = { lat, lng };
            setUserLocation(loc);
            setMapCenter(loc);
          } else {
            console.log("User location outside specified region.");
          }
        },
        () => console.warn("Location permission denied")
      );
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setItems(prev => prev.filter(item => {
        if (item.isFound && item.foundAt) {
          return (now - item.foundAt) < EXPIRATION_MS;
        }
        return true;
      }));
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

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

  const handleSaveItem = (itemData: Omit<CurbsideItem, 'id' | 'createdAt' | 'isFound'>) => {
    const newItem: CurbsideItem = {
      ...itemData,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: Date.now(),
      isFound: false,
      reporter: currentUser?.name || 'Anonymous User',
      reporterAnimal: currentUser?.animal
    };
    setItems(prev => [newItem, ...prev]);
    setIsAdding(false);
    setClickPos(null);
    setSelectedItem(newItem);
  };

  const handleMarkFound = (id: string) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, isFound: true, foundAt: Date.now() } : item
    ));
    setSelectedItem(null);
  };

  if (!currentUser) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="flex flex-col md:flex-row h-screen w-screen overflow-hidden bg-white">
      <div className={`
        fixed inset-y-0 left-0 z-[1500] w-full md:relative md:w-[400px] transition-transform duration-300 ease-in-out
        ${showListOnMobile ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <Sidebar 
          items={items} 
          selectedItem={selectedItem}
          currentUser={currentUser}
          onSelectItem={handleSelectItem}
          onMarkFound={handleMarkFound}
          onCloseDetail={() => {
            setSelectedItem(null);
            setShowListOnMobile(false);
          }}
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

        <div className="absolute top-4 right-4 z-[1000] space-y-2">
          <button 
            onClick={() => userLocation && setMapCenter(userLocation)}
            className="w-12 h-12 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl flex items-center justify-center text-blue-600 hover:bg-white transition-all active:scale-95 border border-white/50"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
          </button>
        </div>

        <button 
          onClick={() => setShowListOnMobile(!showListOnMobile)}
          className="md:hidden absolute bottom-6 right-6 z-[1000] px-6 py-3 bg-blue-600 text-white rounded-full shadow-2xl font-bold flex items-center gap-2 active:scale-95 transition-all"
        >
          {showListOnMobile ? (
            <><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-7-7 7-7m8 14l-7-7 7-7"></path></svg> Back to Map</>
          ) : (
            <><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg> View List</>
          )}
        </button>

        {!isAdding && !selectedItem && !showListOnMobile && (
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[1000] pointer-events-none">
            <div className="bg-slate-900/80 backdrop-blur-sm text-white px-5 py-2.5 rounded-2xl text-sm font-medium flex items-center gap-2 shadow-2xl border border-white/10">
              <span className="text-lg">📍</span> Tap the map to report a find
            </div>
          </div>
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
