
import React, { useState } from 'react';
import { UserProfile } from '../types';
import { generateRandomProfile, getAnimalIcon } from '../services/profileService';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [profile, setProfile] = useState<UserProfile>(generateRandomProfile());

  const handleRegenerate = () => {
    setProfile(generateRandomProfile());
  };

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-slate-900 p-4">
      <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-sm overflow-hidden p-10 text-center animate-in fade-in zoom-in duration-500">
        <div className="mb-8">
          <div className="w-16 h-1 bg-slate-100 mx-auto rounded-full mb-8"></div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Welcome to Curbside</h1>
          <p className="text-slate-500 text-sm">Join the community to start spotting treasures.</p>
        </div>

        <div className="relative mb-10 group">
          <div className={`w-32 h-32 ${profile.avatarColor} mx-auto rounded-[40px] flex items-center justify-center text-6xl shadow-inner transition-all transform group-hover:scale-110 duration-300`}>
            {getAnimalIcon(profile.animal)}
          </div>
          <button 
            onClick={handleRegenerate}
            className="absolute bottom-0 right-1/2 translate-x-16 bg-white shadow-lg border border-slate-100 p-3 rounded-2xl hover:bg-slate-50 transition-colors active:scale-90"
            title="Generate New Profile"
          >
            <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
          </button>
        </div>

        <div className="mb-10">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Your Identity</p>
          <h2 className="text-2xl font-black text-slate-800">{profile.name}</h2>
        </div>

        <button 
          onClick={() => onComplete(profile)}
          className="w-full bg-slate-900 hover:bg-blue-600 text-white font-black py-5 rounded-[24px] transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2 group"
        >
          Enter the Neighborhood
          <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path></svg>
        </button>
      </div>
    </div>
  );
};

export default Onboarding;
