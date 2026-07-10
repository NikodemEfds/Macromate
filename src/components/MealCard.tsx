import { useState } from "react";
import { MealLog } from "../types";
import { ChevronDown, ChevronUp, Heart } from "lucide-react";

export function MealCard({ meal, isFavorite, onToggleFavorite }: { meal: MealLog; isFavorite?: boolean; onToggleFavorite?: () => void }) {
  const [showBreakdown, setShowBreakdown] = useState(false);

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col gap-3 transition-all hover:shadow-md">
      <div className="flex items-center gap-4">
        {meal.imageBase64 ? (
          <div className="w-16 h-16 shrink-0 rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
            <img src={meal.imageBase64} alt={meal.name} className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="w-16 h-16 shrink-0 rounded-lg bg-slate-100 flex items-center justify-center border border-slate-200 text-xs text-slate-400 font-bold uppercase text-center p-1">
             No Photo
          </div>
        )}
        
        <div className="flex-1 min-w-0 flex flex-col justify-center">
           <div className="flex justify-between items-start">
             <h4 className="font-bold text-slate-800 truncate pr-2">{meal.name}</h4>
             <div className="flex items-center gap-3 shrink-0">
               <span className="text-emerald-600 font-bold">{Math.round(meal.calories)} kcal</span>
               {onToggleFavorite && (
                 <button onClick={onToggleFavorite} className="text-slate-300 hover:text-rose-500 transition-colors">
                   <Heart className={`w-4 h-4 ${isFavorite ? "fill-rose-500 text-rose-500" : ""}`} />
                 </button>
               )}
             </div>
           </div>
           
           {!showBreakdown && (
             <div className="flex flex-col gap-2 mt-1">
               <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                 <span className="text-emerald-500">P: {Math.round(meal.protein)}g</span>
                 <span className="text-amber-500">C: {Math.round(meal.carbs)}g</span>
                 <span className="text-rose-500">F: {Math.round(meal.fat)}g</span>
               </div>
               <div className="flex w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full" style={{ width: `${meal.protein + meal.carbs + meal.fat > 0 ? (meal.protein / (meal.protein + meal.carbs + meal.fat)) * 100 : 0}%` }} title="Protein" />
                  <div className="bg-amber-400 h-full" style={{ width: `${meal.protein + meal.carbs + meal.fat > 0 ? (meal.carbs / (meal.protein + meal.carbs + meal.fat)) * 100 : 0}%` }} title="Carbs" />
                  <div className="bg-rose-400 h-full" style={{ width: `${meal.protein + meal.carbs + meal.fat > 0 ? (meal.fat / (meal.protein + meal.carbs + meal.fat)) * 100 : 0}%` }} title="Fats" />
               </div>
             </div>
           )}

           {meal.micronutrients?.length > 0 && !showBreakdown && (
             <div className="flex flex-wrap gap-2 mt-2">
               {meal.micronutrients.slice(0, 4).map((micro, i) => (
                 <span key={i} className="px-2 py-1 bg-slate-100 rounded text-[10px] font-bold text-slate-500 uppercase">{micro}</span>
               ))}
               {meal.micronutrients.length > 4 && (
                 <span className="px-2 py-1 bg-slate-100 rounded text-[10px] font-bold text-slate-500 uppercase">+{meal.micronutrients.length - 4}</span>
               )}
             </div>
           )}
        </div>
      </div>

       {meal.components && meal.components.length > 0 && (
        <div className="mt-1 pt-3 border-t border-slate-100">
          <button 
            onClick={() => setShowBreakdown(!showBreakdown)}
            className="flex items-center justify-between w-full text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-emerald-600 transition-colors"
          >
            <span>Ingredient Breakdown</span>
            {showBreakdown ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          
          {showBreakdown && (
            <div className="mt-3 flex flex-col gap-2">
                <div className="grid grid-cols-5 text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1 px-2">
                  <span className="col-span-2">Component</span>
                  <span className="text-right">Protein</span>
                  <span className="text-right">Carbs</span>
                  <span className="text-right">Fats</span>
                </div>
              {meal.components.map((comp, i) => (
                <div key={i} className="bg-slate-50 rounded-lg p-2 px-3 grid grid-cols-5 items-center">
                  <div className="col-span-2 flex flex-col">
                    <span className="text-xs font-bold text-slate-700 truncate">{comp.name}</span>
                    <span className="text-[10px] text-emerald-600 font-bold">{Math.round(comp.calories)} kcal</span>
                  </div>
                  <span className="text-xs font-medium text-slate-500 text-right">{Math.round(comp.protein)}g</span>
                  <span className="text-xs font-medium text-slate-500 text-right">{Math.round(comp.carbs)}g</span>
                  <span className="text-xs font-medium text-slate-500 text-right">{Math.round(comp.fat)}g</span>
                </div>
              ))}
              
              {/* Grand Total */}
              <div className="mt-2 grid grid-cols-5 items-center px-3 pt-2 border-t border-slate-100">
                <span className="col-span-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">Total</span>
                <span className="text-xs font-bold text-emerald-700 text-right">{Math.round(meal.protein)}g</span>
                <span className="text-xs font-bold text-amber-600 text-right">{Math.round(meal.carbs)}g</span>
                <span className="text-xs font-bold text-rose-600 text-right">{Math.round(meal.fat)}g</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
