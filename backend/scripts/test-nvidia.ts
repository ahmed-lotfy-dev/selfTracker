import dotenv from "dotenv";
dotenv.config();

const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY;
const NVIDIA_VISION_MODEL = process.env.NVIDIA_VISION_MODEL || "nvidia/llama-3.2-11b-vision-instruct";

if (!NVIDIA_API_KEY) {
  console.error("❌ NVIDIA_API_KEY not found in .env");
  console.log("Please add 'NVIDIA_API_KEY=your_key_here' to your .env file first.");
  process.exit(1);
}

const url = "https://integrate.api.nvidia.com/v1/chat/completions";

// A small 1x1 red dot image in base64
const base64Image = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

async function testNvidia() {
  console.log("🚀 Testing Nvidia Vision API...");
  console.log(`Model: ${NVIDIA_VISION_MODEL}`);
  
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${NVIDIA_API_KEY}`,
      },
      body: JSON.stringify({
        model: NVIDIA_VISION_MODEL,
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: "What color is this pixel? Reply with just the color name." },
              { type: "image_url", image_url: { url: base64Image } }
            ],
          },
        ],
        max_tokens: 50,
      }),
    });

    const data: any = await response.json();
    if (response.ok) {
      console.log("✅ API Connection Successful!");
      console.log("Result:", data.choices[0]?.message?.content);
    } else {
      console.log("❌ API Error!");
      console.log("Status:", response.status);
      console.log("Error Detail:", JSON.stringify(data, null, 2));
      
      if (response.status === 401) {
        console.log("Tip: Check if your API key is correct and has not expired.");
      } else if (response.status === 403) {
        console.log("Tip: This model might not be available for your current free credits. Check https://build.nvidia.com/nvidia/llama-3-2-11b-vision-instruct");
      }
    }
  } catch (error) {
    console.error("❌ Network Error:", error);
  }
}

testNvidia();
