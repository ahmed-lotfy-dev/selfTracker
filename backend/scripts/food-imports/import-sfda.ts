/**
 * SFDA Arabic Food Import Script
 * 
 * Imports Arabic food data from:
 * 1. A CSV file you provide (SFDA food composition tables)
 * 2. Built-in seed data of common Arabic/Middle Eastern foods
 * 
 * SFDA data can be found at:
 *   https://www.sfda.gov.sa/en/food-composition-table
 *   (Download the Excel/CSV and place in the data directory)
 * 
 * Usage (on VPS):
 *   cd /path/to/backend
 *   # Import built-in Arabic food seed data:
 *   bun run scripts/food-imports/import-sfda.ts --seed
 *   
 *   # Import from SFDA CSV file:
 *   bun run scripts/food-imports/import-sfda.ts --file /tmp/food-imports/sfda/arabic_foods.csv
 *   
 *   # Import both:
 *   bun run scripts/food-imports/import-sfda.ts --seed --file /tmp/food-imports/sfda/arabic_foods.csv
 * 
 * Expected CSV format (columns):
 *   name_ar, name_en, category, serving_size, serving_unit, calories, protein, carbs, fat, fiber, sugar, sodium
 */

import { createReadStream, existsSync, mkdirSync } from "fs"
import { parse } from "csv-parse"
import { db } from "../../src/db"
import { foods } from "../../src/db/schema"
import { eq, and } from "drizzle-orm"

const BATCH_SIZE = 200

