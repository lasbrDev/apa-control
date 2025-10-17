import path from 'node:path'
import winston from 'winston'

import { env } from './env'
import { ApiError } from './utils/ApiError'

const logger = winston.createLogger({
  format: winston.format.json(),
  transports: [new winston.transports.File({ filename: path.resolve(env.APP_LOG_DIR || '.', 'api.log') })],
})

export function logError<T extends object>(error: unknown, args?: T) {
  if (!['test', 'production'].includes(process.env.NODE_ENV!)) {
    console.error(error, args)
  }

  if (process.env.NODE_ENV !== 'test') {
    if (error instanceof ApiError) {
      logger.log({
        level: 'error',
        createdAt: new Date(),
        statusCode: error.statusCode,
        message: error.message,
        stack: error.stack,
        ...args,
      })
    } else if (error instanceof Error) {
      logger.log({ level: 'error', createdAt: new Date(), message: error.message, stack: error.stack, ...args })
    } else {
      logger.log({ level: 'error', createdAt: new Date(), message: 'Erro desconhecido.', error, ...args })
    }
  }
}
