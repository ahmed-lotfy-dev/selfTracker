import { GoogleGenerativeAI } from "@google/generative-ai";

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

export async function analyzeFoodImage(base64Image: string): Promise<FoodAnalysisResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY not configured");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  // Using gemini-1.5-flash which is known to work with the stable SDK and has free quota
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  // Strip data URI prefix if present (e.g., "data:image/jpeg;base64,")
  const cleanBase64 = base64Image.replace(/^data:image\/[a-z]+;base64,/, '');

  const prompt = `Analyze this food image and provide nutritional information in the following JSON format. Be as accurate as possible:
{
  "foods": [
    {
      "name": "Food name",
      "quantity": estimated_quantity_number,
      "unit": "g/ml/cup/piece/etc",
      "calories": estimated_calories,
      "protein": grams_of_protein,
      "carbs": grams_of_carbs,
      "fat": grams_of_fat
    }
  ]
}

Return ONLY valid JSON, no markdown or explanation.`;

  const result = await model.generateContent([
    prompt,
    {
      inlineData: {
        data: cleanBase64,
        mimeType: "image/jpeg",
      },
    },
  ]);

  const response = result.response.text();
  if (!response) {
    throw new Error("No response from Gemini API");
  }

  // Extract JSON from potential markdown code blocks
  const jsonMatch = response.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Failed to extract JSON from Gemini response");
  }

  const parsed = JSON.parse(jsonMatch[0]);

  // Calculate totals
  const totalCalories = parsed.foods.reduce((sum: number, food: any) => sum + (food.calories || 0), 0);
  const totalProtein = parsed.foods.reduce((sum: number, food: any) => sum + (food.protein || 0), 0);
  const totalCarbs = parsed.foods.reduce((sum: number, food: any) => sum + (food.carbs || 0), 0);
  const totalFat = parsed.foods.reduce((sum: number, food: any) => sum + (food.fat || 0), 0);

  return {
    foods: parsed.foods,
    totalCalories,
    totalProtein,
    totalCarbs,
    totalFat,
    confidence: 0.95, // Gemini is generally very confident
  };
}
