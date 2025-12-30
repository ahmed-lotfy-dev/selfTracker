import Groq from "groq-sdk";

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
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY not configured");
  }

  const groq = new Groq({ apiKey });

  // Ensure base64 string includes the data URI scheme if not present
  // Groq/Llama expect a data URL or a URL. For base64, data URL format is safest.
  let imageUrl = base64Image;
  if (!base64Image.startsWith('data:image')) {
    imageUrl = `data:image/jpeg;base64,${base64Image}`;
  }

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

  const chatCompletion = await groq.chat.completions.create({
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: prompt,
          },
          {
            type: "image_url",
            image_url: {
              url: imageUrl,
            },
          },
        ],
      },
    ],
    model: "llama-3.2-11b-vision-preview",
    temperature: 0.1,
    max_tokens: 1024,
    top_p: 1,
    stream: false,
    stop: null,
  });

  const content = chatCompletion.choices[0]?.message?.content;

  if (!content) {
    throw new Error("No response from Groq API");
  }

  // Extract JSON from potential markdown code blocks
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Failed to extract JSON from Groq response");
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
    confidence: 0.95,
  };
}
