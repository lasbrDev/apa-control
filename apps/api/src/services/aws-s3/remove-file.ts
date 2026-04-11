import { DeleteObjectCommand } from '@aws-sdk/client-s3'

import { s3Client } from '@/libs/s3'

import { bucket } from './utils'

export async function removeFile(key: string): Promise<void> {
  await s3Client.send(
    new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    }),
  )
}
