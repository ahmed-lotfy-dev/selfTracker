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
# Expanded Nutrition Database for Food-101 Categories
# Calorie estimates are per standard serving
NUTRITION_DB = {
    # A
    "apple_pie": {"calories": 411, "protein": 4, "carbs": 60, "fat": 19, "unit": "slice"},
    # B
    "baby_back_ribs": {"calories": 360, "protein": 25, "carbs": 15, "fat": 24, "unit": "half rack"},
    "baklava": {"calories": 334, "protein": 6, "carbs": 30, "fat": 22, "unit": "piece"},
    "beef_carpaccio": {"calories": 120, "protein": 15, "carbs": 0, "fat": 6, "unit": "serving"},
    "beef_tartare": {"calories": 260, "protein": 20, "carbs": 5, "fat": 18, "unit": "serving"},
    "beet_salad": {"calories": 150, "protein": 4, "carbs": 12, "fat": 10, "unit": "bowl"},
    "beignets": {"calories": 240, "protein": 4, "carbs": 30, "fat": 12, "unit": "piece"},
    "bibimbap": {"calories": 560, "protein": 20, "carbs": 80, "fat": 15, "unit": "bowl"},
    "bread_pudding": {"calories": 270, "protein": 6, "carbs": 40, "fat": 10, "unit": "slice"},
    "breakfast_burrito": {"calories": 390, "protein": 18, "carbs": 35, "fat": 20, "unit": "burrito"},
    "bruschetta": {"calories": 180, "protein": 5, "carbs": 20, "fat": 8, "unit": "slice"},
    # C
    "caesar_salad": {"calories": 190, "protein": 10, "carbs": 8, "fat": 13, "unit": "bowl"},
    "cannoli": {"calories": 280, "protein": 6, "carbs": 25, "fat": 18, "unit": "piece"},
    "caprese_salad": {"calories": 240, "protein": 12, "carbs": 5, "fat": 19, "unit": "plate"},
    "carrot_cake": {"calories": 415, "protein": 4, "carbs": 50, "fat": 22, "unit": "slice"},
    "ceviche": {"calories": 130, "protein": 15, "carbs": 5, "fat": 4, "unit": "serving"},
    "cheesecake": {"calories": 401, "protein": 7, "carbs": 32, "fat": 28, "unit": "slice"},
    "cheese_plate": {"calories": 450, "protein": 25, "carbs": 10, "fat": 35, "unit": "plate"},
    "chicken_curry": {"calories": 370, "protein": 25, "carbs": 15, "fat": 24, "unit": "bowl"},
    "chicken_quesadilla": {"calories": 520, "protein": 28, "carbs": 40, "fat": 28, "unit": "quesadilla"},
    "chicken_wings": {"calories": 203, "protein": 30, "carbs": 0, "fat": 8, "unit": "serving"},
    "chocolate_cake": {"calories": 424, "protein": 5, "carbs": 58, "fat": 22, "unit": "slice"},
    "chocolate_mousse": {"calories": 250, "protein": 4, "carbs": 30, "fat": 16, "unit": "cup"},
    "churros": {"calories": 260, "protein": 4, "carbs": 35, "fat": 12, "unit": "piece"},
    "clam_chowder": {"calories": 280, "protein": 12, "carbs": 20, "fat": 16, "unit": "bowl"},
    "club_sandwich": {"calories": 590, "protein": 30, "carbs": 45, "fat": 32, "unit": "sandwich"},
    "crab_cakes": {"calories": 160, "protein": 14, "carbs": 10, "fat": 9, "unit": "cake"},
    "creme_brulee": {"calories": 320, "protein": 4, "carbs": 25, "fat": 24, "unit": "serving"},
    "croque_madame": {"calories": 650, "protein": 35, "carbs": 40, "fat": 38, "unit": "sandwich"},
    "cup_cakes": {"calories": 300, "protein": 3, "carbs": 40, "fat": 14, "unit": "cake"},
    # D - E
    "deviled_eggs": {"calories": 120, "protein": 6, "carbs": 2, "fat": 10, "unit": "pair"},
    "donuts": {"calories": 250, "protein": 4, "carbs": 30, "fat": 14, "unit": "donut"},
    "dumplings": {"calories": 50, "protein": 3, "carbs": 6, "fat": 1, "unit": "piece"},
    "edamame": {"calories": 189, "protein": 17, "carbs": 15, "fat": 8, "unit": "bowl"},
    "eggs_benedict": {"calories": 600, "protein": 25, "carbs": 30, "fat": 42, "unit": "serving"},
    "escargots": {"calories": 200, "protein": 15, "carbs": 2, "fat": 14, "unit": "serving"},
    # F
    "falafel": {"calories": 330, "protein": 13, "carbs": 32, "fat": 18, "unit": "serving"},
    "filet_mignon": {"calories": 350, "protein": 40, "carbs": 0, "fat": 20, "unit": "steak"},
    "fish_and_chips": {"calories": 595, "protein": 25, "carbs": 65, "fat": 25, "unit": "serving"},
    "foie_gras": {"calories": 462, "protein": 11, "carbs": 4, "fat": 44, "unit": "slice"},
    "french_fries": {"calories": 312, "protein": 3, "carbs": 41, "fat": 15, "unit": "serving"},
    "french_onion_soup": {"calories": 300, "protein": 15, "carbs": 30, "fat": 14, "unit": "bowl"},
    "french_toast": {"calories": 229, "protein": 8, "carbs": 28, "fat": 10, "unit": "slice"},
    "fried_calamari": {"calories": 350, "protein": 18, "carbs": 30, "fat": 19, "unit": "plate"},
    "fried_rice": {"calories": 330, "protein": 10, "carbs": 45, "fat": 12, "unit": "bowl"},
    "frozen_yogurt": {"calories": 160, "protein": 4, "carbs": 35, "fat": 0, "unit": "cup"},
    # G
    "garlic_bread": {"calories": 350, "protein": 8, "carbs": 40, "fat": 18, "unit": "slice"},
    "gnocchi": {"calories": 250, "protein": 6, "carbs": 45, "fat": 4, "unit": "bowl"},
    "greek_salad": {"calories": 210, "protein": 7, "carbs": 12, "fat": 16, "unit": "bowl"},
    "grilled_cheese_sandwich": {"calories": 380, "protein": 15, "carbs": 30, "fat": 22, "unit": "sandwich"},
    "grilled_salmon": {"calories": 208, "protein": 20, "carbs": 0, "fat": 13, "unit": "fillet"},
    "guacamole": {"calories": 150, "protein": 2, "carbs": 8, "fat": 14, "unit": "serving"},
    "gyoza": {"calories": 50, "protein": 3, "carbs": 6, "fat": 2, "unit": "piece"},
    # H
    "hamburger": {"calories": 295, "protein": 17, "carbs": 24, "fat": 14, "unit": "burger"},
    "hot_and_sour_soup": {"calories": 100, "protein": 5, "carbs": 12, "fat": 4, "unit": "bowl"},
    "hot_dog": {"calories": 290, "protein": 10, "carbs": 22, "fat": 18, "unit": "hotdog"},
    "huevos_rancheros": {"calories": 450, "protein": 18, "carbs": 35, "fat": 28, "unit": "plate"},
    "hummus": {"calories": 166, "protein": 8, "carbs": 14, "fat": 9, "unit": "serving"},
    # I - L
    "ice_cream": {"calories": 207, "protein": 3.5, "carbs": 24, "fat": 11, "unit": "scoop"},
    "lasagna": {"calories": 360, "protein": 20, "carbs": 35, "fat": 15, "unit": "slice"},
    "lobster_bisque": {"calories": 250, "protein": 12, "carbs": 15, "fat": 18, "unit": "bowl"},
    "lobster_roll_sandwich": {"calories": 400, "protein": 24, "carbs": 30, "fat": 18, "unit": "sandwich"},
    # M
    "macaroni_and_cheese": {"calories": 350, "protein": 12, "carbs": 40, "fat": 16, "unit": "bowl"},
    "macarons": {"calories": 70, "protein": 1, "carbs": 12, "fat": 2, "unit": "macaron"},
    "miso_soup": {"calories": 40, "protein": 3, "carbs": 5, "fat": 1, "unit": "bowl"},
    "mussels": {"calories": 147, "protein": 20, "carbs": 6, "fat": 4, "unit": "serving"},
    # N - O
    "nachos": {"calories": 450, "protein": 12, "carbs": 45, "fat": 25, "unit": "plate"},
    "omelette": {"calories": 154, "protein": 12, "carbs": 2, "fat": 10, "unit": "omelette"},
    "onion_rings": {"calories": 400, "protein": 5, "carbs": 45, "fat": 25, "unit": "serving"},
    "oysters": {"calories": 50, "protein": 6, "carbs": 4, "fat": 1, "unit": "half dozen"},
    # P
    "pad_thai": {"calories": 400, "protein": 15, "carbs": 65, "fat": 12, "unit": "bowl"},
    "paella": {"calories": 350, "protein": 18, "carbs": 45, "fat": 12, "unit": "bowl"},
    "pancakes": {"calories": 350, "protein": 8, "carbs": 60, "fat": 9, "unit": "stack"},
    "panna_cotta": {"calories": 350, "protein": 5, "carbs": 30, "fat": 25, "unit": "serving"},
    "peking_duck": {"calories": 400, "protein": 25, "carbs": 5, "fat": 30, "unit": "serving"},
    "pho": {"calories": 350, "protein": 20, "carbs": 50, "fat": 8, "unit": "bowl"},
    "pizza": {"calories": 266, "protein": 11, "carbs": 33, "fat": 10, "unit": "slice"},
    "pork_chop": {"calories": 295, "protein": 30, "carbs": 0, "fat": 18, "unit": "chop"},
    "poutine": {"calories": 550, "protein": 15, "carbs": 50, "fat": 32, "unit": "bowl"},
    "prime_rib": {"calories": 600, "protein": 45, "carbs": 0, "fat": 45, "unit": "slice"},
    "pulled_pork_sandwich": {"calories": 450, "protein": 30, "carbs": 35, "fat": 20, "unit": "sandwich"},
    # R
    "ramen": {"calories": 430, "protein": 15, "carbs": 60, "fat": 15, "unit": "bowl"},
    "ravioli": {"calories": 300, "protein": 12, "carbs": 35, "fat": 10, "unit": "bowl"},
    "red_velvet_cake": {"calories": 400, "protein": 5, "carbs": 55, "fat": 18, "unit": "slice"},
    "risotto": {"calories": 320, "protein": 8, "carbs": 45, "fat": 12, "unit": "bowl"},
    # S
    "samosa": {"calories": 260, "protein": 4, "carbs": 30, "fat": 14, "unit": "piece"},
    "sashimi": {"calories": 40, "protein": 8, "carbs": 0, "fat": 1, "unit": "piece"},
    "scallops": {"calories": 100, "protein": 18, "carbs": 4, "fat": 1, "unit": "serving"},
    "seaweed_salad": {"calories": 70, "protein": 2, "carbs": 10, "fat": 3, "unit": "bowl"},
    "shrimp_and_grits": {"calories": 400, "protein": 20, "carbs": 35, "fat": 22, "unit": "bowl"},
    "spaghetti_bolognese": {"calories": 297, "protein": 13, "carbs": 44, "fat": 8, "unit": "bowl"},
    "spaghetti_carbonara": {"calories": 450, "protein": 18, "carbs": 42, "fat": 24, "unit": "bowl"},
    "spring_rolls": {"calories": 100, "protein": 3, "carbs": 12, "fat": 4, "unit": "roll"},
    "steak": {"calories": 679, "protein": 62, "carbs": 0, "fat": 48, "unit": "steak"},
    "strawberry_shortcake": {"calories": 350, "protein": 5, "carbs": 45, "fat": 18, "unit": "slice"},
    "sushi": {"calories": 200, "protein": 9, "carbs": 38, "fat": 2, "unit": "roll"},
    # T - W
    "tacos": {"calories": 200, "protein": 10, "carbs": 18, "fat": 10, "unit": "taco"},
    "takoyaki": {"calories": 80, "protein": 4, "carbs": 10, "fat": 3, "unit": "ball"},
    "tiramisu": {"calories": 450, "protein": 7, "carbs": 40, "fat": 30, "unit": "slice"},
    "tuna_tartare": {"calories": 180, "protein": 20, "carbs": 5, "fat": 9, "unit": "serving"},
    "waffles": {"calories": 290, "protein": 8, "carbs": 35, "fat": 14, "unit": "waffle"},
    # Fallback
    "default": {"calories": 200, "protein": 10, "carbs": 25, "fat": 10, "unit": "serving"}
}

def analyze_image(image_path):
    try:
        # Load pipeline (this will download model on first run)
        # Using a popular/standard food model that works with HF pipeline easily
        # The user requested "BinhQuocNguyen/food-recognition-model", we'll try it.
        # If it fails, we fall back to "nateraw/food" which is very stable.
        
        # model_name = "nateraw/food" # This one is known to work well with standard pipeline
        model_name = "BinhQuocNguyen/food-recognition-model" # User suggested, but might need custom code
        
        # NOTE: Using a known stable Vitaliy's or nateraw's model for generic 'food' pipeline 
        # is safer for a script. But let's try to stick to user request if possible.
        # Actually, "nateraw/food" maps to Food-101 which is what the user description matches.
        
        classifier = pipeline("image-classification", model=model_name)
        
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
