import { useState, useRef } from "react";
import { Camera, Image as ImageIcon, Loader2, Sparkles, X, Heart } from "lucide-react";
import { MealLog, FavoriteMeal } from "../types";
import { v4 as uuidv4 } from "uuid";

interface MealLoggerProps {
  onLogMeal: (meal: MealLog) => void;
  favorites: FavoriteMeal[];
  date: string;
}

export function MealLogger({ onLogMeal, favorites, date }: MealLoggerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const logFavorite = (fav: FavoriteMeal) => {
    const newLog: MealLog = {
      id: uuidv4(),
      date: date,
      name: fav.name,
      description: fav.description,
      calories: fav.calories,
      protein: fav.protein,
      carbs: fav.carbs,
      fat: fav.fat,
      micronutrients: fav.micronutrients,
      components: fav.components,
      imageBase64: fav.imageBase64
    };
    onLogMeal(newLog);
    setIsOpen(false);
  };

const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = (event) => {
    const img = new Image();

    img.onload = () => {
      const canvas = document.createElement("canvas");

      const MAX_SIZE = 1600;

      let width = img.width;
      let height = img.height;

      if (width > height && width > MAX_SIZE) {
        height = Math.round((height * MAX_SIZE) / width);
        width = MAX_SIZE;
      } else if (height > MAX_SIZE) {
        width = Math.round((width * MAX_SIZE) / height);
        height = MAX_SIZE;
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");

      if (!ctx) return;

      ctx.drawImage(img, 0, 0, width, height);

      // JPEG keeps the request small while retaining enough detail
      // for food recognition.
      const compressedImage = canvas.toDataURL("image/jpeg", 0.8);

      setImage(compressedImage);
    };

    img.src = event.target?.result as string;
  };

  reader.readAsDataURL(file);
};

  const analyzeAndLog = async () => {
    if (!description && !image) return;
    
    setIsAnalyzing(true);
    try {
      const response = await fetch("/api/analyze-meal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
body: JSON.stringify({
  description,
  imageBase64: image,
  mimeType: image ? "image/jpeg" : undefined
})
        })
      });

      if (!response.ok) {
        let errStr = "Failed to analyze meal";
        try {
          const errData = await response.json();
          errStr = errData.error || errStr;
        } catch {
          errStr = `Server error: ${response.status}`;
        }
        throw new Error(errStr);
      }
      const data = await response.json();

      const newLog: MealLog = {
        id: uuidv4(),
        date: date,
        name: data.name,
        description: description,
        calories: data.calories,
        protein: data.protein,
        carbs: data.carbs,
        fat: data.fat,
        micronutrients: data.micronutrients,
        components: data.components,
        imageBase64: image || undefined
      };

      onLogMeal(newLog);
      setIsOpen(false);
      setDescription("");
      setImage(null);
    } catch (error: any) {
      console.error(error);
      
      let errorMsg = "Oops! Something went wrong analyzing the meal.";
      if (error && error.message) {
         try {
           const parsed = JSON.parse(error.message);
           if (parsed.error && parsed.error.message) {
             errorMsg = parsed.error.message;
           }
         } catch {
           errorMsg = error.message;
         }
      }
      alert(errorMsg);
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-xl font-bold uppercase tracking-wider text-sm shadow-xl shadow-emerald-200/50 transition-all"
      >
        <Sparkles className="w-5 h-5" />
        AI Scan Meal
      </button>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col gap-4 relative animate-in fade-in zoom-in-95 duration-200">
      <button 
        onClick={() => setIsOpen(false)}
        className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
      >
        <X className="w-5 h-5" />
      </button>
      
      <div className="flex items-center gap-2 mb-2">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Log a Meal</h3>
      </div>
      
      {favorites && favorites.length > 0 && (
        <div className="mb-1">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> Quick Log Favorites
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none" style={{ scrollbarWidth: 'none' }}>
             {favorites.map(fav => (
               <button 
                 key={fav.id}
                 onClick={() => logFavorite(fav)} 
                 className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg whitespace-nowrap hover:bg-emerald-50 hover:border-emerald-200 group transition-colors"
               >
                  <span className="font-bold text-sm text-slate-700 group-hover:text-emerald-700">{fav.name}</span>
                  <span className="text-[10px] uppercase font-bold text-slate-400 group-hover:text-emerald-500">{Math.round(fav.calories)} kcal</span>
               </button>
             ))}
          </div>
        </div>
      )}

      <textarea
        placeholder="Describe your meal here (e.g. 'Grilled Salmon & Quinoa'). Feel free to add a photo below for better AI analysis!"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm min-h-[100px] outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none text-slate-800 placeholder-slate-400"
      />

      {image && (
        <div className="relative w-full h-48 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
          <img src={image} alt="Meal preview" className="w-full h-full object-cover" />
          <button 
            onClick={() => setImage(null)}
            className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-1.5 rounded-full text-slate-700 hover:text-rose-500 shadow-sm transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="flex gap-3">
        <input 
          type="file" 
          accept="image/*" 
          ref={fileInputRef} 
          onChange={handleImageUpload} 
          className="hidden" 
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex-1 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold uppercase tracking-wider py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
        >
          <Camera className="w-4 h-4" />
          Photo
        </button>
        <button
          onClick={analyzeAndLog}
          disabled={isAnalyzing || (!description && !image)}
          className="flex-[2] bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white text-xs font-bold uppercase tracking-wider py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-sm"
        >
          {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          Analyze & Log
        </button>
      </div>
    </div>
  );
}
