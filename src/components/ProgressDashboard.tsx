import { useState } from "react";
import { Droplets, Plus, Minus, ChevronDown, ChevronUp } from "lucide-react";
import { MealLog } from "../types";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

export function ProgressDashboard({ 
  meals, goals, water, onAddWater, onRemoveWater 
}: { 
  meals: MealLog[], goals: any, water: number, onAddWater: () => void, onRemoveWater: () => void 
}) {
  const [showMicros, setShowMicros] = useState(false);

  const totals = meals.reduce(
    (acc, meal) => {
      acc.calories += meal.calories;
      acc.protein += meal.protein;
      acc.carbs += meal.carbs;
      acc.fat += meal.fat;
      if (meal.micronutrients) {
        meal.micronutrients.forEach(m => acc.micronutrients.add(m));
      }
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0, micronutrients: new Set<string>() }
  );

  const uniqueMicros = Array.from(totals.micronutrients).sort();

  const currentData = [
    { name: 'Protein', value: Math.round(totals.protein) || 0.1, fill: '#10b981' },
    { name: 'Carbs', value: Math.round(totals.carbs) || 0.1, fill: '#fbbf24' },
    { name: 'Fats', value: Math.round(totals.fat) || 0.1, fill: '#fb7185' },
  ];

  const goalData = [
    { name: 'Protein Goal', value: Math.round(goals.protein), fill: '#6ee7b7' },
    { name: 'Carbs Goal', value: Math.round(goals.carbs), fill: '#fcd34d' },
    { name: 'Fats Goal', value: Math.round(goals.fat), fill: '#fda4af' },
  ];

  return (
    <div className="flex flex-col gap-8">
      {/* Header Section */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Today's Macros</h2>
          <p className="text-slate-500 mt-1">You're {Math.max(0, goals.calories - Math.round(totals.calories))} kcal away from your target. Keep it up!</p>
        </div>
        <div className="flex gap-4">
          <div className="text-right">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Target</div>
            <div className="text-lg font-bold">{goals.calories} kcal</div>
          </div>
          <div className="w-[2px] bg-slate-200 h-10"></div>
          <div className="text-right">
            <div className="text-xs font-bold text-emerald-500 uppercase tracking-widest">Current</div>
            <div className="text-lg font-bold">{Math.round(totals.calories)} kcal</div>
          </div>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 w-full">
        <MacroCard 
          label="Protein" 
          current={totals.protein} 
          target={goals.protein} 
          colorClass="emerald" 
        />
        <MacroCard 
          label="Carbs" 
          current={totals.carbs} 
          target={goals.carbs} 
          colorClass="amber" 
        />
        <MacroCard 
          label="Fats" 
          current={totals.fat} 
          target={goals.fat} 
          colorClass="rose" 
        />
        <MacroCard 
          label="Calories" 
          current={totals.calories} 
          target={goals.calories} 
          colorClass="blue" 
        />

        {/* Water Tracker Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Droplets className="w-3.5 h-3.5 text-cyan-500" /> Water
              </span>
              <span className="text-[10px] font-bold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded-full">
                {Math.round(Math.min(100, (water / 8) * 100))}%
              </span>
            </div>
            
            <div className="flex items-center justify-between mb-6 mt-1">
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-slate-900">{water}</span>
                <span className="text-slate-500 text-xs font-medium">/ 8</span>
              </div>
              
              <div className="flex gap-1 shrink-0 bg-slate-50 p-1 rounded-lg">
                 <button onClick={onRemoveWater} disabled={water === 0} className="w-6 h-6 rounded-md bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-100 disabled:opacity-50 shadow-sm transition-colors">
                   <Minus className="w-3 h-3" />
                 </button>
                 <button onClick={onAddWater} className="w-6 h-6 rounded-md bg-cyan-500 border border-cyan-600 flex items-center justify-center text-white hover:bg-cyan-600 shadow-sm transition-colors">
                   <Plus className="w-3 h-3" />
                 </button>
              </div>
            </div>
          </div>
          
          <div className="relative w-full pt-5">
            <div 
              className="absolute top-0 flex flex-col items-center -translate-x-1/2 z-10 transition-all duration-700" 
              style={{ left: `100%` }}
            >
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest bg-white px-1 relative top-1 rounded-sm shadow-sm border border-slate-100">Target</span>
              <div className="w-[2px] h-5 bg-slate-800 rounded-full mt-1 border border-white"></div>
            </div>
            <div className="w-full bg-slate-100 h-3 rounded-full relative">
              <div className="bg-cyan-400 h-full rounded-full transition-all duration-700 ease-out" style={{ width: `${Math.min(100, (water / 8) * 100)}%` }}></div>
            </div>
          </div>
        </div>

      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all">
        <button 
          onClick={() => setShowMicros(!showMicros)}
          className="w-full p-4 flex justify-between items-center bg-slate-50 hover:bg-slate-100 transition-colors"
        >
          <span className="font-bold text-slate-700 text-sm tracking-wide uppercase">Micronutrients & Minerals</span>
          {showMicros ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
        </button>
        {showMicros && (
          <div className="p-5 border-t border-slate-200">
            {uniqueMicros.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {uniqueMicros.map((micro, idx) => (
                  <span key={idx} className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-full border border-indigo-100">
                    {micro}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 italic">No micronutrients logged for today yet.</p>
            )}
          </div>
        )}
      </div>

      {/* Chart Section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row gap-8 items-center">
        <div className="flex-1 w-full">
          <h3 className="text-lg font-bold text-slate-800 mb-1">Macro Distribution</h3>
          <p className="text-sm text-slate-500 mb-6">Compare your current macro intake against your daily goals.</p>
          
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
               <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
               <span className="text-sm font-medium text-slate-700 w-16">Protein</span>
               <span className="text-sm font-bold text-slate-900">{Math.round(totals.protein)}g <span className="text-slate-400 font-normal">/ {goals.protein}g</span></span>
            </div>
            <div className="flex items-center gap-3">
               <div className="w-3 h-3 rounded-full bg-amber-400"></div>
               <span className="text-sm font-medium text-slate-700 w-16">Carbs</span>
               <span className="text-sm font-bold text-slate-900">{Math.round(totals.carbs)}g <span className="text-slate-400 font-normal">/ {goals.carbs}g</span></span>
            </div>
            <div className="flex items-center gap-3">
               <div className="w-3 h-3 rounded-full bg-rose-400"></div>
               <span className="text-sm font-medium text-slate-700 w-16">Fats</span>
               <span className="text-sm font-bold text-slate-900">{Math.round(totals.fat)}g <span className="text-slate-400 font-normal">/ {goals.fat}g</span></span>
            </div>
          </div>
        </div>

        <div className="flex-1 w-full h-[250px] min-w-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip 
                formatter={(value: number) => [`${value}g`, '']}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
              />
              <Pie
                data={goalData}
                dataKey="value"
                cx="50%"
                cy="50%"
                outerRadius={80}
                innerRadius={60}
                stroke="none"
              >
                {goalData.map((entry, index) => (
                  <Cell key={`cell-goal-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Pie
                data={currentData}
                dataKey="value"
                cx="50%"
                cy="50%"
                outerRadius={110}
                innerRadius={90}
                stroke="none"
              >
                {currentData.map((entry, index) => (
                  <Cell key={`cell-current-${index}`} fill={entry.fill} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function MacroCard({ label, current, target, colorClass }: { label: string, current: number, target: number, colorClass: 'emerald' | 'amber' | 'rose' | 'blue' }) {
  const percentage = Math.round((current / target) * 100) || 0;
  
  const colors = {
    emerald: { text: "text-emerald-700", bg: "bg-emerald-50", fill: "bg-emerald-500", over: "bg-emerald-700" },
    amber: { text: "text-amber-700", bg: "bg-amber-50", fill: "bg-amber-400", over: "bg-amber-600" },
    rose: { text: "text-rose-700", bg: "bg-rose-50", fill: "bg-rose-400", over: "bg-rose-600" },
    blue: { text: "text-blue-700", bg: "bg-blue-50", fill: "bg-blue-400", over: "bg-blue-600" },
  };
  
  const c = colors[colorClass];
  const isOver = percentage > 100;
  
  const maxDisplay = Math.max(120, percentage);
  const targetPct = (100 / maxDisplay) * 100;
  const currentPct = (percentage / maxDisplay) * 100;

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start mb-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</span>
          <span className={`text-[10px] font-bold ${isOver ? 'text-white bg-rose-500' : c.text + ' ' + c.bg} px-2 py-0.5 rounded-full`}>
            {percentage}%
          </span>
        </div>
        <div className="flex items-baseline gap-1 mb-6">
          <span className="text-2xl font-bold text-slate-900">{Math.round(current)}</span>
          <span className="text-slate-500 text-xs font-medium">/ {target} {label === 'Calories' ? 'kcal' : 'g'}</span>
        </div>
      </div>
      
      <div className="relative w-full pt-5">
        <div 
          className="absolute top-0 flex flex-col items-center -translate-x-1/2 z-10 transition-all duration-700" 
          style={{ left: `${targetPct}%` }}
        >
          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest bg-white px-1 relative top-1 rounded-sm shadow-sm border border-slate-100">Target</span>
          <div className="w-[2px] h-5 bg-slate-800 rounded-full mt-1 border border-white"></div>
        </div>
        
        <div className="w-full bg-slate-100 h-3 rounded-full relative">
          <div 
            className={`${isOver ? c.over : c.fill} h-full rounded-full transition-all duration-700 ease-out`} 
            style={{ width: `${currentPct}%` }}
          />
        </div>
      </div>
    </div>
  );
}
