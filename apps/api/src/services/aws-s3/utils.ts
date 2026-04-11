import { env } from '@/env'

function normalizePrefix(prefix: string): string {
  const trimmed = prefix.trim().replace(/^\/+|\/+$/g, '')
  return trimmed ? `${trimmed}/` : ''
}

const bucket = env.AWS_S3_BUCKET
const region = env.AWS_DEFAULT_REGION
const prefix = normalizePrefix(env.AWS_S3_PREFIX)
const publicUrlBase = env.AWS_S3_PUBLIC_URL.trim().replace(/\/+$/g, '')

function buildPublicUrl(key: string): string {
  if (publicUrlBase) return `${publicUrlBase}/${key}`
  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`
}

function buildS3Key(path: string): string {
  const normalizedPath = path.replace(/^\/+/, '')
  return `${prefix}${normalizedPath}`
}

function isS3Configured(): boolean {
  return Boolean(bucket && region)
}

export { bucket, buildPublicUrl, buildS3Key, isS3Configured, publicUrlBase, region }
