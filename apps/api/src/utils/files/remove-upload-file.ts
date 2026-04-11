import { unlink } from 'node:fs/promises'
import { join } from 'node:path'
import { s3Service } from '@/services/aws-s3'
import { bucket, isS3Configured, publicUrlBase } from '@/services/aws-s3/utils'

function getLegacyUploadPath(fileUrlOrPath: string): string | null {
  if (!fileUrlOrPath.startsWith('/uploads/')) return null
  return fileUrlOrPath.replace('/uploads/', '')
}

function getS3Key(fileUrlOrPath: string): string | null {
  if (!isS3Configured()) return null
  if (!fileUrlOrPath.startsWith('http://') && !fileUrlOrPath.startsWith('https://')) return null
  if (!URL.canParse(fileUrlOrPath)) return null

  const parsed = new URL(fileUrlOrPath)
  const configuredHost = publicUrlBase && URL.canParse(publicUrlBase) ? new URL(publicUrlBase).host : null
  const bucketHost = `${bucket}.s3.`

  if ((configuredHost && parsed.host !== configuredHost) || (!configuredHost && !parsed.host.startsWith(bucketHost))) {
    return null
  }

  const key = parsed.pathname.replace(/^\/+/, '')
  return key || null
}

export async function removeUploadFile(fileUrlOrPath: string | null | undefined): Promise<void> {
  if (!fileUrlOrPath) return
  const legacyPath = getLegacyUploadPath(fileUrlOrPath)
  const s3Key = getS3Key(fileUrlOrPath)

  if (s3Key) {
    await s3Service.removeFile(s3Key)
    return
  }

  if (!legacyPath) return

  const absolutePath = join(process.cwd(), 'uploads', legacyPath)

  try {
    await unlink(absolutePath)
  } catch (error) {
    const err = error as NodeJS.ErrnoException
    if (err.code !== 'ENOENT') throw error
  }
}
