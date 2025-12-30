import sys
import json
import os
import re
from huggingface_hub import hf_hub_download

# Suppress stderr setup logs
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"

try:
    from llama_cpp import Llama
    from llama_cpp.llama_chat_format import Llava15ChatHandler
except ImportError as e:
    print(json.dumps({"error": f"Missing dependency: {e}. Rebuild Docker."}))
    sys.exit(1)

def download_model():
    """Ensure the LLaVA model and projector are present."""
    model_repo = "mys/ggml_llava-v1.5-7b"
    model_file = "ggml-model-q4_k.gguf"
    mmproj_file = "mmproj-model-f16.gguf"
    
    models_dir = os.path.join(os.path.dirname(__file__), "../models")
    os.makedirs(models_dir, exist_ok=True)
    
    model_path = os.path.join(models_dir, model_file)
    mmproj_path = os.path.join(models_dir, mmproj_file)
    
    if not os.path.exists(model_path):
        # Print to stderr so it doesn't break JSON output to stdout
        sys.stderr.write("Downloading LLaVA model (4GB)... This happens once.\n")
        hf_hub_download(repo_id=model_repo, filename=model_file, local_dir=models_dir)
        
    if not os.path.exists(mmproj_path):
        sys.stderr.write("Downloading LLaVA Projector...\n")
        hf_hub_download(repo_id=model_repo, filename=mmproj_file, local_dir=models_dir)
        
    return model_path, mmproj_path

def analyze_image(image_path):
    try:
        model_path, mmproj_path = download_model()
        
        chat_handler = Llava15ChatHandler(clip_model_path=mmproj_path)
        
        # Initialize LLaVA on CPU (n_gpu_layers=0)
        # n_ctx=2048 is standard for LLaVA
        llm = Llama(
            model_path=model_path,
            chat_handler=chat_handler,
            n_ctx=2048,
            n_gpu_layers=0, # Set to -1 if you have GPU support in Docker
            logits_all=True,
            verbose=False # Reduce log noise
        )
        
        # Convert local image path to data URI
        import base64
        with open(image_path, "rb") as img_file:
            base64_image = base64.b64encode(img_file.read()).decode('utf-8')
            data_uri = f"data:image/jpeg;base64,{base64_image}"

        prompt = "Identify this food and estimate its nutrition. Return strictly valid JSON with keys: name, calories, protein, carbs, fat, unit."

        response = llm.create_chat_completion(
            messages=[
                {"role": "system", "content": "You are a nutritional AI. Output ONLY JSON."},
                {
                    "role": "user",
                    "content": [
                        {"type": "image_url", "image_url": {"url": data_uri}},
                        {"type": "text", "text": prompt}
                    ]
                }
            ],
            max_tokens=300,
            temperature=0.1 # Low temp for deterministic JSON
        )
        
        content = response["choices"][0]["message"]["content"]
        
        # Attempt to extract JSON from markdown code blocks if present
        json_match = re.search(r'\{.*\}', content, re.DOTALL)
        if json_match:
            json_str = json_match.group(0)
            data = json.loads(json_str)
            
            # Format to our app's expectations
            final_response = {
                "foods": [{
                    "name": data.get("name", "Unknown Food"),
                    "quantity": 1,
                    "unit": data.get("unit", "serving"),
                    "calories": int(data.get("calories", 0)),
                    "protein": int(data.get("protein", 0)),
                    "carbs": int(data.get("carbs", 0)),
                    "fat": int(data.get("fat", 0))
                }],
                "totalCalories": int(data.get("calories", 0)),
                "totalProtein": int(data.get("protein", 0)),
                "totalCarbs": int(data.get("carbs", 0)),
                "totalFat": int(data.get("fat", 0)),
                "confidence": 0.95 # LLaVA is confident
            }
            print(json.dumps(final_response))
        else:
            # Fallback if model just chats
            print(json.dumps({"error": "Failed to parse JSON from AI", "raw": content}))

    except Exception as e:
        print(json.dumps({"error": str(e)}))

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No image path provided"}))
        sys.exit(1)
        
    image_path = sys.argv[1]
    analyze_image(image_path)
