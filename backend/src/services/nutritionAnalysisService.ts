import { analyzeFoodImage as analyzeWithGroq, type FoodAnalysisResult } from "./groqVisionService";

export type { FoodAnalysisResult };

export async function analyzeFoodImageProxy(base64Image: string): Promise<FoodAnalysisResult> {
  // 1. Check for Mock Mode (for UI testing without API calls)
  if (process.env.MOCK_AI === "true") {
    console.log("[AI Proxy] MOCK_AI is enabled. Returning mock data.");
    await new Promise((resolve) => setTimeout(resolve, 1500));
    return {
      foods: [
        { name: "Grilled Chicken (Mock)", quantity: 150, unit: "g", calories: 247, protein: 46, carbs: 0, fat: 5 },
        { name: "Rice", quantity: 1, unit: "cup", calories: 216, protein: 5, carbs: 45, fat: 1.8 },
      ],
      totalCalories: 463,
      totalProtein: 51,
      totalCarbs: 45,
      totalFat: 6.8,
      confidence: 0.99,
    };
  }

  // 2. Use Groq Vision AI (Cloud)
  console.log("[AI Proxy] Using Groq Vision AI...");
  return await analyzeWithGroq(base64Image);
}
