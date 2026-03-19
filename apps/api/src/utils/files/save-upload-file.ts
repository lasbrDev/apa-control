import { randomUUID } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import { extname, join } from 'node:path'

import type { MultipartFile } from '@fastify/multipart'

export async function saveUploadFile(file: MultipartFile, targetFolder: string): Promise<string> {
  const fileBuffer = await file.toBuffer()
  const extension = extname(file.filename || '').toLowerCase()
  const fileName = `${randomUUID()}${extension}`
  const uploadDirectory = join(process.cwd(), 'uploads', targetFolder)
  const filePath = join(uploadDirectory, fileName)

  await mkdir(uploadDirectory, { recursive: true })
  await writeFile(filePath, fileBuffer)

  return `/uploads/${targetFolder}/${fileName}`
}
