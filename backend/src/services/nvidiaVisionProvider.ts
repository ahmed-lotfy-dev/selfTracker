import type { FoodAnalysisResult } from "../types/foodAnalysis";
import { buildFoodAnalysisResult, extractJsonObject, FOOD_ANALYSIS_PROMPT, normalizeDraftFoodItems } from "./foodAnalysisUtils";

const DEFAULT_NVIDIA_VISION_MODEL = "meta/llama-3.2-11b-vision-instruct";

export async function analyzeFoodImage(base64Image: string): Promise<FoodAnalysisResult> {
  const apiKey = process.env.NVIDIA_API_KEY;
  const model = process.env.NVIDIA_VISION_MODEL || DEFAULT_NVIDIA_VISION_MODEL;
  if (!apiKey) {
    throw new Error("NVIDIA_API_KEY not configured in .env");
  }

  const url = "https://integrate.api.nvidia.com/v1/chat/completions";

  // Ensure base64 string includes the data URI scheme if not present
  let imageUrl = base64Image;
  if (!base64Image.startsWith("data:image")) {
    imageUrl = `data:image/jpeg;base64,${base64Image}`;
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: FOOD_ANALYSIS_PROMPT },
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
    const parsed = JSON.parse(extractJsonObject(String(content)));
    const foods = normalizeDraftFoodItems(parsed.foods);
    return buildFoodAnalysisResult(foods, {
      confidence: foods.length ? foods.reduce((sum, food) => sum + (food.detectionConfidence ?? 0.45), 0) / foods.length : 0.3,
      confidenceBreakdown: {
        detection: foods.length ? foods.reduce((sum, food) => sum + (food.detectionConfidence ?? 0.45), 0) / foods.length : 0.3,
        nutritionData: 0.2,
        portionEstimation: foods.some((food) => food.estimatedGrams) ? 0.75 : 0.45,
      },
      notes: [`Initial result from NVIDIA vision model (${model}) before nutrition-data reconciliation.`],
    });
  } catch (error) {
    console.error("[Nvidia Vision] Error:", error);
    throw error;
  }
}
