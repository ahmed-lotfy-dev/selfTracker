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

function previewContent(content: string, maxLength = 200): string {
  const normalized = content.replace(/\s+/g, " ").trim();
  return normalized.length > maxLength
    ? `${normalized.slice(0, maxLength)}...`
    : normalized;
}

function tryParseJsonCandidate(candidate: string): string | null {
  const trimmed = candidate.trim();
  if (!trimmed) return null;

  try {
    const parsed = JSON.parse(trimmed);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return trimmed;
    }
  } catch {
    return null;
  }

  return null;
}

function extractJsonFromCodeFence(content: string): string | null {
  const fenceMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (!fenceMatch) return null;
  return tryParseJsonCandidate(fenceMatch[1]);
}

function extractBalancedJsonObject(content: string): string | null {
  let start = -1;
  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = 0; i < content.length; i += 1) {
    const char = content[i];

    if (escaped) {
      escaped = false;
      continue;
    }

    if (char === "\\") {
      escaped = true;
      continue;
    }

    if (char === "\"") {
      inString = !inString;
      continue;
    }

    if (inString) continue;

    if (char === "{") {
      if (depth === 0) start = i;
      depth += 1;
      continue;
    }

    if (char === "}") {
      if (depth === 0) continue;
      depth -= 1;

      if (depth === 0 && start !== -1) {
        const candidate = content.slice(start, i + 1);
        const parsed = tryParseJsonCandidate(candidate);
        if (parsed) return parsed;
        start = -1;
      }
    }
  }

  return null;
}

function toFiniteNumber(value: unknown, fallback = 0): number {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function extractJsonObject(content: string): string {
  const direct = tryParseJsonCandidate(content);
  if (direct) return direct;

  const fromFence = extractJsonFromCodeFence(content);
  if (fromFence) return fromFence;

  const balanced = extractBalancedJsonObject(content);
  if (balanced) return balanced;

  throw new Error(`Failed to extract JSON from model response. Preview: ${previewContent(content)}`);
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
