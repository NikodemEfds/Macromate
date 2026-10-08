/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo } from "react";
import { format } from "date-fns";
import { MealLog, UserProfile, MacroGoals, FavoriteMeal } from "./types";
import { ProgressDashboard } from "./components/ProgressDashboard";
import { MealLogger } from "./components/MealLogger";
import { MealPlanGenerator } from "./components/MealPlanGenerator";
import { DailyInsights } from "./components/DailyInsights";
import { addDays, subDays, startOfWeek, isSameDay } from "date-fns";
import { ChevronLeft, ChevronRight, Activity, Settings } from "lucide-react";
import { calculateMacros } from "./lib/nutrition";
import { SettingsPanel } from "./components/SettingsPanel";
import { MealCard } from "./components/MealCard";
import { v4 as uuidv4 } from "uuid";

const DEFAULT_PROFILE: UserProfile = {
  age: 30,
  gender: 'male',
  weight: 80,
  height: 180,
  activityLevel: 1.55,
  goal: 'maintain'
};

export default function App() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [meals, setMeals] = useState<MealLog[]>([]);
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [favorites, setFavorites] = useState<FavoriteMeal[]>([]);
  const [waterIntake, setWaterIntake] = useState<Record<string, number>>({});
  const [isLoaded, setIsLoaded] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const savedMeals = localStorage.getItem("nutrition_logs");
    const savedProfile = localStorage.getItem("nutrition_profile");
    const savedFavorites = localStorage.getItem("nutrition_favorites");
    const savedWater = localStorage.getItem("nutrition_water");
    
    if (savedMeals) {
      try { setMeals(JSON.parse(savedMeals)); } catch (e) { console.error(e); }
    }
    if (savedProfile) {
      try { setProfile(JSON.parse(savedProfile)); } catch (e) { console.error(e); }
    }
    if (savedFavorites) {
      try { setFavorites(JSON.parse(savedFavorites)); } catch (e) { console.error(e); }
    }
    if (savedWater) {
      try { setWaterIntake(JSON.parse(savedWater)); } catch (e) { console.error(e); }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("nutrition_logs", JSON.stringify(meals));
      localStorage.setItem("nutrition_profile", JSON.stringify(profile));
      localStorage.setItem("nutrition_favorites", JSON.stringify(favorites));
      localStorage.setItem("nutrition_water", JSON.stringify(waterIntake));
    }
  }, [meals, profile, favorites, waterIntake, isLoaded]);

  const activeGoals: MacroGoals = useMemo(() => {
    return profile.manualMacros || calculateMacros(
      profile.weight, profile.height, profile.age, profile.gender, profile.activityLevel, profile.goal
    );
  }, [profile]);

  const handleLogMeal = (newMeal: MealLog) => {
    setMeals([newMeal, ...meals]);
  };
