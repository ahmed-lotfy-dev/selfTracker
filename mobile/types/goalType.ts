export interface GoalType {
  id: string
  userId: string
  goalType: "loseWeight" | "gainWeight" | "bodyFat" | "muscleMass"
  targetValue: number
  deadline?: Date
  achieved: boolean
  createdAt: Date
}
