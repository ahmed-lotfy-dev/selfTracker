import type { FoodAnalysisFoodItem, FoodAnalysisResult } from "../types/foodAnalysis";
import { buildFoodAnalysisResult } from "./foodAnalysisUtils";

type OpenFoodFactsProduct = {
  product_name?: string;
  generic_name?: string;
  serving_quantity?: number | string;
  nutriments?: Record<string, number | string | undefined>;
};

type MatchResult = {
  product: OpenFoodFactsProduct | null;
  matchScore: number;
  nutritionCoverage: number;
  grams: number;
  portionScore: number;
  source: "open_food_facts" | "model_estimate";
  food: FoodAnalysisFoodItem;
  note?: string;
};

const DEFAULT_GRAMS_BY_UNIT: Record<string, number> = {
  g: 1,
  gram: 1,
  grams: 1,
  ml: 1,
  l: 1000,
  kg: 1000,
  oz: 28.35,
  lb: 453.59,
  cup: 240,
  cups: 240,
  tbsp: 15,
  tablespoon: 15,
  tablespoons: 15,
  tsp: 5,
  teaspoon: 5,
  teaspoons: 5,
  bowl: 250,
  bowls: 250,
  plate: 300,
  plates: 300,
  slice: 30,
  slices: 30,
  piece: 100,
  pieces: 100,
  serving: 100,
  servings: 100,
};

const NAME_GRAMS_HINTS: Array<{ pattern: RegExp; grams: number }> = [
  { pattern: /\begg\b/, grams: 50 },
  { pattern: /\bbanana\b/, grams: 118 },
  { pattern: /\bapple\b/, grams: 182 },
  { pattern: /\borange\b/, grams: 130 },
  { pattern: /\bpizza\b/, grams: 125 },
  { pattern: /\bbread\b/, grams: 30 },
  { pattern: /\bchicken\b/, grams: 120 },
  { pattern: /\brice\b/, grams: 158 },
  { pattern: /\bpasta\b/, grams: 140 },
  { pattern: /\bburger\b/, grams: 180 },
];