// Built-in Arabic/Middle Eastern food seed data
// Nutrition values are per 100g serving, sourced from USDA and SFDA references
const ARABIC_FOODS_SEED = [
  // === GRAINS & BREAD ===
  { nameAr: "أرز أبيض", nameEn: "White rice, cooked", category: "grains", servingSize: 100, servingUnit: "g", calories: 130, protein: 2.7, carbs: 28, fat: 0.3, fiber: 0.4, sugar: 0, sodium: 1 },
  { nameAr: "أرز بني", nameEn: "Brown rice, cooked", category: "grains", servingSize: 100, servingUnit: "g", calories: 112, protein: 2.6, carbs: 24, fat: 0.9, fiber: 1.8, sugar: 0.4, sodium: 1 },
  { nameAr: "خبز أبيض", nameEn: "White bread", category: "grains", servingSize: 30, servingUnit: "g", calories: 80, protein: 2.5, carbs: 15, fat: 1, fiber: 0.6, sugar: 1.5, sodium: 150 },
  { nameAr: "خبز بلدي", nameEn: "Egyptian baladi bread", category: "grains", servingSize: 60, servingUnit: "g", calories: 160, protein: 5, carbs: 32, fat: 1.5, fiber: 1.5, sugar: 1, sodium: 280 },
  { nameAr: "خبش شباتي", nameEn: "Chapati bread", category: "grains", servingSize: 40, servingUnit: "g", calories: 120, protein: 3, carbs: 20, fat: 3, fiber: 1, sugar: 0.5, sodium: 100 },
  { nameAr: "فريكة", nameEn: "Freekeh, cooked", category: "grains", servingSize: 100, servingUnit: "g", calories: 140, protein: 5, carbs: 25, fat: 1.5, fiber: 4, sugar: 0.5, sodium: 5 },
  { nameAr: "برغل", nameEn: "Bulgur, cooked", category: "grains", servingSize: 100, servingUnit: "g", calories: 83, protein: 3, carbs: 19, fat: 0.2, fiber: 4.5, sugar: 0.1, sodium: 5 },
  { nameAr: "كسكسي", nameEn: "Couscous, cooked", category: "grains", servingSize: 100, servingUnit: "g", calories: 112, protein: 3.8, carbs: 23, fat: 0.2, fiber: 1.4, sugar: 0.1, sodium: 5 },
  { nameAr: "معكرونة", nameEn: "Pasta, cooked", category: "grains", servingSize: 100, servingUnit: "g", calories: 131, protein: 5, carbs: 25, fat: 1.1, fiber: 1.8, sugar: 0.6, sodium: 1 },
  { nameAr: "شعيرية", nameEn: "Vermicelli, cooked", category: "grains", servingSize: 100, servingUnit: "g", calories: 120, protein: 4, carbs: 22, fat: 1, fiber: 1, sugar: 0.5, sodium: 5 },

  // === PROTEINS ===
  { nameAr: "دجاج مشوي", nameEn: "Grilled chicken breast", category: "protein", servingSize: 100, servingUnit: "g", calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0, sugar: 0, sodium: 74 },
  { nameAr: "دجاج مسلوق", nameEn: "Boiled chicken", category: "protein", servingSize: 100, servingUnit: "g", calories: 150, protein: 28, carbs: 0, fat: 3, fiber: 0, sugar: 0, sodium: 65 },
  { nameAr: "لحم بقري", nameEn: "Beef, cooked", category: "protein", servingSize: 100, servingUnit: "g", calories: 250, protein: 26, carbs: 0, fat: 15, fiber: 0, sugar: 0, sodium: 72 },
  { nameAr: "لحم مفروم", nameEn: "Ground beef, cooked", category: "protein", servingSize: 100, servingUnit: "g", calories: 250, protein: 26, carbs: 0, fat: 15, fiber: 0, sugar: 0, sodium: 75 },
  { nameAr: "لحم غنم", nameEn: "Lamb, cooked", category: "protein", servingSize: 100, servingUnit: "g", calories: 280, protein: 25, carbs: 0, fat: 20, fiber: 0, sugar: 0, sodium: 70 },
  { nameAr: "سمك مشوي", nameEn: "Grilled fish", category: "protein", servingSize: 100, servingUnit: "g", calories: 130, protein: 22, carbs: 0, fat: 4, fiber: 0, sugar: 0, sodium: 60 },
  { nameAr: "سمك فيليه", nameEn: "Fish fillet", category: "protein", servingSize: 100, servingUnit: "g", calories: 96, protein: 20, carbs: 0, fat: 1.5, fiber: 0, sugar: 0, sodium: 50 },
  { nameAr: "جمبري", nameEn: "Shrimp", category: "protein", servingSize: 100, servingUnit: "g", calories: 99, protein: 24, carbs: 0.2, fat: 0.3, fiber: 0, sugar: 0, sodium: 111 },
  { nameAr: "بيض مسلوق", nameEn: "Boiled egg", category: "protein", servingSize: 50, servingUnit: "g", calories: 78, protein: 6.3, carbs: 0.6, fat: 5.3, fiber: 0, sugar: 0.6, sodium: 62 },
  { nameAr: "بيض مقلي", nameEn: "Fried egg", category: "protein", servingSize: 50, servingUnit: "g", calories: 90, protein: 6, carbs: 0.6, fat: 7, fiber: 0, sugar: 0.6, sodium: 95 },
  { nameAr: "فول مدمس", nameEn: "Fava beans (ful medames)", category: "protein", servingSize: 100, servingUnit: "g", calories: 110, protein: 8, carbs: 17, fat: 0.5, fiber: 5, sugar: 0.3, sodium: 150 },
  { nameAr: "عدس", nameEn: "Lentils, cooked", category: "protein", servingSize: 100, servingUnit: "g", calories: 116, protein: 9, carbs: 20, fat: 0.4, fiber: 7.9, sugar: 1.8, sodium: 2 },
  { nameAr: "حمص مسلوق", nameEn: "Chickpeas, cooked", category: "protein", servingSize: 100, servingUnit: "g", calories: 164, protein: 8.9, carbs: 27, fat: 2.6, fiber: 7.6, sugar: 4.8, sodium: 7 },
  { nameAr: "فاصوليا بيضاء", nameEn: "White beans, cooked", category: "protein", servingSize: 100, servingUnit: "g", calories: 114, protein: 7, carbs: 21, fat: 0.3, fiber: 5.5, sugar: 0.5, sodium: 10 },

  // === DAIRY ===
  { nameAr: "حليب كامل الدسم", nameEn: "Whole milk", category: "dairy", servingSize: 240, servingUnit: "ml", calories: 150, protein: 8, carbs: 12, fat: 8, fiber: 0, sugar: 12, sodium: 120 },
  { nameAr: "حليب قليل الدسم", nameEn: "Low-fat milk", category: "dairy", servingSize: 240, servingUnit: "ml", calories: 102, protein: 8, carbs: 12, fat: 2.4, fiber: 0, sugar: 12, sodium: 120 },
  { nameAr: "لبن زبادي", nameEn: "Yogurt, plain", category: "dairy", servingSize: 170, servingUnit: "g", calories: 100, protein: 17, carbs: 6, fat: 0.7, fiber: 0, sugar: 6, sodium: 60 },
  { nameAr: "زبادي يوناني", nameEn: "Greek yogurt", category: "dairy", servingSize: 170, servingUnit: "g", calories: 100, protein: 17, carbs: 6, fat: 0.7, fiber: 0, sugar: 6, sodium: 60 },
  { nameAr: "جبنة بيضاء", nameEn: "White cheese (halloumi style)", category: "dairy", servingSize: 30, servingUnit: "g", calories: 100, protein: 6, carbs: 1, fat: 8, fiber: 0, sugar: 1, sodium: 200 },
  { nameAr: "جبنة شيدر", nameEn: "Cheddar cheese", category: "dairy", servingSize: 30, servingUnit: "g", calories: 113, protein: 7, carbs: 0.4, fat: 9.3, fiber: 0, sugar: 0.1, sodium: 180 },
  { nameAr: "جبنة موزاريلا", nameEn: "Mozzarella cheese", category: "dairy", servingSize: 30, servingUnit: "g", calories: 85, protein: 6, carbs: 0.7, fat: 6.3, fiber: 0, sugar: 0.3, sodium: 130 },
  { nameAr: "لبنة", nameEn: "Labneh", category: "dairy", servingSize: 30, servingUnit: "g", calories: 60, protein: 3, carbs: 2, fat: 4.5, fiber: 0, sugar: 2, sodium: 40 },
  { nameAr: "قشطة", nameEn: "Cream (qishta)", category: "dairy", servingSize: 30, servingUnit: "g", calories: 100, protein: 1.5, carbs: 2, fat: 10, fiber: 0, sugar: 2, sodium: 20 },
  { nameAr: "زبدة", nameEn: "Butter", category: "dairy", servingSize: 14, servingUnit: "g", calories: 100, protein: 0.1, carbs: 0, fat: 11, fiber: 0, sugar: 0, sodium: 2 },

  // === VEGETABLES ===
  { nameAr: "خيار", nameEn: "Cucumber", category: "vegetables", servingSize: 100, servingUnit: "g", calories: 15, protein: 0.7, carbs: 3.6, fat: 0.1, fiber: 0.5, sugar: 1.7, sodium: 2 },
  { nameAr: "طماطم", nameEn: "Tomato", category: "vegetables", servingSize: 100, servingUnit: "g", calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, fiber: 1.2, sugar: 2.6, sodium: 5 },
  { nameAr: "بطاطس مسلوقة", nameEn: "Boiled potato", category: "vegetables", servingSize: 100, servingUnit: "g", calories: 87, protein: 1.9, carbs: 20, fat: 0.1, fiber: 1.8, sugar: 0.9, sodium: 6 },
  { nameAr: "بطاطس مقلية", nameEn: "French fries", category: "vegetables", servingSize: 100, servingUnit: "g", calories: 312, protein: 3.4, carbs: 41, fat: 15, fiber: 3.8, sugar: 0.3, sodium: 210 },
  { nameAr: "بصل", nameEn: "Onion", category: "vegetables", servingSize: 100, servingUnit: "g", calories: 40, protein: 1.1, carbs: 9.3, fat: 0.1, fiber: 1.7, sugar: 4.2, sodium: 4 },
  { nameAr: "ثوم", nameEn: "Garlic", category: "vegetables", servingSize: 100, servingUnit: "g", calories: 149, protein: 6.4, carbs: 33, fat: 0.5, fiber: 2.1, sugar: 1, sodium: 17 },
  { nameAr: "فلفل أخضر", nameEn: "Green pepper", category: "vegetables", servingSize: 100, servingUnit: "g", calories: 20, protein: 0.9, carbs: 4.6, fat: 0.2, fiber: 1.7, sugar: 2.4, sodium: 3 },
  { nameAr: "جزر", nameEn: "Carrot", category: "vegetables", servingSize: 100, servingUnit: "g", calories: 41, protein: 0.9, carbs: 10, fat: 0.2, fiber: 2.8, sugar: 4.7, sodium: 69 },
  { nameAr: "باذنجان", nameEn: "Eggplant", category: "vegetables", servingSize: 100, servingUnit: "g", calories: 25, protein: 1, carbs: 6, fat: 0.2, fiber: 3, sugar: 3.5, sodium: 2 },
  { nameAr: "كوسة", nameEn: "Zucchini", category: "vegetables", servingSize: 100, servingUnit: "g", calories: 17, protein: 1.2, carbs: 3.1, fat: 0.3, fiber: 1, sugar: 2.5, sodium: 8 },
  { nameAr: "ملفوف", nameEn: "Cabbage", category: "vegetables", servingSize: 100, servingUnit: "g", calories: 25, protein: 1.3, carbs: 5.8, fat: 0.1, fiber: 2.5, sugar: 3.2, sodium: 18 },
  { nameAr: "سبانخ", nameEn: "Spinach", category: "vegetables", servingSize: 100, servingUnit: "g", calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, fiber: 2.2, sugar: 0.4, sodium: 79 },
  { nameAr: "خس", nameEn: "Lettuce", category: "vegetables", servingSize: 100, servingUnit: "g", calories: 15, protein: 1.4, carbs: 2.9, fat: 0.2, fiber: 1.3, sugar: 0.8, sodium: 28 },
  { nameAr: "بقدونس", nameEn: "Parsley", category: "vegetables", servingSize: 100, servingUnit: "g", calories: 36, protein: 3, carbs: 6.3, fat: 0.8, fiber: 3.3, sugar: 0.9, sodium: 56 },
  { nameAr: "نعناع", nameEn: "Mint", category: "vegetables", servingSize: 100, servingUnit: "g", calories: 44, protein: 3.3, carbs: 8.4, fat: 0.7, fiber: 6.8, sugar: 0, sodium: 30 },
  { nameAr: "بامية", nameEn: "Okra", category: "vegetables", servingSize: 100, servingUnit: "g", calories: 33, protein: 1.9, carbs: 7, fat: 0.2, fiber: 3.2, sugar: 1.5, sodium: 7 },
  { nameAr: "ملوخية", nameEn: "Molokhia (jute leaves)", category: "vegetables", servingSize: 100, servingUnit: "g", calories: 32, protein: 3.2, carbs: 5.8, fat: 0.3, fiber: 2.4, sugar: 0.5, sodium: 10 },
  { nameAr: "ورق عنب", nameEn: "Grape leaves (warak enab)", category: "vegetables", servingSize: 100, servingUnit: "g", calories: 60, protein: 4, carbs: 10, fat: 1.5, fiber: 5, sugar: 2, sodium: 50 },

  // === FRUITS ===
  { nameAr: "تفاح", nameEn: "Apple", category: "fruits", servingSize: 182, servingUnit: "g", calories: 95, protein: 0.5, carbs: 25, fat: 0.3, fiber: 4.4, sugar: 19, sodium: 2 },
  { nameAr: "موز", nameEn: "Banana", category: "fruits", servingSize: 118, servingUnit: "g", calories: 105, protein: 1.3, carbs: 27, fat: 0.4, fiber: 3.1, sugar: 14, sodium: 1 },
  { nameAr: "برتقال", nameEn: "Orange", category: "fruits", servingSize: 131, servingUnit: "g", calories: 62, protein: 1.2, carbs: 15, fat: 0.2, fiber: 3.1, sugar: 12, sodium: 0 },
  { nameAr: "فراولة", nameEn: "Strawberry", category: "fruits", servingSize: 100, servingUnit: "g", calories: 32, protein: 0.7, carbs: 7.7, fat: 0.3, fiber: 2, sugar: 4.9, sodium: 1 },
  { nameAr: "عنب", nameEn: "Grapes", category: "fruits", servingSize: 100, servingUnit: "g", calories: 69, protein: 0.7, carbs: 18, fat: 0.2, fiber: 0.9, sugar: 16, sodium: 2 },
  { nameAr: "رمان", nameEn: "Pomegranate", category: "fruits", servingSize: 100, servingUnit: "g", calories: 83, protein: 1.7, carbs: 19, fat: 1.2, fiber: 4, sugar: 14, sodium: 3 },
  { nameAr: "تين", nameEn: "Fig", category: "fruits", servingSize: 100, servingUnit: "g", calories: 74, protein: 0.8, carbs: 19, fat: 0.3, fiber: 2.9, sugar: 16, sodium: 1 },
  { nameAr: "تمر", nameEn: "Dates", category: "fruits", servingSize: 100, servingUnit: "g", calories: 277, protein: 1.8, carbs: 75, fat: 0.2, fiber: 6.7, sugar: 66, sodium: 1 },
  { nameAr: "تمر مجدول", nameEn: "Medjool date", category: "fruits", servingSize: 24, servingUnit: "g", calories: 66, protein: 0.4, carbs: 18, fat: 0, fiber: 1.6, sugar: 16, sodium: 0 },
  { nameAr: "بطيخ", nameEn: "Watermelon", category: "fruits", servingSize: 100, servingUnit: "g", calories: 30, protein: 0.6, carbs: 7.6, fat: 0.2, fiber: 0.4, sugar: 6.2, sodium: 1 },
  { nameAr: "شمام", nameEn: "Cantaloupe", category: "fruits", servingSize: 100, servingUnit: "g", calories: 34, protein: 0.8, carbs: 8.2, fat: 0.2, fiber: 0.9, sugar: 7.9, sodium: 16 },
  { nameAr: "خوخ", nameEn: "Peach", category: "fruits", servingSize: 100, servingUnit: "g", calories: 39, protein: 0.9, carbs: 10, fat: 0.3, fiber: 1.5, sugar: 8.4, sodium: 0 },
  { nameAr: "مشمش", nameEn: "Apricot", category: "fruits", servingSize: 100, servingUnit: "g", calories: 48, protein: 1.4, carbs: 11, fat: 0.4, fiber: 2, sugar: 9.2, sodium: 1 },
  { nameAr: "جوافة", nameEn: "Guava", category: "fruits", servingSize: 100, servingUnit: "g", calories: 68, protein: 2.6, carbs: 14, fat: 1, fiber: 5.4, sugar: 9, sodium: 2 },
  { nameAr: "مانجو", nameEn: "Mango", category: "fruits", servingSize: 100, servingUnit: "g", calories: 60, protein: 0.8, carbs: 15, fat: 0.4, fiber: 1.6, sugar: 14, sodium: 1 },
  { nameAr: "ليمون", nameEn: "Lemon", category: "fruits", servingSize: 100, servingUnit: "g", calories: 29, protein: 1.1, carbs: 9.3, fat: 0.3, fiber: 2.8, sugar: 2.5, sodium: 2 },

  // === NUTS & SEEDS ===
  { nameAr: "لوز", nameEn: "Almonds", category: "nuts", servingSize: 28, servingUnit: "g", calories: 164, protein: 6, carbs: 6, fat: 14, fiber: 3.5, sugar: 1.2, sodium: 0 },
  { nameAr: "جوز", nameEn: "Walnuts", category: "nuts", servingSize: 28, servingUnit: "g", calories: 185, protein: 4.3, carbs: 3.9, fat: 18.5, fiber: 1.9, sugar: 0.7, sodium: 1 },
  { nameAr: "كاجو", nameEn: "Cashews", category: "nuts", servingSize: 28, servingUnit: "g", calories: 157, protein: 5.2, carbs: 8.6, fat: 12, fiber: 0.9, sugar: 1.7, sodium: 3 },
  { nameAr: "فستق", nameEn: "Pistachios", category: "nuts", servingSize: 28, servingUnit: "g", calories: 159, protein: 5.7, carbs: 7.7, fat: 13, fiber: 3, sugar: 2.2, sodium: 0 },
  { nameAr: "بذور شيا", nameEn: "Chia seeds", category: "nuts", servingSize: 28, servingUnit: "g", calories: 138, protein: 4.7, carbs: 12, fat: 8.7, fiber: 9.8, sugar: 0, sodium: 5 },
  { nameAr: "بذور كتان", nameEn: "Flax seeds", category: "nuts", servingSize: 28, servingUnit: "g", calories: 150, protein: 5.1, carbs: 8.2, fat: 12, fiber: 7.6, sugar: 0.4, sodium: 9 },
  { nameAr: "سمسم", nameEn: "Sesame seeds", category: "nuts", servingSize: 28, servingUnit: "g", calories: 160, protein: 4.8, carbs: 7.3, fat: 14, fiber: 3.3, sugar: 0.1, sodium: 3 },
  { nameAr: "صنوبر", nameEn: "Pine nuts", category: "nuts", servingSize: 28, servingUnit: "g", calories: 191, protein: 3.9, carbs: 3.7, fat: 19, fiber: 1.1, sugar: 1, sodium: 1 },

  // === LEGUMES & PULSES ===
  { nameAr: "حمص معلب", nameEn: "Chickpeas, canned", category: "legumes", servingSize: 100, servingUnit: "g", calories: 139, protein: 7.1, carbs: 22, fat: 2.1, fiber: 6.4, sugar: 4, sodium: 246 },
  { nameAr: "عدس أحمر", nameEn: "Red lentils, cooked", category: "legumes", servingSize: 100, servingUnit: "g", calories: 100, protein: 7.5, carbs: 17, fat: 0.3, fiber: 3, sugar: 1.5, sodium: 2 },
  { nameAr: "عدس أصفر", nameEn: "Yellow lentils, cooked", category: "legumes", servingSize: 100, servingUnit: "g", calories: 105, protein: 8, carbs: 18, fat: 0.3, fiber: 4, sugar: 1.5, sodium: 2 },
  { nameAr: "فول", nameEn: "Fava beans, raw", category: "legumes", servingSize: 100, servingUnit: "g", calories: 341, protein: 26, carbs: 58, fat: 1.5, fiber: 25, sugar: 5.7, sodium: 13 },
  { nameAr: "ترمس", nameEn: "Lupini beans", category: "legumes", servingSize: 100, servingUnit: "g", calories: 119, protein: 16, carbs: 10, fat: 2.9, fiber: 2.8, sugar: 0, sodium: 4 },

  // === OILS & FATS ===
  { nameAr: "زيت زيتون", nameEn: "Olive oil", category: "oils", servingSize: 14, servingUnit: "ml", calories: 119, protein: 0, carbs: 0, fat: 14, fiber: 0, sugar: 0, sodium: 0 },
  { nameAr: "زيت ذرة", nameEn: "Corn oil", category: "oils", servingSize: 14, servingUnit: "ml", calories: 120, protein: 0, carbs: 0, fat: 14, fiber: 0, sugar: 0, sodium: 0 },
  { nameAr: "زيت دوار الشمس", nameEn: "Sunflower oil", category: "oils", servingSize: 14, servingUnit: "ml", calories: 120, protein: 0, carbs: 0, fat: 14, fiber: 0, sugar: 0, sodium: 0 },
  { nameAr: "سمن بلدي", nameEn: "Ghee (clarified butter)", category: "oils", servingSize: 14, servingUnit: "ml", calories: 112, protein: 0, carbs: 0, fat: 13, fiber: 0, sugar: 0, sodium: 0 },
  { nameAr: "طحينة", nameEn: "Tahini", category: "oils", servingSize: 15, servingUnit: "g", calories: 89, protein: 2.6, carbs: 3.2, fat: 8, fiber: 1.4, sugar: 0.1, sodium: 17 },

  // === BEVERAGES ===
  { nameAr: "شاي", nameEn: "Tea (black, no sugar)", category: "beverages", servingSize: 240, servingUnit: "ml", calories: 2, protein: 0, carbs: 0.7, fat: 0, fiber: 0, sugar: 0, sodium: 7 },
  { nameAr: "شاي بالسكر", nameEn: "Tea with sugar", category: "beverages", servingSize: 240, servingUnit: "ml", calories: 47, protein: 0, carbs: 12, fat: 0, fiber: 0, sugar: 11, sodium: 7 },
  { nameAr: "قهوة سوداء", nameEn: "Black coffee", category: "beverages", servingSize: 240, servingUnit: "ml", calories: 2, protein: 0.3, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 5 },
  { nameAr: "قعر بالحليب", nameEn: "Coffee with milk", category: "beverages", servingSize: 240, servingUnit: "ml", calories: 30, protein: 1.5, carbs: 3, fat: 1.5, fiber: 0, sugar: 2.5, sodium: 25 },
  { nameAr: "عصير برتقال طازج", nameEn: "Fresh orange juice", category: "beverages", servingSize: 240, servingUnit: "ml", calories: 112, protein: 1.7, carbs: 26, fat: 0.5, fiber: 0.5, sugar: 21, sodium: 2 },
  { nameAr: "عصير مانجو", nameEn: "Mango juice", category: "beverages", servingSize: 240, servingUnit: "ml", calories: 120, protein: 0.5, carbs: 29, fat: 0.3, fiber: 0.5, sugar: 27, sodium: 10 },
  { nameAr: "تمر هندي", nameEn: "Tamarind juice", category: "beverages", servingSize: 240, servingUnit: "ml", calories: 60, protein: 0.5, carbs: 15, fat: 0.2, fiber: 1, sugar: 12, sodium: 15 },
  { nameAr: "كركديه", nameEn: "Hibiscus tea (karkade)", category: "beverages", servingSize: 240, servingUnit: "ml", calories: 30, protein: 0, carbs: 7, fat: 0, fiber: 0, sugar: 6, sodium: 5 },
  { nameAr: "ماء", nameEn: "Water", category: "beverages", servingSize: 240, servingUnit: "ml", calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0 },

  // === ARABIC DISHES ===
  { nameAr: "كبسة", nameEn: "Kabsa (Saudi rice with chicken)", category: "dishes", servingSize: 200, servingUnit: "g", calories: 350, protein: 20, carbs: 40, fat: 12, fiber: 2, sugar: 2, sodium: 400 },
  { nameAr: "مندي", nameEn: "Mandi (Yemeni rice with meat)", category: "dishes", servingSize: 200, servingUnit: "g", calories: 380, protein: 22, carbs: 42, fat: 14, fiber: 2, sugar: 2, sodium: 420 },
  { nameAr: "برياني", nameEn: "Biryani", category: "dishes", servingSize: 200, servingUnit: "g", calories: 350, protein: 18, carbs: 45, fat: 12, fiber: 2, sugar: 3, sodium: 450 },
  { nameAr: "كشري", nameEn: "Koshari (Egyptian dish)", category: "dishes", servingSize: 250, servingUnit: "g", calories: 380, protein: 12, carbs: 65, fat: 8, fiber: 6, sugar: 5, sodium: 500 },
  { nameAr: "محشي كوسة", nameEn: "Stuffed zucchini (mahshi)", category: "dishes", servingSize: 150, servingUnit: "g", calories: 180, protein: 8, carbs: 20, fat: 8, fiber: 3, sugar: 4, sodium: 300 },
  { nameAr: "محشي ورق عنب", nameEn: "Stuffed grape leaves", category: "dishes", servingSize: 150, servingUnit: "g", calories: 200, protein: 6, carbs: 25, fat: 9, fiber: 3, sugar: 3, sodium: 350 },
  { nameAr: "فتوش", nameEn: "Fattoush salad", category: "dishes", servingSize: 150, servingUnit: "g", calories: 120, protein: 3, carbs: 12, fat: 7, fiber: 3, sugar: 4, sodium: 200 },
  { nameAr: "تبولة", nameEn: "Tabbouleh", category: "dishes", servingSize: 100, servingUnit: "g", calories: 120, protein: 2, carbs: 10, fat: 8, fiber: 2, sugar: 2, sodium: 250 },
  { nameAr: "حمص بالطحينة", nameEn: "Hummus with tahini", category: "dishes", servingSize: 100, servingUnit: "g", calories: 166, protein: 8, carbs: 14, fat: 10, fiber: 6, sugar: 0.3, sodium: 300 },
  { nameAr: "متبل", nameEn: "Baba ganoush (moutabal)", category: "dishes", servingSize: 100, servingUnit: "g", calories: 120, protein: 3, carbs: 8, fat: 9, fiber: 3, sugar: 3, sodium: 200 },
  { nameAr: "فلافل", nameEn: "Falafel", category: "dishes", servingSize: 30, servingUnit: "g", calories: 100, protein: 3, carbs: 10, fat: 6, fiber: 2, sugar: 0.5, sodium: 150 },
  { nameAr: "شاورما دجاج", nameEn: "Chicken shawarma", category: "dishes", servingSize: 200, servingUnit: "g", calories: 350, protein: 25, carbs: 30, fat: 15, fiber: 2, sugar: 3, sodium: 500 },
  { nameAr: "شاورما لحم", nameEn: "Beef shawarma", category: "dishes", servingSize: 200, servingUnit: "g", calories: 380, protein: 28, carbs: 28, fat: 18, fiber: 2, sugar: 3, sodium: 520 },
  { nameAr: "فتة", nameEn: "Fattah (bread with meat)", category: "dishes", servingSize: 250, servingUnit: "g", calories: 400, protein: 20, carbs: 35, fat: 20, fiber: 2, sugar: 3, sodium: 450 },
  { nameAr: "طاجين لحم", nameEn: "Meat tagine", category: "dishes", servingSize: 200, servingUnit: "g", calories: 280, protein: 22, carbs: 15, fat: 16, fiber: 3, sugar: 5, sodium: 350 },
  { nameAr: "مسخن", nameEn: "Musakhan (chicken with sumac)", category: "dishes", servingSize: 200, servingUnit: "g", calories: 320, protein: 20, carbs: 35, fat: 12, fiber: 3, sugar: 4, sodium: 380 },
  { nameAr: "مقلوبة", nameEn: "Maqluba (upside-down rice)", category: "dishes", servingSize: 200, servingUnit: "g", calories: 300, protein: 15, carbs: 40, fat: 10, fiber: 2, sugar: 3, sodium: 350 },
  { nameAr: "مجدرة", nameEn: "Mujaddara (lentils with rice)", category: "dishes", servingSize: 200, servingUnit: "g", calories: 250, protein: 10, carbs: 40, fat: 5, fiber: 5, sugar: 2, sodium: 200 },
  { nameAr: "شوربة عدس", nameEn: "Lentil soup", category: "dishes", servingSize: 250, servingUnit: "ml", calories: 150, protein: 9, carbs: 20, fat: 3, fiber: 4, sugar: 2, sodium: 300 },
  { nameAr: "شوربة خضار", nameEn: "Vegetable soup", category: "dishes", servingSize: 250, servingUnit: "ml", calories: 80, protein: 3, carbs: 12, fat: 2, fiber: 2, sugar: 4, sodium: 350 },

  // === SWEETS & DESSERTS ===
  { nameAr: "كنافة", nameEn: "Kunafa", category: "sweets", servingSize: 100, servingUnit: "g", calories: 350, protein: 6, carbs: 45, fat: 18, fiber: 1, sugar: 30, sodium: 150 },
  { nameAr: "بقلاوة", nameEn: "Baklava", category: "sweets", servingSize: 50, servingUnit: "g", calories: 230, protein: 3, carbs: 25, fat: 14, fiber: 1, sugar: 15, sodium: 80 },
  { nameAr: "أم علي", nameEn: "Um Ali (Egyptian bread pudding)", category: "sweets", servingSize: 150, servingUnit: "g", calories: 320, protein: 8, carbs: 35, fat: 16, fiber: 1, sugar: 22, sodium: 150 },
  { nameAr: "بسبوسة", nameEn: "Basbousa (semolina cake)", category: "sweets", servingSize: 80, servingUnit: "g", calories: 280, protein: 4, carbs: 40, fat: 12, fiber: 1, sugar: 25, sodium: 100 },
  { nameAr: "قطايف", nameEn: "Qatayef (stuffed pancake)", category: "sweets", servingSize: 60, servingUnit: "g", calories: 180, protein: 3, carbs: 25, fat: 8, fiber: 1, sugar: 15, sodium: 80 },
  { nameAr: "معمول", nameEn: "Maamoul (date cookie)", category: "sweets", servingSize: 30, servingUnit: "g", calories: 130, protein: 2, carbs: 18, fat: 6, fiber: 1, sugar: 10, sodium: 40 },
  { nameAr: "أم علي", nameEn: "Um Ali", category: "sweets", servingSize: 150, servingUnit: "g", calories: 320, protein: 8, carbs: 35, fat: 16, fiber: 1, sugar: 22, sodium: 150 },

  // === CONDIMENTS & SAUCES ===
  { nameAr: "صلصة طماطم", nameEn: "Tomato sauce", category: "condiments", servingSize: 30, servingUnit: "g", calories: 20, protein: 0.5, carbs: 4, fat: 0.2, fiber: 0.5, sugar: 2.5, sodium: 200 },
  { nameAr: "كاتشب", nameEn: "Ketchup", category: "condiments", servingSize: 17, servingUnit: "g", calories: 20, protein: 0.2, carbs: 5, fat: 0, fiber: 0, sugar: 4, sodium: 160 },
  { nameAr: "مستردة", nameEn: "Mustard", category: "condiments", servingSize: 5, servingUnit: "g", calories: 7, protein: 0.4, carbs: 0.5, fat: 0.4, fiber: 0.3, sugar: 0.1, sodium: 55 },
  { nameAr: "خل", nameEn: "Vinegar", category: "condiments", servingSize: 15, servingUnit: "ml", calories: 3, protein: 0, carbs: 0.1, fat: 0, fiber: 0, sugar: 0.1, sodium: 0 },
  { nameAr: "دبس رمان", nameEn: "Pomegranate molasses", category: "condiments", servingSize: 15, servingUnit: "g", calories: 40, protein: 0.2, carbs: 10, fat: 0, fiber: 0, sugar: 8, sodium: 5 },
  { nameAr: "زعتر", nameEn: "Za'atar spice mix", category: "condiments", servingSize: 5, servingUnit: "g", calories: 15, protein: 0.5, carbs: 2, fat: 0.5, fiber: 1, sugar: 0.1, sodium: 5 },
  { nameAr: "بهارات مشكلة", nameEn: "Mixed spices (baharat)", category: "condiments", servingSize: 5, servingUnit: "g", calories: 15, protein: 0.5, carbs: 2, fat: 0.5, fiber: 1, sugar: 0.1, sodium: 5 },

  // === FAST FOOD / STREET FOOD ===
  { nameAr: "شطيرة فلافل", nameEn: "Falafel sandwich", category: "fast_food", servingSize: 200, servingUnit: "g", calories: 350, protein: 12, carbs: 45, fat: 14, fiber: 5, sugar: 4, sodium: 500 },
  { nameAr: "شطيرة شاورما", nameEn: "Shawarma sandwich", category: "fast_food", servingSize: 250, servingUnit: "g", calories: 450, protein: 28, carbs: 35, fat: 20, fiber: 2, sugar: 4, sodium: 600 },
  { nameAr: "بيتزا مارغريتا", nameEn: "Pizza margherita", categorySize: 100, servingUnit: "g", calories: 266, protein: 11, carbs: 33, fat: 10, fiber: 2.3, sugar: 3.6, sodium: 600 },
  { nameAr: "بيتزا خضار", nameEn: "Vegetable pizza", category: "fast_food", servingSize: 100, servingUnit: "g", calories: 230, protein: 10, carbs: 28, fat: 9, fiber: 2, sugar: 4, sodium: 500 },
  { nameAr: "برجر لحم", nameEn: "Beef burger", category: "fast_food", servingSize: 200, servingUnit: "g", calories: 500, protein: 25, carbs: 40, fat: 25, fiber: 2, sugar: 6, sodium: 600 },
  { nameAr: "برجر دجاج", nameEn: "Chicken burger", category: "fast_food", servingSize: 200, servingUnit: "g", calories: 450, protein: 22, carbs: 38, fat: 22, fiber: 2, sugar: 5, sodium: 550 },
  { nameAr: "سمبوسة لحم", nameEn: "Meat samosa", category: "fast_food", servingSize: 50, servingUnit: "g", calories: 150, protein: 5, carbs: 15, fat: 8, fiber: 1, sugar: 1, sodium: 200 },
  { nameAr: "سمبوسة جبن", nameEn: "Cheese samosa", category: "fast_food", servingSize: 50, servingUnit: "g", calories: 140, protein: 4, carbs: 14, fat: 8, fiber: 1, sugar: 1, sodium: 180 },

  // === BREAKFAST ITEMS ===
  { nameAr: "جبنة قريش", nameEn: "Cottage cheese (qareesh)", category: "dairy", servingSize: 100, servingUnit: "g", calories: 98, protein: 11, carbs: 3.4, fat: 4.3, fiber: 0, sugar: 2.7, sodium: 364 },
  { nameAr: "عسل", nameEn: "Honey", category: "condiments", servingSize: 21, servingUnit: "g", calories: 64, protein: 0.1, carbs: 17, fat: 0, fiber: 0, sugar: 17, sodium: 1 },
  { nameAr: "مربى", nameEn: "Jam", category: "condiments", servingSize: 20, servingUnit: "g", calories: 50, protein: 0.1, carbs: 13, fat: 0, fiber: 0.2, sugar: 10, sodium: 5 },
  { nameAr: "طعمية", nameEn: "Ta'ameya (Egyptian falafel)", category: "dishes", servingSize: 50, servingUnit: "g", calories: 130, protein: 4, carbs: 12, fat: 8, fiber: 2, sugar: 1, sodium: 200 },
  { nameAr: "بيض بالبسطرمة", nameEn: "Eggs with pastrami", category: "dishes", servingSize: 150, servingUnit: "g", calories: 250, protein: 18, carbs: 2, fat: 19, fiber: 0, sugar: 1, sodium: 600 },
]

