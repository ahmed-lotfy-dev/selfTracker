import { analyzeFoodImage as analyzeWithGroq, type FoodAnalysisResult } from "./cloudVisionProvider";
import { analyzeFoodImage as analyzeWithNvidia } from "./nvidiaVisionProvider";
import { enrichFoodAnalysis } from "./foodNutritionEnrichmentService";
import { buildFoodAnalysisResult } from "./foodAnalysisUtils";

export type { FoodAnalysisResult };

export async function analyzeFoodImageProxy(base64Image: string): Promise<FoodAnalysisResult> {
  // 1. Check for Mock Mode (for UI testing without API calls)
  if (process.env.MOCK_AI === "true") {
    console.log("[AI Proxy] MOCK_AI is enabled. Returning mock data.");
    await new Promise((resolve) => setTimeout(resolve, 1500));
    return buildFoodAnalysisResult([
      {
        name: "Grilled Chicken (Mock)",
        quantity: 150,
        unit: "g",
        estimatedGrams: 150,
        calories: 247,
        protein: 46,
        carbs: 0,
        fat: 5,
        detectionConfidence: 0.93,
        confidence: 0.91,
        nutritionSource: "model_estimate",
      },
      {
        name: "Rice",
        quantity: 1,
        unit: "cup",
        estimatedGrams: 158,
        calories: 216,
        protein: 5,
        carbs: 45,
        fat: 1.8,
        detectionConfidence: 0.9,
        confidence: 0.82,
        nutritionSource: "model_estimate",
      },
    ], {
      confidence: 0.87,
      confidenceBreakdown: {
        detection: 0.92,
        nutritionData: 0.3,
        portionEstimation: 0.74,
      },
      notes: ["Mock mode enabled; nutrition lookup is bypassed."],
    });
  }

  // 2. Try NVIDIA Vision AI (Preferred as requested)
  let initialResult: FoodAnalysisResult | null = null;
  if (process.env.NVIDIA_API_KEY) {
    console.log("[AI Proxy] Using NVIDIA Vision AI...");
    try {
      initialResult = await analyzeWithNvidia(base64Image);
    } catch (error) {
      console.error("[AI Proxy] NVIDIA Vision AI failed, falling back to Groq...", error);
    }
  }

  // 3. Fallback to Groq Vision AI (Cloud)
  if (!initialResult) {
    console.log("[AI Proxy] Using Groq Vision AI...");
    initialResult = await analyzeWithGroq(base64Image);
  }

  return await enrichFoodAnalysis(initialResult);
}
