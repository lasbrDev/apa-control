import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  out: './src/database/migrations',
  schema: './src/database/schema/**',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
    ssl: true,
  },
  casing: 'snake_case',
})
