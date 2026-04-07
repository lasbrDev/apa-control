import { env } from '@/env'
import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'

import { logError } from '@/logger'

import * as schema from './schema'

const useSSL = env.DATABASE_URL.includes('sslmode=') || env.NODE_ENV === 'production'

const connectionString = env.DATABASE_URL.replace('sslmode=require', 'sslmode=verify-full').replace(
  'sslmode=prefer',
  'sslmode=verify-full',
)

const pool = new Pool({
  connectionString,
  min: 2,
  max: 30,
  idleTimeoutMillis: 1000 * 60 * 5,
  connectionTimeoutMillis: 1000 * 10,

  statement_timeout: 1000 * 60,
  query_timeout: 1000 * 60,

  keepAlive: true,
  allowExitOnIdle: true,
  keepAliveInitialDelayMillis: 10000,
  application_name: 'apa-control-api',
  ssl: useSSL,
})

pool.on('error', (err) => {
  logError(err, { context: 'database-pool-error' })
})

const db = drizzle(pool, { schema, casing: 'snake_case' })

export { db, pool }
