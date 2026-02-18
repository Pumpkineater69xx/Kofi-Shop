import React from 'react';
import { CurbsideItem, UserProfile } from '../types';
import { CATEGORY_COLORS } from '../constants';
import { getAnimalIcon } from '../services/profileService';

interface SidebarProps {
  items: CurbsideItem[];
  selectedItem: CurbsideItem | null;
  currentUser: UserProfile;
  onSelectItem: (item: CurbsideItem) => void;
  onMarkFound: (id: string) => void;
  onCloseDetail: () => void;
  onToggleMap: () => void; // New prop to handle switching back to map on mobile
}

const Sidebar: React.FC<SidebarProps> = ({ items, selectedItem, currentUser, onSelectItem, onMarkFound, onCloseDetail, onToggleMap }) => {
  const sortedItems = [...items].sort((a, b) => {
    if (a.isFound !== b.isFound) return a.isFound ? 1 : -1;
    return b.createdAt - a.createdAt;
  });

  return (
    <div className="w-full h-full bg-slate-50 flex flex-col shadow-2xl border-r border-slate-200">
      {/* MOBILE STICKY HEADER - This ensures the button is always visible on phones */}
      <div className="md:hidden sticky top-0 z-[50] bg-blue-600 text-white p-4 flex items-center justify-between shadow-lg">
        <button onClick={onToggleMap} className="flex items-center gap-2 font-black text-sm uppercase tracking-widest">
           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7"></path></svg>
           Back to Map
        </button>
        <div className="flex items-center gap-2">
           <span className="text-xs font-bold bg-white/20 px-2 py-1 rounded-lg">{items.length} Spots</span>
        </div>
      </div>

      <div className="p-8 pb-6 bg-white border-b border-slate-100 hidden md:block">
        <div className="flex items-center justify-between mb-2">
           <h1 className="text-2xl font-black text-slate-800 tracking-tight">Curbside</h1>
           <div className={`w-8 h-8 ${currentUser.avatarColor} rounded-lg flex items-center justify-center text-sm shadow-sm`}>
             {getAnimalIcon(currentUser.animal)}
           </div>
        </div>
        <p className="text-slate-500 text-sm">Hello, <span className="font-bold text-slate-700">{currentUser.name}</span>!</p>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-6">
        {selectedItem ? (
          <div className="animate-in slide-in-from-left duration-300">
            <button 
              onClick={onCloseDetail}
              className="mb-6 flex items-center text-sm font-bold text-slate-400 hover:text-blue-600 transition-colors group"
            >
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center mr-2 group-hover:bg-blue-50 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
              </div>
              Close Details
            </button>
            
            <div className={`bg-white rounded-3xl overflow-hidden shadow-xl border border-slate-100 transition-all ${selectedItem.isFound ? 'opacity-80 grayscale-[0.5]' : ''}`}>
              {selectedItem.imageUrl ? (
                <div className="aspect-square w-full relative">
                   <img src={selectedItem.imageUrl} alt={selectedItem.title} className="w-full h-full object-cover" />
                   <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase text-white tracking-widest ${selectedItem.isFound ? 'bg-slate-500' : CATEGORY_COLORS[selectedItem.category]}`}>
                        {selectedItem.category}
                      </span>
                   </div>
                </div>
              ) : (
                <div className="w-full aspect-video bg-slate-100 flex flex-col items-center justify-center text-slate-400">
                  <span className="text-4xl mb-2">📦</span>
                </div>
              )}
              
              <div className="p-8 pt-6 space-y-4">
                <h3 className="text-2xl font-bold text-slate-900 leading-tight">{selectedItem.title}</h3>
                <p className="text-slate-600 leading-relaxed text-sm">{selectedItem.description || "No description."}</p>
                
                <div className="pt-6 border-t border-slate-100">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-xl">
                       {getAnimalIcon(selectedItem.reporterAnimal || 'Other')}
                    </div>
                    <div>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Spotted By</p>
                       <p className="text-sm font-bold text-slate-700">{selectedItem.reporter}</p>
                    </div>
                  </div>
                  
                  {!selectedItem.isFound && (
                    <button 
                      onClick={() => onMarkFound(selectedItem.id)}
                      className="w-full bg-slate-900 hover:bg-blue-600 text-white font-black py-4 rounded-2xl transition-all shadow-xl active:scale-95"
                    >
                      I found it! ✨
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between px-2 mb-4">
              <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Latest Finds</h2>
            </div>
            
            {sortedItems.length === 0 ? (
              <div className="text-center py-20 px-6">
                <span className="text-4xl block mb-4">🏙️</span>
                <p className="text-slate-400 text-sm font-medium">No items reported yet. Be the first!</p>
              </div>
            ) : (
              <div className="grid gap-4 pb-24">
                {sortedItems.map(item => (
                  <div 
                    key={item.id}
                    onClick={() => onSelectItem(item)}
                    className={`bg-white p-4 rounded-3xl border border-slate-100 shadow-sm hover:shadow-lg cursor-pointer transition-all flex items-center gap-4 ${item.isFound ? 'opacity-60 bg-slate-50' : ''}`}
                  >
                    <div className="w-16 h-16 rounded-2xl bg-slate-50 flex-shrink-0 overflow-hidden flex items-center justify-center border border-slate-50">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-2xl">{getAnimalIcon(item.reporterAnimal || 'Other')}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                         <span className={`w-1.5 h-1.5 rounded-full ${CATEGORY_COLORS[item.category]}`}></span>
                         <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{item.category}</span>
                      </div>
                      <h4 className={`font-bold text-slate-900 truncate ${item.isFound ? 'line-through text-slate-400' : ''}`}>{item.title}</h4>
                      <p className="text-[10px] text-slate-400 font-medium">
                        {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Sidebar;