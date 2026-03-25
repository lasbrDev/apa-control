import { config } from 'dotenv'
import { z } from 'zod'

config()

const envSchema = z.object({
  PORT: z.string().transform(Number).optional(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  APP_SECRET: z.string(),
  APP_NAME: z.string(),
  APP_LOG_DIR: z.string().optional(),
  DATABASE_URL: z.string(),
  EMAIL_HOST: z.string().optional().default(''),
  EMAIL_PORT: z.string().transform(Number).optional().default(587),
  EMAIL_USER: z.string().optional().default(''),
  EMAIL_PASSWORD: z.string().optional().default(''),
  OVERRIDE_EMAIL: z.string().optional().default(''),
})

export const env = envSchema.parse(process.env)
