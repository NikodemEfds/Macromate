export function calculateMacros(
  weightKg: number,
  heightCm: number,
  age: number,
  gender: 'male' | 'female',
  activityLevel: number,
  goal: 'lose' | 'maintain' | 'gain'
) {
  // Mifflin-St Jeor Equation
  let bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + (gender === 'male' ? 5 : -161);
  let tdee = bmr * activityLevel;
  
  let targetCalories = tdee;
  if (goal === 'lose') targetCalories *= 0.8; // 20% deficit
  if (goal === 'gain') targetCalories *= 1.1; // 10% surplus
  
  // Macros
  // Protein: High for lose/gain/maintain. Usually ~2g per kg of bodyweight
  const protein = weightKg * 2.2; 
  
  // Fat: ~25% of calories
  const fat = (targetCalories * 0.25) / 9;
  
  // Carbs: The rest of the calories
  const carbs = (targetCalories - (protein * 4) - (fat * 9)) / 4;

  return {
    calories: Math.round(targetCalories),
    protein: Math.round(protein),
    fat: Math.round(fat),
    carbs: Math.round(Math.max(0, carbs))
  };
}
