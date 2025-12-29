import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai"
import type { FoodItem } from "../db/schema/foodLogs"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")

export type FoodAnalysisResult = {
  foods: FoodItem[]
  totalCalories: number
  totalProtein: number
  totalCarbs: number
  totalFat: number
  confidence: number
}

const FOOD_ANALYSIS_PROMPT = `You are a nutrition expert AI. Analyze this food image and identify all food items visible.

For each food item, estimate:
- Name of the food
- Quantity (estimated weight in grams or count)
- Unit (g, oz, piece, cup, etc.)
- Calories
- Protein (grams)
- Carbohydrates (grams)
- Fat (grams)

Return your response as valid JSON only, no markdown, no explanation:
{
  "foods": [
    {
      "name": "food name",
      "quantity": 100,
      "unit": "g",
      "calories": 150,
      "protein": 10,
      "carbs": 15,
      "fat": 5
    }
  ],
  "confidence": 0.85
}

If you cannot identify foods clearly, still provide your best estimates and set confidence lower (0.3-0.5).
If the image is not food, return: {"foods": [], "confidence": 0, "error": "No food detected"}`

export async function analyzeFoodImage(base64Image: string): Promise<FoodAnalysisResult> {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    safetySettings: [
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
      },
    ],
  })

  const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "")

  const result = await model.generateContent([
    FOOD_ANALYSIS_PROMPT,
    {
      inlineData: {
        mimeType: "image/jpeg",
        data: base64Data,
      },
    },
  ])

  const response = result.response
  const text = response.text()

  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error("Failed to parse AI response as JSON")
  }

  const parsed = JSON.parse(jsonMatch[0])

  const foods: FoodItem[] = parsed.foods.map((f: any) => ({
    name: f.name,
    quantity: Number(f.quantity) || 0,
    unit: f.unit || "g",
    calories: Number(f.calories) || 0,
    protein: Number(f.protein) || 0,
    carbs: Number(f.carbs) || 0,
    fat: Number(f.fat) || 0,
  }))

  const totals = foods.reduce(
    (acc, f) => ({
      calories: acc.calories + f.calories,
      protein: acc.protein + f.protein,
      carbs: acc.carbs + f.carbs,
      fat: acc.fat + f.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  )

  return {
    foods,
    totalCalories: totals.calories,
    totalProtein: totals.protein,
    totalCarbs: totals.carbs,
    totalFat: totals.fat,
    confidence: parsed.confidence || 0.5,
  }
}
