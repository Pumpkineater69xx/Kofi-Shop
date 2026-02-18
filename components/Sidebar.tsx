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
}

const Sidebar: React.FC<SidebarProps> = ({ items, selectedItem, currentUser, onSelectItem, onMarkFound, onCloseDetail }) => {
  const sortedItems = [...items].sort((a, b) => {
    if (a.isFound !== b.isFound) return a.isFound ? 1 : -1;
    return b.createdAt - a.createdAt;
  });

  const getRemainingTime = (foundAt?: number) => {
    if (!foundAt) return null;
    const expiresAt = foundAt + (24 * 60 * 60 * 1000);
    const diff = expiresAt - Date.now();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    return hours > 0 ? `${hours}h left` : '< 1h left';
  };

  return (
    <div className="w-full h-full bg-slate-50 flex flex-col shadow-2xl border-r border-slate-200">
      <div className="p-8 pb-6 bg-white border-b border-slate-100">
        <div className="flex items-center justify-between mb-2">
           <h1 className="text-2xl font-black text-slate-800 tracking-tight">Curbside</h1>
           <div className="flex items-center gap-2">
             <div className={`w-8 h-8 ${currentUser.avatarColor} rounded-lg flex items-center justify-center text-sm shadow-sm`}>
               {getAnimalIcon(currentUser.animal)}
             </div>
           </div>
        </div>
        <p className="text-slate-500 text-sm">Hello, <span className="font-bold text-slate-700">{currentUser.name}</span>! Ready to hunt?</p>
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
              Back to local finds
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
                   {selectedItem.isFound && (
                     <div className="absolute top-6 right-6 bg-slate-900 text-white px-4 py-2 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl">
                       Collected
                     </div>
                   )}
                </div>
              ) : (
                <div className="w-full aspect-video bg-slate-100 flex flex-col items-center justify-center text-slate-400">
                  <span className="text-4xl mb-2">📦</span>
                  <p className="text-xs font-medium">No photo provided</p>
                </div>
              )}
              
              <div className="p-8 pt-6 space-y-4">
                <h3 className="text-2xl font-bold text-slate-900 leading-tight">
                  {selectedItem.title}
                  {selectedItem.isFound && <span className="ml-2 text-slate-400 font-medium">(Found)</span>}
                </h3>
                <p className="text-slate-600 leading-relaxed text-sm">
                  {selectedItem.description || "No description provided."}
                </p>
                
                <div className="pt-6 border-t border-slate-100">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center">
                       <span className="text-xl">{getAnimalIcon(selectedItem.reporterAnimal || 'Other')}</span>
                    </div>
                    <div>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Spotted By</p>
                       <p className="text-sm font-bold text-slate-700">{selectedItem.reporter}</p>
                    </div>
                  </div>
                  
                  {selectedItem.isFound ? (
                    <div className="w-full bg-slate-100 text-slate-500 font-bold py-4 rounded-2xl flex items-center justify-center gap-2">
                      <span>✓</span> This item was picked up!
                    </div>
                  ) : (
                    <button 
                      onClick={() => onMarkFound(selectedItem.id)}
                      className="w-full bg-slate-900 hover:bg-blue-600 text-white font-black py-4 rounded-2xl transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2 group"
                    >
                      I found it! 
                      <span className="group-hover:translate-x-1 transition-transform">✨</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between px-2">
              <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Latest Spots</h2>
              <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full">{sortedItems.length} Spots</span>
            </div>

            {sortedItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center px-6">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm border border-slate-100">
                   <span className="text-4xl">🏙️</span>
                </div>
                <h4 className="text-lg font-bold text-slate-800 mb-2">Neighborhood is quiet</h4>
                <p className="text-slate-400 text-sm">Tap anywhere on the map to mark a free item you've spotted on the curb.</p>
              </div>
            ) : (
              <div className="grid gap-4 pb-10">
                {sortedItems.map(item => (
                  <div 
                    key={item.id}
                    onClick={() => onSelectItem(item)}
                    className={`group bg-white p-4 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:ring-2 hover:ring-blue-100 cursor-pointer transition-all duration-300 flex items-center gap-4 ${item.isFound ? 'opacity-60 bg-slate-50 grayscale-[0.3]' : ''}`}
                  >
                    <div className="w-16 h-16 rounded-2xl bg-slate-50 flex-shrink-0 overflow-hidden relative border border-slate-50 flex items-center justify-center">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      ) : (
                        <span className="text-2xl">{getAnimalIcon(item.reporterAnimal || 'Other')}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                         <span className={`w-1.5 h-1.5 rounded-full ${item.isFound ? 'bg-slate-300' : CATEGORY_COLORS[item.category]}`}></span>
                         <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{item.category}</span>
                      </div>
                      <h4 className={`font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors ${item.isFound ? 'line-through decoration-slate-300 text-slate-500' : ''}`}>{item.title}</h4>
                      <div className="flex items-center gap-1 mt-0.5">
                        <svg className="w-3 h-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                      </div>
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