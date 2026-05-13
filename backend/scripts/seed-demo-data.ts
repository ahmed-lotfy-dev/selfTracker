import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "../src/db/schema/index";
import { eq, sql } from "drizzle-orm";
import { subDays } from "date-fns";
import * as dotenv from "dotenv";

dotenv.config();

// Create a custom pool that allows self-signed certificates
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const db = drizzle(pool, { schema });

const DEMO_EMAIL = "ahmed.lotfy37479@gmail.com";



async function main() {
  console.log(`🚀 Starting seed for demo account: ${DEMO_EMAIL}`);

  // 1. Find User
  const user = await db.query.users.findFirst({
    where: eq(schema.users.email, DEMO_EMAIL)
  });

  if (!user) {
    console.error(`❌ User ${DEMO_EMAIL} not found. Please register this user in the app first!`);
    process.exit(1);
  }

  const userId = user.id;
  console.log(`✅ Found user ID: ${userId}`);

  // 2. Clear existing demo data (To avoid duplicates on multiple runs)
  console.log("🧹 Cleaning old demo data...");
  await db.delete(schema.weightLogs).where(eq(schema.weightLogs.userId, userId));
  await db.delete(schema.foodLogs).where(eq(schema.foodLogs.userId, userId));
  await db.delete(schema.tasks).where(eq(schema.tasks.userId, userId));
  await db.delete(schema.habits).where(eq(schema.habits.userId, userId));
  await db.delete(schema.workoutLogs).where(eq(schema.workoutLogs.userId, userId));
  await db.delete(schema.nutritionGoals).where(eq(schema.nutritionGoals.userId, userId));

  // 3. Seed Nutrition Goals
  console.log("🥗 Seeding Nutrition Goals...");
  await db.insert(schema.nutritionGoals).values({
    id: `goal_${userId}`,
    userId,
    dailyCalories: 2500,
    proteinGrams: 180,
    carbsGrams: 250,
    fatGrams: 80,
  });

  // 4. Seed Food Logs (Past 30 days)
  console.log("🍎 Seeding Food Logs (30 days)...");
  for (let i = 0; i < 30; i++) {
    const date = subDays(new Date(), i);
    const meals = [
      { type: "breakfast", name: "Oatmeal with Protein", cals: 450, p: 30, c: 60, f: 10 },
      { type: "lunch", name: "Chicken & Rice", cals: 700, p: 50, c: 80, f: 15 },
      { type: "dinner", name: "Steak & Potatoes", cals: 850, p: 60, c: 50, f: 35 },
      { type: "snack", name: "Greek Yogurt", cals: 150, p: 20, c: 10, f: 2 }
    ];

    for (const meal of meals) {
      await db.insert(schema.foodLogs).values({
        id: crypto.randomUUID(),
        userId,
        loggedAt: date,
        mealType: meal.type as any,
        totalCalories: meal.cals,
        totalProtein: meal.p,
        totalCarbs: meal.c,
        totalFat: meal.f,
        foodItems: [
          { name: meal.name, quantity: 1, unit: "serving", calories: meal.cals, protein: meal.p, carbs: meal.c, fat: meal.f }
        ]
      });
    }
  }

  // 5. Seed Weight Logs (Past 60 days - 80kg to 85kg range)
  console.log("⚖️ Seeding Weight Logs (60 days)...");
  let currentWeight = 84.5; // Start near 85
  for (let i = 60; i >= 0; i--) {
     if (i % 2 === 0) { // Every 2 days
        // Fluctuate but generally trend down towards 80
        currentWeight -= (Math.random() * 0.15) - 0.05; 
        if (currentWeight < 80.2) currentWeight = 80.2 + (Math.random() * 0.5); // Stay above 80
        
        await db.insert(schema.weightLogs).values({
          id: crypto.randomUUID(),
          userId,
          weight: currentWeight.toFixed(2),
          energy: ["Good", "Great", "Okay"][Math.floor(Math.random() * 3)] as any,
          mood: ["High", "Medium", "High"][Math.floor(Math.random() * 3)] as any,
          notes: i === 0 ? "Target weight achieved! 🎯" : (i % 10 === 0 ? "Progress check" : null),
          createdAt: subDays(new Date(), i)
        });
     }
  }

  // 6. Seed Tasks
  console.log("📝 Seeding Tasks...");
  const taskTemplates = [
    { title: "Morning Stretch", cat: "Health", comp: true },
    { title: "Review Workout Plan", cat: "Gym", comp: true },
    { title: "Buy Whey Protein", cat: "Shopping", comp: false },
    { title: "Meal Prep for Week", cat: "Health", comp: false },
    { title: "Read 10 pages", cat: "Mindset", comp: true },
    { title: "Update Training Split", cat: "Gym", comp: false },
    { title: "Book Physio Session", cat: "Health", comp: false },
    { title: "Daily Walk (10k steps)", cat: "Health", comp: true },
    { title: "Refill Creatine", cat: "Shopping", comp: true },
    { title: "Fix Posture", cat: "Health", comp: false },
  ];

  for (let i = 0; i < 20; i++) {
    const template = taskTemplates[i % taskTemplates.length];
    await db.insert(schema.tasks).values({
      id: crypto.randomUUID(),
      userId,
      title: `${template.title} #${Math.floor(i/10) + 1}`,
      category: template.cat,
      completed: Math.random() > 0.4,
      priority: ["low", "medium", "high"][Math.floor(Math.random() * 3)] as any,
      createdAt: subDays(new Date(), Math.floor(Math.random() * 45))
    });
  }

  // 7. Seed Habits
  console.log("🔥 Seeding Habits...");
  const habits = [
    { name: "Cold Shower", streak: 8, color: "#3B82F6" },
    { name: "3L Water", streak: 21, color: "#60A5FA" },
    { name: "No Sugar", streak: 4, color: "#EF4444" },
    { name: "Journaling", streak: 12, color: "#8B5CF6" },
    { name: "Fasted Walk", streak: 6, color: "#10B981" },
  ];

  for (const habit of habits) {
    await db.insert(schema.habits).values({
      id: crypto.randomUUID(),
      userId,
      name: habit.name,
      streak: habit.streak,
      color: habit.color,
      completedToday: true,
      createdAt: subDays(new Date(), 60)
    });
  }

  // 8. Seed Workout Templates & Logs (Past 60 days)
  console.log("🏋️‍♂️ Seeding Workout Templates & Logs (60 days)...");
  const split = await db.query.trainingSplits.findFirst();
  const splitId = split?.id || crypto.randomUUID();

  const workoutNames = ["Push Day (Chest/Tri)", "Pull Day (Back/Bi)", "Leg Day (Squats/Deads)", "Upper Body Power"];
  for (const name of workoutNames) {
    const workoutId = crypto.randomUUID();
    await db.insert(schema.workouts).values({
      id: workoutId,
      userId,
      name,
      trainingSplitId: splitId,
      isPublic: false
    });

    // Seed ~15 logs for this workout over 60 days
    for (let j = 0; j < 15; j++) {
      await db.insert(schema.workoutLogs).values({
        id: crypto.randomUUID(),
        userId,
        workoutId,
        workoutName: name,
        notes: "Heavy sets, felt strong!",
        createdAt: subDays(new Date(), (j * 4) + Math.floor(Math.random() * 3))
      });
    }
  }


  console.log("✨ Seeding Complete! Enjoy your demo showcase.");
  process.exit(0);
}

main().catch(err => {
  console.error("❌ Seeding Failed:", err);
  process.exit(1);
});
