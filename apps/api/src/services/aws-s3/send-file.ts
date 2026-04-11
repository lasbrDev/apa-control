import { PutObjectCommand } from '@aws-sdk/client-s3'

import { s3Client } from '@/libs/s3'

import { bucket, buildPublicUrl } from './utils'

interface SendFileProps {
  key: string
  data: Buffer
  contentType: string
}

export async function sendFile({ key, data, contentType }: SendFileProps): Promise<string> {
  await s3Client.send(
    new PutObjectCommand({
      StorageClass: 'STANDARD',
      Bucket: bucket,
      Key: key,
      ContentType: contentType,
      CacheControl: 'max-age=2592000',
      Body: data,
    }),
  )

  return buildPublicUrl(key)
}
