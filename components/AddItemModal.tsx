import React, { useState, useRef } from 'react';
import { Category, CurbsideItem } from '../types';
import { CATEGORIES } from '../constants';
import { analyzeItemImage } from '../services/geminiService';

interface AddItemModalProps {
  position: { lat: number; lng: number } | null;
  onClose: () => void;
  onSave: (item: Omit<CurbsideItem, 'id' | 'createdAt' | 'isFound'>) => void;
}

const AddItemModal: React.FC<AddItemModalProps> = ({ position, onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Category>('Other');
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!position) return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = (reader.result as string).split(',')[1];
        setImage(reader.result as string);
        
        // Auto-analyze with Gemini
        setIsAnalyzing(true);
        const analysis = await analyzeItemImage(base64);
        if (analysis) {
          setTitle(analysis.title || '');
          setDescription(analysis.description || '');
          if (CATEGORIES.includes(analysis.category as Category)) {
            setCategory(analysis.category as Category);
          }
        }
        setIsAnalyzing(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      title,
      description,
      category,
      latitude: position.lat,
      longitude: position.lng,
      imageUrl: image || undefined,
      reporter: 'Anonymous User'
    });
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">New Find! 📦</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="relative aspect-video rounded-xl bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer overflow-hidden group hover:border-blue-400 transition-all"
            >
              {image ? (
                <>
                  <img src={image} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white font-medium">Change Photo</span>
                  </div>
                </>
              ) : (
                <div className="text-center p-4">
                  <div className="mx-auto w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-2">
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                  </div>
                  <p className="text-sm text-gray-500">Tap to add a photo</p>
                  <p className="text-xs text-gray-400 mt-1">AI will help describe it!</p>
                </div>
              )}
              {isAnalyzing && (
                <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center">
                  <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                  <span className="text-sm font-medium text-blue-600">AI is analyzing...</span>
                </div>
              )}
            </div>
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleImageChange}
            />

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Title</label>
              <input 
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Cool Vintage Chair"
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
              <textarea 
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the item's condition or specific location details..."
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <button 
              type="submit"
              disabled={isAnalyzing}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5 active:scale-95 disabled:opacity-50"
            >
              Post to Map
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddItemModal;