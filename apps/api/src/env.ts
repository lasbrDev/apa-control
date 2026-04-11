import { config } from 'dotenv'
import { z } from 'zod'

config()

const envSchema = z.object({
  PORT: z.string().transform(Number).optional(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  APP_SECRET: z.string(),
  APP_NAME: z.string(),
  APP_LOG_DIR: z.string().optional(),
  AWS_DEFAULT_REGION: z.string().optional().default(''),
  AWS_ACCESS_KEY_ID: z.string().optional().default(''),
  AWS_SECRET_ACCESS_KEY: z.string().optional().default(''),
  AWS_S3_BUCKET: z.string().optional().default(''),
  AWS_S3_PREFIX: z.string().optional().default(''),
  AWS_S3_PUBLIC_URL: z.string().optional().default(''),
  DATABASE_URL: z.string(),
})

export const env = envSchema.parse(process.env)