function parseArg(name: string, fallback: string): string {
  const idx = process.argv.indexOf(name)
  return idx !== -1 && process.argv[idx + 1] ? process.argv[idx + 1] : fallback
}

async function importSeedData() {
  console.log(`[SFDA] ========================================`)
  console.log(`[SFDA] Importing ${ARABIC_FOODS_SEED.length} Arabic food seed entries...`)
  console.log(`[SFDA] Categories: ${[...new Set(ARABIC_FOODS_SEED.map(f => f.category))].join(", ")}`)
  console.log(`[SFDA] ========================================`)

  let imported = 0
  let skipped = 0
  const startTime = Date.now()

  for (const food of ARABIC_FOODS_SEED) {
    try {
      const existing = await db.query.foods.findFirst({
        where: and(
          eq(foods.source, "seed"),
          eq(foods.nameEn, food.nameEn)
        ),
      })

      if (existing) {
        skipped++
        continue
      }

      await db.insert(foods).values({
        nameEn: food.nameEn,
        nameAr: food.nameAr,
        brand: null,
        category: food.category,
        servingSize: food.servingSize,
        servingUnit: food.servingUnit,
        calories: food.calories,
        protein: food.protein,
        carbs: food.carbs,
        fat: food.fat,
        fiber: food.fiber ?? null,
        sugar: food.sugar ?? null,
        sodium: food.sodium ?? null,
        saturatedFat: null,
        cholesterol: null,
        potassium: null,
        source: "seed",
        sourceId: null,
        barcode: null,
        imageUrl: null,
      })
      imported++
      console.log(`[SFDA] ✓ Imported: "${food.nameAr}" / "${food.nameEn}" | ${food.calories} kcal/${food.servingSize}${food.servingUnit} | ${food.category}`)
    } catch (err: any) {
      if (err.message?.includes("duplicate")) {
        skipped++
      } else {
        console.error(`[SFDA] ✗ Error importing "${food.nameEn}": ${err.message}`)
      }
    }
  }

  const elapsed = Date.now() - startTime
  console.log(`\n[SFDA] ========================================`)
  console.log(`[SFDA] Seed import complete!`)
  console.log(`[SFDA] Imported: ${imported} | Skipped: ${skipped} | Time: ${elapsed}ms`)
  console.log(`[SFDA] ========================================`)
}

