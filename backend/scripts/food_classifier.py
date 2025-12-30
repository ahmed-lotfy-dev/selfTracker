import sys
import json
import warnings

# Suppress warnings
warnings.filterwarnings("ignore")

try:
    from transformers import pipeline
    from PIL import Image
except ImportError as e:
    print(json.dumps({"error": f"Missing python dependency: {str(e)}. Run: pip install transformers torch pillow"}))
    sys.exit(1)

# Basic Nutrition Database (Mapping 101 categories to average calories/macros)
# In a real app, this would be a full database lookup.
# Load Nutrition Database from JSON
try:
    with open(os.path.join(os.path.dirname(__file__), "food_101_nutrition.json"), "r") as f:
        NUTRITION_DB = json.load(f)
except FileNotFoundError:
    print(json.dumps({"error": "Nutrition database file missing! Run: docker build ."}))
    sys.exit(1)

def analyze_image(image_path):
    try:
        # Load pipeline (this will download model on first run)
        # User requested SOTA model: gabrielganan/efficientnet_b1-food101 (~99% Acc)
        
        model_name = "gabrielganan/efficientnet_b1-food101"
        
        # NOTE: EfficientNet models often require trust_remote_code=True if they rely on timm or custom configs
        classifier = pipeline("image-classification", model=model_name, trust_remote_code=True)
        
        results = classifier(image_path, top_k=3)
        
        # Process results
        detected_foods = []
        total_cals = 0
        total_protein = 0
        total_carbs = 0
        total_fat = 0
        
        # Take the top prediction
        top_prediction = results[0]
        label = top_prediction['label'].replace(" ", "_").lower()
        confidence = top_prediction['score']
        
        # Extract nutrition
        # Fuzzy match or direct lookup
        nutrition = NUTRITION_DB.get(label, NUTRITION_DB["default"])
        
        food_item = {
            "name": top_prediction['label'],
            "quantity": 1,
            "unit": nutrition['unit'],
            "calories": nutrition['calories'],
            "protein": nutrition['protein'],
            "carbs": nutrition['carbs'],
            "fat": nutrition['fat']
        }
        
        detected_foods.append(food_item)
        total_cals += food_item['calories']
        total_protein += food_item['protein']
        total_carbs += food_item['carbs']
        total_fat += food_item['fat']
        
        response = {
            "foods": detected_foods,
            "totalCalories": total_cals,
            "totalProtein": total_protein,
            "totalCarbs": total_carbs,
            "totalFat": total_fat,
            "confidence": confidence
        }
        
        print(json.dumps(response))
        
    except Exception as e:
        print(json.dumps({"error": str(e), "foods": []}))

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No image path provided"}))
        sys.exit(1)
        
    image_path = sys.argv[1]
    analyze_image(image_path)
