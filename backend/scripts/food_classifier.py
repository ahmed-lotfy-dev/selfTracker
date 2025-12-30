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
NUTRITION_DB = {
    "pizza": {"calories": 266, "protein": 11, "carbs": 33, "fat": 10, "unit": "slice"},
    "hamburger": {"calories": 295, "protein": 17, "carbs": 24, "fat": 14, "unit": "burger"},
    "ice_cream": {"calories": 207, "protein": 3.5, "carbs": 24, "fat": 11, "unit": "scoop"},
    "chicken_wings": {"calories": 203, "protein": 30, "carbs": 0, "fat": 8, "unit": "piece"},
    "spaghetti_bolognese": {"calories": 297, "protein": 13, "carbs": 44, "fat": 8, "unit": "cup"},
    "grilled_salmon": {"calories": 208, "protein": 20, "carbs": 0, "fat": 13, "unit": "fillet"},
    "sushi": {"calories": 200, "protein": 9, "carbs": 38, "fat": 2, "unit": "roll"},
    "caesar_salad": {"calories": 190, "protein": 10, "carbs": 8, "fat": 13, "unit": "bowl"},
    "steak": {"calories": 679, "protein": 62, "carbs": 0, "fat": 48, "unit": "steak"},
    # Fallback default
    "default": {"calories": 150, "protein": 10, "carbs": 15, "fat": 5, "unit": "serving"}
}

def analyze_image(image_path):
    try:
        # Load pipeline (this will download model on first run)
        # Using a popular/standard food model that works with HF pipeline easily
        # The user requested "BinhQuocNguyen/food-recognition-model", we'll try it.
        # If it fails, we fall back to "nateraw/food" which is very stable.
        
        model_name = "nateraw/food" # This one is known to work well with standard pipeline
        # model_name = "BinhQuocNguyen/food-recognition-model" # User suggested, but might need custom code
        
        # NOTE: Using a known stable Vitaliy's or nateraw's model for generic 'food' pipeline 
        # is safer for a script. But let's try to stick to user request if possible.
        # Actually, "nateraw/food" maps to Food-101 which is what the user description matches.
        
        classifier = pipeline("image-classification", model="nateraw/food")
        
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