async function importFromCSV(filePath: string) {
  if (!existsSync(filePath)) {
    console.error(`[SFDA] File not found: ${filePath}`)
    return
  }

  console.log(`[SFDA] ========================================`)
  console.log(`[SFDA] Importing from CSV: ${filePath}`)
  console.log(`[SFDA] ========================================`)

  const records: any[] = []
  const parser = parse({
    columns: true,
    skip_empty_lines: true,
  })

  await new Promise<void>((resolve, reject) => {
    parser.on("readable", () => {
      let record
      while ((record = parser.read()) !== null) {
        records.push(record)
      }
    })
    parser.on("error", reject)
    parser.on("end", () => resolve())
    createReadStream(filePath).pipe(parser)
  })

  console.log(`[SFDA] Found ${records.length} records in CSV`)

  let imported = 0
  let errors = 0
  let batch: any[] = []
  const startTime = Date.now()
  let batchNum = 0

  for (const row of records) {
    const nameAr = row.name_ar?.trim() || row["الاسم العربي"]?.trim()
    const nameEn = row.name_en?.trim() || row["الاسم الانجليزي"]?.trim() || nameAr

    if (!nameEn) {
      console.log(`[SFDA] ⚠ Skipping row (no name): ${JSON.stringify(row).slice(0, 100)}`)
      continue
    }

    batch.push({
      nameEn: nameEn.slice(0, 500),
      nameAr: nameAr?.slice(0, 500) || null,
      brand: null,
      category: row.category?.trim() || null,
      servingSize: parseFloat(row.serving_size) || 100,
      servingUnit: row.serving_unit?.trim() || "g",
      calories: parseFloat(row.calories) || 0,
      protein: parseFloat(row.protein) || 0,
      carbs: parseFloat(row.carbs) || 0,
      fat: parseFloat(row.fat) || 0,
      fiber: parseFloat(row.fiber) || null,
      sugar: parseFloat(row.sugar) || null,
      sodium: parseFloat(row.sodium) || null,
      source: "sfda" as const,
      sourceId: null,
      barcode: null,
      imageUrl: null,
    })

    if (batch.length >= BATCH_SIZE) {
      batchNum++
      const count = await importCSVBatch(batch, batchNum)
      imported += count
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(0)
      console.log(`[SFDA] Progress: ${imported} imported | ${elapsed}s elapsed`)
      batch = []
    }
  }

  if (batch.length > 0) {
    batchNum++
    const count = await importCSVBatch(batch, batchNum)
    imported += count
  }

  const elapsed = Date.now() - startTime
  console.log(`\n[SFDA] ========================================`)
  console.log(`[SFDA] CSV import complete!`)
  console.log(`[SFDA] Imported: ${imported} | Errors: ${errors} | Time: ${elapsed}ms`)
  console.log(`[SFDA] ========================================`)
}

