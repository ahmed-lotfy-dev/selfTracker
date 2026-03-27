import type { FoodAnalysisResult } from "../types/foodAnalysis";

export async function analyzeFoodImage(base64Image: string): Promise<FoodAnalysisResult> {
  const apiKey = process.env.NVIDIA_API_KEY;
  if (!apiKey) {
    throw new Error("NVIDIA_API_KEY not configured in .env");
  }

  const url = "https://integrate.api.nvidia.com/v1/chat/completions";

  // Ensure base64 string includes the data URI scheme if not present
  let imageUrl = base64Image;
  if (!base64Image.startsWith("data:image")) {
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

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "meta/llama-3.2-11b-vision-instruct",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              { type: "image_url", image_url: { url: imageUrl } }
            ],
          },
        ],
        max_tokens: 1024,
        temperature: 0.1,
        top_p: 1,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[Nvidia Vision] API Error:", response.status, errorText);
      throw new Error(`Nvidia API error: ${response.status} ${errorText}`);
    }

    const data: any = await response.json();

    const content = data.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response content from Nvidia API");
    }

    // Extract JSON from potential markdown code blocks
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Failed to extract JSON from Nvidia response");
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
  } catch (error) {
    console.error("[Nvidia Vision] Error:", error);
    throw error;
  }
}
