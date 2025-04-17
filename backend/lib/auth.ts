import { betterAuth } from "better-auth"
import { expo } from "@better-auth/expo"
import { jwt } from "better-auth/plugins"
import { Pool } from "pg"
import { sendEmail } from "./email"

export const auth = betterAuth({
  database: new Pool({
    connectionString: process.env.DATABASE_URL,
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url, token }, request) => {
      await sendEmail({
        to: user.email,
        subject: "Reset your password",
        text: `Click the link to reset your password: ${url}`,
      })
    },
  },
  user: {
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
  databaseHooks: {
    user: {
      create: {
        before: async (user, ctx) => {
          // Modify the user object before it is created
          return {
            data: {
              ...user,
            },
          }
        },
        after: async (user) => {
          //perform additional actions, like creating a stripe customer
        },
      },
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url, token }, request) => {
      await sendEmail({
        to: user.email,
        subject: "Verify your email address",
        text: `Click the link to verify your email: ${url}`,
      })
    },
  },
  plugins: [expo(), jwt()],
  trustedOrigins: ["selftracker://", "http://localhost:8081"],
  advanced: {
    crossSubDomainCookies: {
      enabled: true,
    },
  },
})
