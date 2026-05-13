import dotenv from "dotenv";
dotenv.config();
import { analyzeFoodImageProxy } from "../src/services/nutritionAnalysisService";

// A small 1x1 red dot image in base64
const base64Image = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

async function testNutritionAnalysis() {
  console.log("🚀 Testing Nutrition Analysis Proxy...");
  console.log("Environment Variables Check:");
  console.log(`- NVIDIA_API_KEY: ${process.env.NVIDIA_API_KEY ? "PRESENT (length " + process.env.NVIDIA_API_KEY.length + ")" : "MISSING"}`);
  console.log(`- NVIDIA_VISION_MODEL: ${process.env.NVIDIA_VISION_MODEL || "MISSING"}`);
  
  if (!process.env.NVIDIA_API_KEY) {
    console.warn("⚠️ NVIDIA_API_KEY not found in .env.");
  }

  if (!process.env.NVIDIA_VISION_MODEL) {
    console.warn("⚠️ NVIDIA_VISION_MODEL not found in .env.");
  }

  try {
    const start = Date.now();
    const result = await analyzeFoodImageProxy(base64Image);
    const duration = Date.now() - start;

    console.log("✅ Analysis Successful!");
    console.log(`⏱️ Duration: ${duration}ms`);
    console.log("📊 Results:");
    console.log(JSON.stringify(result, null, 2));
    
    if (result.foods && result.foods.length > 0) {
      console.log("✨ Test PASSED: Received structured food data.");
    } else {
      console.log("❌ Test FAILED: Received empty food list.");
    }
  } catch (error) {
    console.error("❌ Test FAILED with error:");
    console.error(error);
  }
}

testNutritionAnalysis();
