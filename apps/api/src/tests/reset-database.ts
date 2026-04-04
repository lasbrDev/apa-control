import { exec } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import util from 'node:util'
import { Client } from 'pg'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const execSync = util.promisify(exec)
const drizzleKitBinary = path.resolve(dirname, '../../node_modules/.bin/drizzle-kit')

export async function resetDatabase() {
  const databaseUrl = process.env.DATABASE_URL

  if (!databaseUrl) {
    throw new Error('DATABASE_URL não está configurado no .env.test')
  }

  const url = new URL(databaseUrl)
  const dbName = url.pathname.slice(1)
  const dbUser = url.username
  const dbPass = url.password
  const dbHost = url.hostname
  const dbPort = url.port || '5432'

  const adminClient = new Client({
    host: dbHost,
    port: Number(dbPort),
    user: dbUser,
    password: dbPass,
    database: 'postgres',
  })

  try {
    await adminClient.connect()
    await adminClient.query(
      `SELECT pg_terminate_backend(pg_stat_activity.pid)
      FROM pg_stat_activity
      WHERE pg_stat_activity.datname = $1
        AND pid <> pg_backend_pid()`,
      [dbName],
    )
    await adminClient.query(`DROP DATABASE IF EXISTS "${dbName}" WITH (FORCE)`)
    await adminClient.query(`CREATE DATABASE "${dbName}"`)
  } finally {
    await adminClient.end()
  }

  await execSync(`${drizzleKitBinary} migrate`, {
    cwd: path.resolve(dirname, '../../'),
    env: { ...process.env, DATABASE_URL: databaseUrl },
  })
}

resetDatabase()
  .then(() => {
    console.log('✅ Banco de dados resetado com sucesso!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Erro ao resetar banco de dados:', error)
    process.exit(1)
  })
