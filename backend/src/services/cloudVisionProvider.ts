import Groq from "groq-sdk";
import type { FoodAnalysisResult } from "../types/foodAnalysis";
import { buildFoodAnalysisResult, extractJsonObject, FOOD_ANALYSIS_PROMPT, normalizeDraftFoodItems } from "./foodAnalysisUtils";

export type { FoodAnalysisResult };

const DEFAULT_GROQ_VISION_MODEL = "meta-llama/llama-4-maverick-17b-128e-instruct";

export async function analyzeFoodImage(base64Image: string): Promise<FoodAnalysisResult> {
  const apiKey = process.env.GROQ_API_KEY;
  const model = process.env.GROQ_VISION_MODEL || DEFAULT_GROQ_VISION_MODEL;
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

  const chatCompletion = await groq.chat.completions.create({
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: FOOD_ANALYSIS_PROMPT,
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
    model,
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

  const parsed = JSON.parse(extractJsonObject(String(content)));
  const foods = normalizeDraftFoodItems(parsed.foods);

  return buildFoodAnalysisResult(foods, {
    confidence: foods.length ? foods.reduce((sum, food) => sum + (food.detectionConfidence ?? 0.45), 0) / foods.length : 0.3,
    confidenceBreakdown: {
      detection: foods.length ? foods.reduce((sum, food) => sum + (food.detectionConfidence ?? 0.45), 0) / foods.length : 0.3,
      nutritionData: 0.2,
      portionEstimation: foods.some((food) => food.estimatedGrams) ? 0.75 : 0.45,
    },
    notes: [`Initial result from Groq vision model (${model}) before nutrition-data reconciliation.`],
  });
}
