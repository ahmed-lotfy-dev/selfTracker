# AI Vision Setup Guide

The SelfTracker backend supports multiple AI providers for food recognition and nutrition analysis. You can switch between them using environment variables in `backend/.env`.

## Available Providers

### 1. Mock Mode (Best for UI Testing)
Simulates an API response instantly without hitting any external limits or costs. Perfect for debugging the mobile app flow.
- **Cost**: Free
- **Speed**: Instant
- **Setup**:
  ```bash
  # backend/.env
  MOCK_AI=true
  ```

### 2. Google Gemini (Default)
Uses Google's Gemini Flash 2.0 / 1.5 Flash models.
- **Cost**: Free Tier (15 RPM limit) or Paid.
- **Setup**:
  ```bash
  # backend/.env
  AI_PROVIDER=gemini  # Optional (Default)
  GEMINI_API_KEY=your_google_api_key
  ```

### 3. LogMeal API (Specialized Food AI)
Uses LogMeal's specialized food recognition API.
- **Cost**: Free Trial (limited queries) / Paid.
- **Setup**:
  ```bash
  # backend/.env
  AI_PROVIDER=logmeal
  LOGMEAL_API_TOKEN=your_logmeal_token
  ```

### 4. Local AI (Truly Free & Unlimited)
Runs a Hugging Face model (`nateraw/food` or `BinhQuocNguyen/food-recognition-model`) locally on your machine via a Python script.
- **Cost**: Free
- **Speed**: Depends on CPU/GPU (2-5s typically).
- **Setup**:
  1. Install Python dependencies:
     ```bash
     cd backend
     pip3 install transformers torch pillow
     ```
  2. Configure Env:
     ```bash
     # backend/.env
     AI_PROVIDER=local
     ```
  *Note: The first run will download model weights (~500MB).*

## Troubleshooting

- **429 Errors**: Use **Mock Mode** or switch to **Local AI**.
- **Local AI Errors**: Ensure `python3` is in your PATH and dependencies are installed. Check `backend/scripts/food_classifier.py`.
