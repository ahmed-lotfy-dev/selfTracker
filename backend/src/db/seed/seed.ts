import { db } from "../index"
import { users,  weightLogs, workoutLogs } from "../schema"
import { workoutLogs as workoutLogsData } from "./workoutLogs"
import { weightLogs as weightLogsData } from "./weightLogs"
import { hash } from "argon2"

// async function seed() {
//   console.log("seeding data ...")
//   // const hashedPassword = await hash("00000000")
//   // const user = await db
//   //   .insert(users)
//   //   .values({
//   //     email: "elshenawy19@gmail.com",
//   //     name: "Ahmed Lotfy",
//   //     password: hashedPassword,
//   //     role: "admin",
//   //     isVerified: true,
//   //   })
//   //   .returning({ id: users.id })
//   const [user] = await db.select().from(users).limit(1)
//   await db.insert(weightLogs).values(
//     weightLogsData.map((log) => ({
//       userId: user.id,
//       date: new Date(log.date),
//       weight: log.weight ? log.weight.toFixed(2) : "0.00",
//       energy: log.energy as "Low" | "Okay" | "Good" | "Great",
//       mood: log.mood as "Low" | "Medium" | "High",
//       notes: log.notes ?? null,
//     }))
//   )

//   // await db.insert(userWorkouts).values(
//   //   workoutLogsData.map((log) => ({
//   //     userId: user[0].id,
//   //     name: log.Name,
//   //     date: new Date(log.Date),
//   //   }))
//   // )

// }

// seed()

// Fetch the user
const [user] = await db.select().from(users).limit(1)
if (!user) throw new Error("User not found")

// Map names to session IDs dynamically
const workoutSessionMap: Record<string, string> = {
  Push: "54baa9ed-9f46-49a6-80dc-25f94d86d76c",
  Pull: "fe43fd9b-7b7c-4ce5-bf79-210c3be61d2f",
  Legs: "24180194-f61b-4935-9c70-3981b25d5c6d",
}

// Format workout logs correctly
const formattedWorkoutLogs = workoutLogsData
  .filter((log) => log.name && log.name in workoutSessionMap) // Ensure valid names
  .map((log) => ({
    userId: user.id,
    workoutId: workoutSessionMap[log.name!], // Dynamically map session ID
    exerciseId: "3df0f82d-69ca-477f-ad21-f979f6bacfd8", // Add a valid exerciseId
    date: new Date(log.date),
    performedSets: Math.floor(Math.random() * 5) + 3, // Mock sets (3-7)
    performedReps: Math.floor(Math.random() * 10) + 6, // Mock reps (6-15)
  }))

// Seed into the database
await db.insert(workoutLogs).values(formattedWorkoutLogs)

console.log("Workout logs seeded successfully!")
