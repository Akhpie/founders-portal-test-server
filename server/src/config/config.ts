import { z } from "zod";

const envSchema = z.object({
  JWT_SECRET: z.string().min(32),
  ADMIN_GOOGLE_CLIENT_ID: z.string(),
  NODE_ENV: z.enum(["development", "production", "test"]),
  COOKIE_DOMAIN: z.string(),
  REFRESH_TOKEN_SECRET: z.string().min(32),
});

export const config = {
  ...envSchema.parse(process.env),
  AUTH: {
    ACCESS_TOKEN_EXPIRY: "15m",
    REFRESH_TOKEN_EXPIRY: "7d",
    COOKIE_MAX_AGE: 7 * 24 * 60 * 60 * 1000, // 7 days
  },
  RATE_LIMIT: {
    LOGIN_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_LOGIN_ATTEMPTS: 5,
  },
};
