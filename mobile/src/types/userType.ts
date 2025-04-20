import { z } from "zod"

const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email("Invalid email"),
  password: z.string(),
  emailVerified: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
  isVerified: z.boolean(),
  role: z.enum(["user", "admin"]),
  resetToken: z.number().int(),
  resetTokenExpiresAt: z.number().int(),
  image: z.string(),
  gender: z.enum(["male", "female"]),
  weight: z.number().int(),
  height: z.number().int(),
  unitSystem: z.enum(["metric", "imperial"]),
  income: z.number().int(),
  currency: z.string(),
})

type User = z.infer<typeof UserSchema>

export const signInSchema = z.object({
  name: z.string().min(3, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

export const signUpSchema = z.object({
  name: z.string().min(3, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
})
