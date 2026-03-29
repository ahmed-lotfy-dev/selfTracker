export type FoodAnalysisResult = {
  foods: FoodAnalysisFoodItem[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  confidence: number;
  confidenceBreakdown?: {
    detection: number;
    nutritionData: number;
    portionEstimation: number;
  };
  notes?: string[];
};

export type FoodAnalysisFoodItem = {
  name: string;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  estimatedGrams?: number;
  confidence?: number;
  confidenceReason?: string;
  nutritionSource?: "model_estimate" | "open_food_facts";
  matchedProductName?: string | null;
  detectionConfidence?: number;
};
