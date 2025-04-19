import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { db } from "../src/db"
import { jwt } from "better-auth/plugins/jwt"
import { expo } from "@better-auth/expo"
import { sendEmail } from "./email"

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  emailAndPassword: {
    enabled: true,
    // sendOnSignUp: true, // with each signinsend email
    autoSignIn: true,
    requireEmailVerification: true, // cannot login without verified
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
  },
  user: {
    modelName: "users",
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "user",
        input: false,
      },
      gender: {
        type: "string",
        required: false,
        input: false,
      },
      weight: {
        type: "number",
        required: false,
        input: false,
      },
      height: {
        type: "number",
        required: false,
        input: false,
      },
      unitSystem: {
        type: "string",
        required: false,
        input: false,
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
  ],
  trustedOrigins: [
    "selftracker://",
    "http://192.168.1.16:8081",
    "exp://192.168.1.16:8081",
    "http://192.168.1.2:8081",
    "exp://192.168.1.2:8081",
  ],
})
