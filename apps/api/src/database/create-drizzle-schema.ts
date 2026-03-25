import { config } from 'dotenv'
import { Pool } from 'pg'
import type { Pool as PoolType } from 'pg'

config()

export async function createDrizzleSchema(pool: PoolType) {
  await pool.query('CREATE SCHEMA IF NOT EXISTS "public"')
  console.log('✅ Schema "public" criado com sucesso!')

  await pool.query('CREATE SCHEMA IF NOT EXISTS "drizzle"')
  console.log('✅ Schema "drizzle" criado com sucesso!')
}

if (process.argv[1]?.endsWith('create-drizzle-schema.ts')) {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL!,
    ssl: process.env.DATABASE_URL?.includes('sslmode=require') || process.env.NODE_ENV === 'production',
  })

  createDrizzleSchema(pool)
    .then(() => {
      pool.end()
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Erro ao criar schema "drizzle":', error)
      pool.end()
      process.exit(1)
    })
}
