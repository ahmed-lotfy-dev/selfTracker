import type { FoodAnalysisFoodItem, FoodAnalysisResult } from "../types/foodAnalysis";

type DraftFoodItem = Partial<FoodAnalysisFoodItem> & {
  name?: string;
};

export const FOOD_ANALYSIS_PROMPT = `Analyze this food image and return only valid JSON.

Rules:
- Detect each visible food item separately.
- Prefer conservative estimates over overconfident guesses.
- Estimate portion size as carefully as possible from the image.
- Include estimatedGrams whenever possible.
- detectionConfidence must be a number between 0 and 1 based on visual certainty.
- If a value is uncertain, still provide your best estimate but keep detectionConfidence lower.

Return this exact shape:
{
  "foods": [
    {
      "name": "Food name",
      "quantity": 1,
      "unit": "g/ml/cup/piece/etc",
      "estimatedGrams": 120,
      "calories": 200,
      "protein": 10,
      "carbs": 15,
      "fat": 8,
      "detectionConfidence": 0.82
    }
  ]
}
`;

function toFiniteNumber(value: unknown, fallback = 0): number {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function extractJsonObject(content: string): string {
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Failed to extract JSON from model response");
  }

  return jsonMatch[0];
}

export function normalizeDraftFoodItems(rawFoods: unknown): FoodAnalysisFoodItem[] {
  if (!Array.isArray(rawFoods)) return [];

  return rawFoods
    .map((raw): FoodAnalysisFoodItem | null => {
      const item = raw as DraftFoodItem;
      const name = String(item.name || "").trim();
      if (!name) return null;

      const quantity = Math.max(0, toFiniteNumber(item.quantity, 1));
      const unit = String(item.unit || "serving").trim() || "serving";
      const detectionConfidence = clamp(toFiniteNumber(item.detectionConfidence, 0.45), 0.05, 0.99);
      const estimatedGrams = toFiniteNumber(item.estimatedGrams, 0);

      return {
        name,
        quantity,
        unit,
        estimatedGrams: estimatedGrams > 0 ? estimatedGrams : undefined,
        calories: Math.max(0, toFiniteNumber(item.calories)),
        protein: Math.max(0, toFiniteNumber(item.protein)),
        carbs: Math.max(0, toFiniteNumber(item.carbs)),
        fat: Math.max(0, toFiniteNumber(item.fat)),
        detectionConfidence,
        nutritionSource: "model_estimate",
      };
    })
    .filter((item): item is FoodAnalysisFoodItem => item !== null);
}

export function buildFoodAnalysisResult(
  foods: FoodAnalysisFoodItem[],
  options?: Partial<Pick<FoodAnalysisResult, "confidence" | "confidenceBreakdown" | "notes">>,
): FoodAnalysisResult {
  const totalCalories = foods.reduce((sum, food) => sum + food.calories, 0);
  const totalProtein = foods.reduce((sum, food) => sum + food.protein, 0);
  const totalCarbs = foods.reduce((sum, food) => sum + food.carbs, 0);
  const totalFat = foods.reduce((sum, food) => sum + food.fat, 0);

  return {
    foods,
    totalCalories: Math.round(totalCalories),
    totalProtein: Number(totalProtein.toFixed(1)),
    totalCarbs: Number(totalCarbs.toFixed(1)),
    totalFat: Number(totalFat.toFixed(1)),
    confidence: clamp(toFiniteNumber(options?.confidence, 0.4), 0.05, 0.99),
    confidenceBreakdown: options?.confidenceBreakdown,
    notes: options?.notes,
  };
}