function normalizeText(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function roundMacro(value: number): number {
  return Number(value.toFixed(1));
}

function getPer100gValue(nutriments: Record<string, number | string | undefined>, keys: string[]): number | null {
  for (const key of keys) {
    const raw = nutriments[key];
    const parsed = typeof raw === "number" ? raw : Number(raw);
    if (Number.isFinite(parsed) && parsed >= 0) return parsed;
  }

  return null;
}

function tokenize(value: string): string[] {
  return normalizeText(value).split(" ").filter(Boolean);
}

function scoreNameMatch(query: string, candidate: string): number {
  const q = tokenize(query);
  const c = tokenize(candidate);
  if (!q.length || !c.length) return 0;

  const qSet = new Set(q);
  const cSet = new Set(c);
  const overlap = [...qSet].filter((token) => cSet.has(token)).length;
  const union = new Set([...qSet, ...cSet]).size;
  const jaccard = union ? overlap / union : 0;

  const qNorm = normalizeText(query);
  const cNorm = normalizeText(candidate);
  const containsBoost = cNorm.includes(qNorm) || qNorm.includes(cNorm) ? 0.2 : 0;

  return clamp(jaccard + containsBoost, 0, 1);
}

function estimateGrams(food: FoodAnalysisFoodItem, product?: OpenFoodFactsProduct | null): { grams: number; score: number; note?: string } {
  if (food.estimatedGrams && food.estimatedGrams > 0) {
    return { grams: food.estimatedGrams, score: 0.9, note: "Used model-estimated grams from image analysis." };
  }

  const unit = normalizeText(food.unit);
  const quantity = food.quantity > 0 ? food.quantity : 1;

  if (product?.serving_quantity) {
    const servingQuantity = Number(product.serving_quantity);
    if (Number.isFinite(servingQuantity) && servingQuantity > 0 && /piece|serving|slice|bowl|cup|plate/.test(unit)) {
      return {
        grams: quantity * servingQuantity,
        score: 0.72,
        note: "Used serving quantity from nutrition database match.",
      };
    }
  }

  if (DEFAULT_GRAMS_BY_UNIT[unit]) {
    const grams = quantity * DEFAULT_GRAMS_BY_UNIT[unit];
    const exactWeightUnit = ["g", "gram", "grams", "kg", "ml", "l", "oz", "lb"].includes(unit);
    return {
      grams,
      score: exactWeightUnit ? 0.88 : 0.58,
      note: exactWeightUnit ? "Converted from explicit weight or volume unit." : "Estimated grams from serving-size heuristic.",
    };
  }

  for (const hint of NAME_GRAMS_HINTS) {
    if (hint.pattern.test(food.name)) {
      return {
        grams: quantity * hint.grams,
        score: 0.52,
        note: "Estimated grams from food-specific serving heuristic.",
      };
    }
  }

  return {
    grams: Math.max(quantity * 100, 1),
    score: 0.35,
    note: "Fell back to generic serving-size heuristic.",
  };
}

async function searchOpenFoodFacts(foodName: string): Promise<OpenFoodFactsProduct[]> {
  const url = new URL("https://world.openfoodfacts.org/cgi/search.pl");
  url.searchParams.set("search_terms", foodName);
  url.searchParams.set("search_simple", "1");
  url.searchParams.set("action", "process");
  url.searchParams.set("json", "1");
  url.searchParams.set("page_size", "8");
  url.searchParams.set("fields", "product_name,generic_name,serving_quantity,nutriments");

  const response = await fetch(url.toString(), {
    headers: {
      "User-Agent": "selfTracker/food-analysis",
    },
  });

  if (!response.ok) {
    throw new Error(`OpenFoodFacts error: ${response.status}`);
  }

  const data = await response.json() as { products?: OpenFoodFactsProduct[] };
  return Array.isArray(data.products) ? data.products : [];
}

function scoreNutritionCoverage(product: OpenFoodFactsProduct): number {
  const nutriments = product.nutriments || {};
  const available = [
    getPer100gValue(nutriments, ["energy-kcal_100g", "energy-kcal"]),
    getPer100gValue(nutriments, ["proteins_100g", "proteins"]),
    getPer100gValue(nutriments, ["carbohydrates_100g", "carbohydrates"]),
    getPer100gValue(nutriments, ["fat_100g", "fat"]),
  ].filter((value) => value !== null).length;

  return available / 4;
}

function buildEnrichedFood(food: FoodAnalysisFoodItem, product: OpenFoodFactsProduct, grams: number, nutritionCoverage: number, matchScore: number, portionScore: number, note?: string): FoodAnalysisFoodItem {
  const nutriments = product.nutriments || {};
  const factor = grams / 100;
  const calories100g = getPer100gValue(nutriments, ["energy-kcal_100g", "energy-kcal"]) ?? food.calories;
  const protein100g = getPer100gValue(nutriments, ["proteins_100g", "proteins"]) ?? food.protein;
  const carbs100g = getPer100gValue(nutriments, ["carbohydrates_100g", "carbohydrates"]) ?? food.carbs;
  const fat100g = getPer100gValue(nutriments, ["fat_100g", "fat"]) ?? food.fat;

  const confidence = clamp(
    (food.detectionConfidence ?? 0.45) * 0.35 +
      matchScore * 0.35 +
      nutritionCoverage * 0.15 +
      portionScore * 0.15,
    0.05,
    0.99,
  );

  return {
    ...food,
    estimatedGrams: Math.round(grams),
    calories: Math.round(calories100g * factor),
    protein: roundMacro(protein100g * factor),
    carbs: roundMacro(carbs100g * factor),
    fat: roundMacro(fat100g * factor),
    confidence,
    confidenceReason: note,
    nutritionSource: "open_food_facts",
    matchedProductName: product.product_name || product.generic_name || null,
  };
}

async function enrichSingleFood(food: FoodAnalysisFoodItem): Promise<MatchResult> {
  try {
    const products = await searchOpenFoodFacts(food.name);
    const scored = products
      .map((product) => {
        const candidateName = product.product_name || product.generic_name || "";
        return {
          product,
          matchScore: scoreNameMatch(food.name, candidateName),
          nutritionCoverage: scoreNutritionCoverage(product),
        };
      })
      .sort((a, b) => (b.matchScore + b.nutritionCoverage * 0.4) - (a.matchScore + a.nutritionCoverage * 0.4));

    const best = scored[0];
    if (!best || best.matchScore < 0.28 || best.nutritionCoverage < 0.25) {
      const portion = estimateGrams(food, null);
      return {
        product: null,
        matchScore: best?.matchScore ?? 0,
        nutritionCoverage: best?.nutritionCoverage ?? 0,
        grams: portion.grams,
        portionScore: portion.score,
        source: "model_estimate",
        food,
        note: "No reliable nutrition database match found; kept model-estimated nutrition.",
      };
    }

    const portion = estimateGrams(food, best.product);
    return {
      product: best.product,
      matchScore: best.matchScore,
      nutritionCoverage: best.nutritionCoverage,
      grams: portion.grams,
      portionScore: portion.score,
      source: "open_food_facts",
      food,
      note: portion.note,
    };
  } catch {
    const portion = estimateGrams(food, null);
    return {
      product: null,
      matchScore: 0,
      nutritionCoverage: 0,
      grams: portion.grams,
      portionScore: portion.score,
      source: "model_estimate",
      food,
      note: "Nutrition lookup unavailable; kept model-estimated nutrition.",
    };
  }
}

export async function enrichFoodAnalysis(result: FoodAnalysisResult): Promise<FoodAnalysisResult> {
  const matches = await Promise.all(result.foods.map((food) => enrichSingleFood(food)));
  const foods: FoodAnalysisFoodItem[] = matches.map((match) => {
    if (match.product) {
      return buildEnrichedFood(
        match.food,
        match.product,
        match.grams,
        match.nutritionCoverage,
        match.matchScore,
        match.portionScore,
        match.note,
      );
    }

    const confidence = clamp(
      (match.food.detectionConfidence ?? 0.45) * 0.5 + match.portionScore * 0.3 + 0.2,
      0.05,
      0.8,
    );

    return {
      ...match.food,
      estimatedGrams: Math.round(match.grams),
      confidence,
      confidenceReason: match.note,
      nutritionSource: "model_estimate" as const,
      matchedProductName: null,
    };
  });

  const average = (values: number[]) => values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
  const detection = average(foods.map((food) => food.detectionConfidence ?? 0.45));
  const nutritionData = average(foods.map((food) => food.nutritionSource === "open_food_facts" ? 0.9 : 0.25));
  const portionEstimation = average(
    foods.map((food) => {
      if (food.estimatedGrams && food.estimatedGrams > 0) {
        return food.confidenceReason?.includes("model-estimated grams") ? 0.9 : 0.6;
      }
      return 0.35;
    }),
  );

  const notes = foods
    .map((food) => food.confidenceReason)
    .filter((note): note is string => Boolean(note));

  return buildFoodAnalysisResult(foods, {
    confidence: average(foods.map((food) => food.confidence ?? 0.4)),
    confidenceBreakdown: {
      detection: roundMacro(detection),
      nutritionData: roundMacro(nutritionData),
      portionEstimation: roundMacro(portionEstimation),
    },
    notes,
  });
}
