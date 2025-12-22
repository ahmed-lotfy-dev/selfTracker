import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { db } from "../src/db"
import { jwt } from "better-auth/plugins/jwt"
import { expo } from "@better-auth/expo"
import { sendEmail } from "./email"
import { bearer } from "better-auth/plugins/bearer"
import { emailOTP } from "better-auth/plugins"



export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  emailAndPassword: {
    enabled: true,
    // sendOnSignUp: true, // with each signinsend email
    autoSignIn: true,
    // requireEmailVerification: true, // cannot login without verified
    sendResetPassword: async ({ user, url, token }, request) => {
      await sendEmail({
        email: user.email,
        subject: "Reset your password",
        text: `Click the link to reset your password: ${url}`,
      })
    },
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url, token }, request) => {
      await sendEmail({
        email: user.email,
        subject: "Verify your email address",
        text: `Click the link to verify your email: ${url}`,
      })
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    },
  },
  user: {
    modelName: "users",
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "user",
      },
      gender: {
        type: "string",
        required: false,
      },
      weight: {
        type: "number",
        required: false,
      },
      height: {
        type: "number",
        required: false,
      },
      unitSystem: {
        type: "string",
        required: false,
      },
    },
  },
  account: {
    modelName: "accounts",
  },
  session: {
    modelName: "sessions",
  },
  verification: {
    modelName: "verifications",
  },
  plugins: [
    expo(),
    jwt(),
    bearer(),
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        if (type === "email-verification") {
          await sendEmail({
            email,
            subject: "Verify your email address",
            text: `Your verification code is: ${otp}`,
          })
        }
      },
    }),
  ],
  trustedOrigins: [
    "selftracker://",
    "exp+selftracker://",
    "exp://192.168.1.5:8081",
    "exp://192.168.1.5:8081/--/auth",
    "exp://192.168.1.5:8081/--/auth?token=", // Just in case query params matter for origin matching (unlikely but safe)
    process.env.EXPO_PUBLIC_API_URL || "http://192.168.1.5:8000",
    // Development mode - Expo's exp:// scheme with local IP ranges
    ...(process.env.NODE_ENV === "development" ? [
      "exp://*/*",                 // Trust all Expo development URLs
      "exp://10.0.0.*:*/*",        // Trust 10.0.0.x IP range
      "exp://192.168.*.*:*/*",     // Trust 192.168.x.x IP range
      "exp://172.*.*.*:*/*",       // Trust 172.x.x.x IP range
      "exp://localhost:*/*"        // Trust localhost
    ] : [])
  ],
})