async function importCSVBatch(batch: any[], batchNum: number): Promise<number> {
  let inserted = 0
  let errors = 0
  const startTime = Date.now()

  for (const item of batch) {
    try {
      await db.insert(foods).values(item)
      inserted++
    } catch (err: any) {
      errors++
      if (!err.message?.includes("duplicate")) {
        console.error(`[SFDA] Error importing "${item.nameEn}": ${err.message}`)
      }
    }
  }

  const elapsed = Date.now() - startTime
  console.log(`[SFDA] CSV Batch #${batchNum}: +${inserted} inserted, ${errors} errors in ${elapsed}ms`)
  return inserted
}

async function main() {
  const doSeed = process.argv.includes("--seed")
  const csvFile = parseArg("--file", "")

  console.log("========================================")
  console.log("  SFDA Arabic Food Import")
  console.log("========================================")
  console.log(`Mode: ${doSeed && csvFile ? "seed + csv" : doSeed ? "seed only" : csvFile ? "csv only" : "none"}`)
  console.log(`CSV file: ${csvFile || "N/A"}`)
  console.log("========================================")

  if (!doSeed && !csvFile) {
    console.log("Usage:")
    console.log("  --seed          Import built-in Arabic food seed data")
    console.log("  --file <path>   Import from SFDA CSV file")
    console.log("  --seed --file   Import both")
    return
  }

  const startTime = Date.now()

  if (doSeed) {
    await importSeedData()
  }

  if (csvFile) {
    await importFromCSV(csvFile)
  }

  // Final stats
  const stats = await db.select().from(foods).where(eq(foods.source, "seed"))
  const sfdaStats = await db.select().from(foods).where(eq(foods.source, "sfda"))
  const totalElapsed = Date.now() - startTime

  console.log("\n========================================")
  console.log("  Final Database Stats")
  console.log("========================================")
  console.log(`Seed foods: ${stats.length}`)
  console.log(`SFDA foods: ${sfdaStats.length}`)
  console.log(`Total time: ${totalElapsed}ms`)
  console.log("========================================")
}

main().catch(console.error)
