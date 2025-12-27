import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { db } from "../src/db"
import { jwt } from "better-auth/plugins/jwt"
import { expo } from "@better-auth/expo"
import { sendEmail } from "./email"
import { bearer } from "better-auth/plugins/bearer"
import { emailOTP } from "better-auth/plugins"

const baseURL = process.env.BETTER_AUTH_URL;

if (!baseURL) {
  throw new Error("BETTER_AUTH_URL environment variable is required");
}

if (process.env.NODE_ENV === "production" && baseURL.includes("localhost")) {
  console.error("💥 CRITICAL ERROR: BETTER_AUTH_URL is set to localhost in production!");
  console.error(`   Current value: ${baseURL}`);
  console.error("   Better-auth requires the actual deployed domain for session validation.");
  console.error("   Sessions will FAIL until this is fixed.");
  throw new Error("Invalid BETTER_AUTH_URL for production environment");
}

if (baseURL.includes("localhost")) {
  console.warn("⚠️  WARNING: BETTER_AUTH_URL is set to localhost");
  console.warn(`   Current value: ${baseURL}`);
  console.warn("   This is only acceptable in local development");
}

console.log(`✓ Better-auth configured with baseURL: ${baseURL}`);

export const auth = betterAuth({
  baseURL,
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
    "selftracker://callback",
    "exp+selftracker://callback/",
    "https://selftracker.ahmedlotfy.site",
    "http://localhost:8000",
    "http://localhost:8081",
    "http://localhost:1420",
    "exp://",
  ],
})
