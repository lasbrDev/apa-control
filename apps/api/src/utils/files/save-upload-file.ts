import { randomUUID } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import { extname, join } from 'node:path'

import { s3Service } from '@/services/aws-s3'
import { buildS3Key, isS3Configured } from '@/services/aws-s3/utils'
import type { MultipartFile } from '@fastify/multipart'

export async function saveUploadFile(file: MultipartFile, targetFolder: string): Promise<string> {
  const fileBuffer = await file.toBuffer()
  const extension = extname(file.filename || '').toLowerCase() || ''
  const fileName = `${randomUUID()}${extension}`

  if (isS3Configured()) {
    const key = buildS3Key(`${targetFolder}/${fileName}`)

    return s3Service.sendFile({
      key,
      data: fileBuffer,
      contentType: file.mimetype || 'application/octet-stream',
    })
  }

  const uploadDirectory = join(process.cwd(), 'uploads', targetFolder)
  const filePath = join(uploadDirectory, fileName)

  await mkdir(uploadDirectory, { recursive: true })
  await writeFile(filePath, fileBuffer)

  return `/uploads/${targetFolder}/${fileName}`
}
