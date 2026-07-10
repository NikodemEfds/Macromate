import { useState, useEffect } from "react";
import { UserProfile, MacroGoals } from "../types";
import { Settings, X, Save, Calculator } from "lucide-react";
import { calculateMacros } from "../lib/nutrition";

export function SettingsPanel({
  profile,
  onSave,
  onClose
}: {
  profile: UserProfile;
  onSave: (p: UserProfile) => void;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState<UserProfile>(profile);
  const [useManual, setUseManual] = useState(!!profile.manualMacros);
  const [manualGoals, setManualGoals] = useState<MacroGoals>(
    profile.manualMacros || { calories: 2000, protein: 150, carbs: 200, fat: 65 }
  );

  const calculated = calculateMacros(
    formData.weight,
    formData.height,
    formData.age,
    formData.gender,
    formData.activityLevel,
    formData.goal
  );

  const activeGoals = useManual ? manualGoals : calculated;

  const handleSave = () => {
    onSave({
      ...formData,
      manualMacros: useManual ? manualGoals : undefined
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl shadow-slate-900/10 flex flex-col max-h-[90vh]">
        
        <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50 rounded-t-2xl">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-slate-500" />
            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-800">Profile & Goals</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex flex-col gap-6">
          
          {/* User Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Age (years)</label>
              <input 
                type="number" 
                value={formData.age} onChange={e => setFormData({...formData, age: Number(e.target.value)})}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800 font-medium"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Gender</label>
              <select 
                value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value as 'male'|'female'})}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800 font-medium"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Weight (kg)</label>
              <input 
                type="number" 
                value={formData.weight} onChange={e => setFormData({...formData, weight: Number(e.target.value)})}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800 font-medium"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Height (cm)</label>
              <input 
                type="number" 
                value={formData.height} onChange={e => setFormData({...formData, height: Number(e.target.value)})}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800 font-medium"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Activity Level</label>
            <select 
              value={formData.activityLevel} onChange={e => setFormData({...formData, activityLevel: Number(e.target.value)})}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800 font-medium"
            >
              <option value={1.2}>Sedentary (little to no exercise)</option>
              <option value={1.375}>Lightly Active (1-3 days/week)</option>
              <option value={1.55}>Moderately Active (3-5 days/week)</option>
              <option value={1.725}>Very Active (6-7 days/week)</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Primary Goal</label>
            <select 
              value={formData.goal} onChange={e => setFormData({...formData, goal: e.target.value as any})}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800 font-medium"
            >
              <option value="lose">Slimming Down (Lose Weight)</option>
              <option value="maintain">Maintain Weight</option>
              <option value="gain">Building Mass (Gain Weight/Muscle)</option>
            </select>
          </div>

          <hr className="border-slate-200" />

          {/* Macros Section */}
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
               <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Daily Macro Goals</h3>
               <button 
                 onClick={() => {
                   if (!useManual) setManualGoals(calculated);
                   setUseManual(!useManual);
                 }}
                 className="text-xs font-bold uppercase text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-md"
               >
                 {useManual ? "Reset to Auto" : "Customize Manually"}
               </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5 p-3 bg-slate-50 rounded-xl border border-slate-200">
                 <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Calories</label>
                 <div className="flex items-center gap-2">
                   <input 
                     type="number" 
                     disabled={!useManual}
                     value={activeGoals.calories}
                     onChange={e => setManualGoals({...manualGoals, calories: Number(e.target.value)})}
                     className="w-full bg-transparent text-lg font-bold outline-none text-slate-800 disabled:opacity-70"
                   />
                   <span className="text-xs font-bold text-slate-400">kcal</span>
                 </div>
              </div>
              <div className="flex flex-col gap-1.5 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                 <label className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Protein</label>
                 <div className="flex items-center gap-2">
                   <input 
                     type="number" 
                     disabled={!useManual}
                     value={activeGoals.protein}
                     onChange={e => setManualGoals({...manualGoals, protein: Number(e.target.value)})}
                     className="w-full bg-transparent text-lg font-bold outline-none text-emerald-900 disabled:opacity-70"
                   />
                   <span className="text-xs font-bold text-emerald-600">g</span>
                 </div>
              </div>
              <div className="flex flex-col gap-1.5 p-3 bg-amber-50 rounded-xl border border-amber-100">
                 <label className="text-xs font-bold text-amber-700 uppercase tracking-wider">Carbs</label>
                 <div className="flex items-center gap-2">
                   <input 
                     type="number" 
                     disabled={!useManual}
                     value={activeGoals.carbs}
                     onChange={e => setManualGoals({...manualGoals, carbs: Number(e.target.value)})}
                     className="w-full bg-transparent text-lg font-bold outline-none text-amber-900 disabled:opacity-70"
                   />
                   <span className="text-xs font-bold text-amber-600">g</span>
                 </div>
              </div>
              <div className="flex flex-col gap-1.5 p-3 bg-rose-50 rounded-xl border border-rose-100">
                 <label className="text-xs font-bold text-rose-700 uppercase tracking-wider">Fats</label>
                 <div className="flex items-center gap-2">
                   <input 
                     type="number" 
                     disabled={!useManual}
                     value={activeGoals.fat}
                     onChange={e => setManualGoals({...manualGoals, fat: Number(e.target.value)})}
                     className="w-full bg-transparent text-lg font-bold outline-none text-rose-900 disabled:opacity-70"
                   />
                   <span className="text-xs font-bold text-rose-600">g</span>
                 </div>
              </div>
            </div>
            
            {!useManual && (
              <p className="text-xs text-slate-500 italic flex items-center gap-1.5">
                 <Calculator className="w-3.5 h-3.5" />
                 Automatically calculated based on your profile.
              </p>
            )}

          </div>

        </div>

        <div className="p-5 border-t border-slate-200 bg-white rounded-b-2xl flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            className="px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2 transition-colors shadow-md shadow-emerald-200/50"
          >
            <Save className="w-4 h-4" /> Save Preferences
          </button>
        </div>

      </div>
    </div>
  );
}
