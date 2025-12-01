import { env } from '@/env'
import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'

import { logError } from '@/logger'

import * as schema from './schema'

const useSSL = env.DATABASE_URL.includes('sslmode=require') || env.NODE_ENV === 'production'

const pool = new Pool({
  connectionString: env.DATABASE_URL,
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

pool.on('connect', () => {
  if (env.NODE_ENV !== 'production') {
    console.log('Nova conexão estabelecida com o banco de dados')
  }
})

pool.on('acquire', () => {
  if (env.NODE_ENV !== 'production') {
    console.log('Conexão adquirida do pool')
  }
})

pool.on('remove', () => {
  if (env.NODE_ENV !== 'production') {
    console.log('Conexão removida do pool')
  }
})

const db = drizzle(pool, { schema, casing: 'snake_case' })

export { db, pool }
