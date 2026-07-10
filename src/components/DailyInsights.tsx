import { useState } from "react";
import { Sparkles, Loader2, Lightbulb, ChevronRight, CheckCircle2, TrendingUp } from "lucide-react";
import { MealLog, DailyAdvice } from "../types";

interface DailyInsightsProps {
  meals: MealLog[];
}

export function DailyInsights({ meals }: DailyInsightsProps) {
  const [advice, setAdvice] = useState<DailyAdvice | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const getAdvice = async () => {
    if (meals.length === 0) return;
    setIsGenerating(true);
    try {
      // Summarize meals for the prompt
      const summary = meals.map(m => ({
        name: m.name,
        calories: m.calories,
        macros: `P:${m.protein}g C:${m.carbs}g F:${m.fat}g`,
        micronutrients: m.micronutrients
      }));

      const response = await fetch("/api/daily-advice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logSummary: summary })
      });
      if (!response.ok) {
        let errStr = "Failed to get advice";
        try {
          const errData = await response.json();
          errStr = errData.error || errStr;
        } catch {
          errStr = `Server error: ${response.status}`;
        }
        throw new Error(errStr);
      }
      const data = await response.json();
      setAdvice(data);
    } catch (e: any) {
      console.error(e);
      let errorMsg = "Failed to generate insights.";
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
    <div className="bg-indigo-900 text-white p-6 rounded-2xl shadow-xl flex flex-col gap-4">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="w-5 h-5 text-indigo-300" />
        <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-50">Daily AI Insight</h3>
      </div>
      
      {!advice ? (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-indigo-200 leading-relaxed italic font-serif">
            Finished eating for the day? Let AI analyze your intake and give actionable advice for tomorrow.
          </p>
          <button
            onClick={getAdvice}
            disabled={isGenerating || meals.length === 0}
            className="w-full py-2.5 bg-indigo-800 disabled:bg-indigo-950 text-indigo-50 rounded-lg text-xs font-bold uppercase hover:bg-indigo-700 transition flex items-center justify-center gap-2"
          >
            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Analyze Intake"}
          </button>
          {meals.length === 0 && <p className="text-xs text-center text-indigo-400">Log some meals first.</p>}
        </div>
      ) : (
        <div className="flex flex-col gap-5 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <p className="text-sm text-indigo-100 leading-relaxed italic font-serif">
            "{advice.advice}"
          </p>
          
          {advice.strengths?.length > 0 && (
            <div className="bg-indigo-950/50 rounded-xl p-4 border border-indigo-800">
              <h4 className="text-indigo-300 text-[10px] font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> What went well
              </h4>
              <ul className="space-y-2">
                {advice.strengths.map((s, i) => (
                  <li key={i} className="text-xs text-indigo-100 flex items-start gap-2">
                    <span className="text-emerald-400 mt-0.5">•</span> 
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {advice.areasForImprovement?.length > 0 && (
            <div className="bg-indigo-950/50 rounded-xl p-4 border border-indigo-800">
              <h4 className="text-indigo-300 text-[10px] font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-amber-400" /> Tomorrow's goals
              </h4>
              <ul className="space-y-2">
                {advice.areasForImprovement.map((s, i) => (
                  <li key={i} className="text-xs text-indigo-100 flex items-start gap-2">
                    <span className="text-amber-400 mt-0.5">•</span> 
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
