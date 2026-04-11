import { S3Client } from '@aws-sdk/client-s3'

import { env } from '@/env'

const hasStaticCredentials = Boolean(env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY)

export const s3Client = new S3Client({
  region: env.AWS_DEFAULT_REGION || 'us-east-1',
  credentials: hasStaticCredentials
    ? {
        accessKeyId: env.AWS_ACCESS_KEY_ID,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
      }
    : undefined,
})
