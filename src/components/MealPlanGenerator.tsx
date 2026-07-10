import { useState } from "react";
import { Sparkles, Loader2, Target } from "lucide-react";
import { MealPlanItem } from "../types";

export function MealPlanGenerator() {
  const [plans, setPlans] = useState<MealPlanItem[]>([]);
  const [goals, setGoals] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePlan = async () => {
    if (!goals) return;
    setIsGenerating(true);
    try {
      const response = await fetch("/api/generate-meal-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goals })
      });
      if (!response.ok) {
        let errStr = "Failed to generate plan";
        try {
          const errData = await response.json();
          errStr = errData.error || errStr;
        } catch {
          errStr = `Server error: ${response.status}`;
        }
        throw new Error(errStr);
      }
      const data = await response.json();
      setPlans(data);
    } catch (e: any) {
      console.error(e);
      let errorMsg = "Failed to generate meal plan.";
      if (e && e.message) {
         try {
           const parsed = JSON.parse(e.message);
           if (parsed.error && parsed.error.message) {
             errorMsg = parsed.error.message;
           }
         } catch {
           errorMsg = e.message;
         }
      }
      alert(errorMsg);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col gap-4">
      <div className="flex items-center gap-2 mb-2">
        <Target className="w-5 h-5 text-emerald-600" />
        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-800">AI Meal Planner</h3>
      </div>
      
      <p className="text-sm text-slate-500 italic font-serif">
        Describe your diet goals, restrictions, or cravings, and AI will craft a personalized day of eating.
      </p>

      <textarea
        placeholder="E.g., 'High protein vegetarian, 2000 calories'"
        value={goals}
        onChange={(e) => setGoals(e.target.value)}
        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm min-h-[80px] outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none placeholder-slate-400 text-slate-800"
      />

      <button
        onClick={generatePlan}
        disabled={isGenerating || !goals}
        className="w-full bg-emerald-600 text-white py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-emerald-700 disabled:bg-emerald-300 transition-colors flex items-center justify-center gap-2 shadow-sm"
      >
        {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Generate Plan"}
      </button>

      {plans.length > 0 && (
        <div className="mt-4 flex flex-col gap-3">
          <h4 className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-1">Your Plan</h4>
          <div className="space-y-3">
            {plans.map((item, i) => (
              <div key={i} className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">{item.mealType}</span>
                  <span className="text-xs font-bold text-slate-600">{Math.round(item.calories)} kcal</span>
                </div>
                <h5 className="font-bold text-slate-800 text-sm mb-1">{item.name}</h5>
                <p className="text-xs text-slate-500 mb-3 leading-relaxed">{item.description}</p>
                <div className="flex gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  <span className="text-emerald-700">P: {Math.round(item.protein)}g</span>
                  <span className="text-amber-600">C: {Math.round(item.carbs)}g</span>
                  <span className="text-rose-600">F: {Math.round(item.fat)}g</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
