export interface ExpenseType {
  id: string
  userId: string
  category: string
  amount: number
  description: string | null
  date: Date
}

