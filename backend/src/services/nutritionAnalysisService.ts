import { analyzeWithLocalModel } from "./localAiService";
// import type { FoodAnalysisResult } from "./geminiVisionService"; // Removing dependency

// Define result type locally since we deleted the other file
export type FoodAnalysisResult = {
  foods: {
    name: string;
    quantity: number;
    unit: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  confidence: number;
};

export async function analyzeFoodImageProxy(base64Image: string): Promise<FoodAnalysisResult> {
  // 1. Check for Mock Mode FIRST (for UI testing)
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

  // 2. Default/Only Option: Local AI
  console.log("[AI Proxy] Using Local AI Model...");
  return await analyzeWithLocalModel(base64Image) as FoodAnalysisResult;
}