const handleDeleteMeal = (mealId: string) => {
  setMeals((currentMeals) =>
    currentMeals.filter((meal) => meal.id !== mealId)
  );
};
  const handleToggleFavorite = (meal: MealLog) => {
    const exists = favorites.some((f) => f.name === meal.name);
    if (exists) {
      setFavorites(favorites.filter((f) => f.name !== meal.name));
    } else {
      const { id, date, ...rest } = meal;
      setFavorites([{ id: uuidv4(), ...rest }, ...favorites]);
    }
  };

  const todayMeals = meals.filter(
    (m) => new Date(m.date).toDateString() === selectedDate.toDateString()
  );

  const todayKey = selectedDate.toDateString();
  const todayWater = waterIntake[todayKey] || 0;
  
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));
  
  const handleAddWater = () => {
    setWaterIntake({ ...waterIntake, [todayKey]: todayWater + 1 });
  };
  
  const handleRemoveWater = () => {
    setWaterIntake({ ...waterIntake, [todayKey]: Math.max(0, todayWater - 1) });
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-emerald-200">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 md:py-12 flex flex-col">
        {/* Header Section */}
        <header className="flex flex-col sm:flex-row justify-between items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-8">
          <div className="flex flex-col sm:flex-row items-center gap-4">
             <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">M</div>
             <div>
                <h1 className="text-xl font-bold tracking-tight text-emerald-900">MacroMate</h1>
             </div>
          </div>
          <div className="mt-4 sm:mt-0 flex items-center gap-4 text-right">
             <p className="text-slate-500 font-bold tracking-widest uppercase text-xs">
                {format(selectedDate, "EEEE, MMMM do")}
             </p>
             <button 
               onClick={() => setShowSettings(true)}
               className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
             >
               <Settings className="w-5 h-5" />
             </button>
          </div>
        </header>

        {showSettings && (
          <SettingsPanel 
            profile={profile}
            onSave={(p) => setProfile(p)}
            onClose={() => setShowSettings(false)}
          />
        )}

        {/* Dashboard Top Row */}
        <div className="flex gap-2 items-center justify-between mb-8 overflow-x-auto pb-2 scrollbar-none w-full" style={{ scrollbarWidth: 'none' }}>
           <button onClick={() => setSelectedDate(subDays(selectedDate, 7))} className="p-2 hover:bg-slate-200 bg-white border border-slate-200 rounded-xl text-slate-500 transition-colors shrink-0">
             <ChevronLeft className="w-5 h-5"/>
           </button>
           <div className="flex gap-2 mx-auto">
             {weekDays.map((day) => (
               <button 
                 key={day.toISOString()}
                 onClick={() => setSelectedDate(day)}
                 className={`flex flex-col items-center justify-center min-w-[3.5rem] py-2 px-3 rounded-xl transition-colors shrink-0 ${
                   isSameDay(day, selectedDate) 
                     ? "bg-emerald-600 text-white shadow-md shadow-emerald-200" 
                     : "bg-white border border-slate-200 text-slate-500 hover:bg-slate-50"
                 }`}
               >
                 <span className={`text-[10px] uppercase font-bold tracking-widest ${isSameDay(day, selectedDate) ? 'opacity-90' : 'opacity-70'}`}>{format(day, "eee")}</span>
                 <span className="text-lg font-bold">{format(day, "d")}</span>
               </button>
             ))}
           </div>
           <button onClick={() => setSelectedDate(addDays(selectedDate, 7))} className="p-2 hover:bg-slate-200 bg-white border border-slate-200 rounded-xl text-slate-500 transition-colors shrink-0">
             <ChevronRight className="w-5 h-5"/>
           </button>
        </div>

        <section className="animate-in fade-in slide-in-from-bottom-4 duration-700 mb-8">
          <ProgressDashboard 
            meals={todayMeals} 
            goals={activeGoals} 
            water={todayWater}
            onAddWater={handleAddWater}
            onRemoveWater={handleRemoveWater}
          />
        </section>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Left Column: Logging & History */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <section className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">
              <MealLogger onLogMeal={handleLogMeal} favorites={favorites} date={selectedDate.toISOString()} />
            </section>

            <section className="flex flex-col animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">
                {isSameDay(selectedDate, new Date()) ? "Today's Intake" : `${format(selectedDate, "EEEE")}'s Intake`}
              </h3>
              
              {todayMeals.length === 0 ? (
                <div className="bg-white border text-sm font-bold border-slate-200 rounded-xl p-12 text-center flex flex-col items-center justify-center">
                  <p className="text-slate-400 tracking-wider">NO MEALS LOGGED TODAY.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {todayMeals.map((meal) => (
       <MealCard
  key={meal.id}
  meal={meal}
  isFavorite={favorites.some(
    (f) => f.name === meal.name
  )}
  onToggleFavorite={() =>
    handleToggleFavorite(meal)
  }
  onDelete={() =>
    handleDeleteMeal(meal.id)
  }

                    />
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Right Column: AI Utilities */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            <section className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-500">
              <DailyInsights meals={todayMeals} />
            </section>

            <section className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-500">
              <MealPlanGenerator />
            </section>
          </div>

        </div>
      </main>
    </div>
  );
}

