import { z } from "zod"

export const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email("Invalid email"),
  password: z.string().optional(), // Made optional to match backend's userSchema
  isVerified: z.boolean(), // Renamed from emailVerified to match mobile's current usage
  createdAt: z.string(),
  updatedAt: z.string(),
  role: z.enum(["user", "admin"]),
  resetToken: z.string().optional(), // Changed to string to match backend's userSchema
  resetTokenExpiresAt: z.string().optional().nullable(), // Changed to string to match backend's userSchema (date string)
  image: z.string().optional().nullable(),
  gender: z.string().optional().nullable(), // Changed to string to match backend's userSchema
  weight: z.number().int().optional().nullable(),
  height: z.number().int().optional().nullable(),
  unitSystem: z.enum(["metric", "imperial"]).default("metric"),
  income: z.number().optional().nullable(), // Changed to number to match backend's userSchema
  currency: z.string().default("EGP"),
  dateOfBirth: z.string().optional().nullable(), // Added to match backend schema (date string)
})

export type User = z.infer<typeof UserSchema>

export const signInSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

export const signUpSchema = z.object({
  name: z.string().min(3, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
})
