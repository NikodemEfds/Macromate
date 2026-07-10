export interface MacroGoals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface UserProfile {
  age: number;
  gender: 'male' | 'female';
  weight: number; 
  height: number;
  activityLevel: number;
  goal: 'lose' | 'maintain' | 'gain';
  manualMacros?: MacroGoals;
}

export interface MealComponent {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface FavoriteMeal {
  id: string;
  name: string;
  description?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  micronutrients: string[];
  components?: MealComponent[];
  imageBase64?: string;
}

export interface MealLog {
  id: string;
  date: string; // ISO string
  name: string;
  description?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  micronutrients: string[];
  components?: MealComponent[];
  imageBase64?: string;
}

export interface MealPlanItem {
  mealType: string;
  name: string;
  description: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface DailyAdvice {
  advice: string;
  strengths: string[];
  areasForImprovement: string[];
}
