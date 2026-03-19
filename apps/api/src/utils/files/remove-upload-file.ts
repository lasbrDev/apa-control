import { unlink } from 'node:fs/promises'
import { join } from 'node:path'

export async function removeUploadFile(fileUrlOrPath: string | null | undefined): Promise<void> {
  if (!fileUrlOrPath) return
  if (!fileUrlOrPath.startsWith('/uploads/')) return

  const relativePath = fileUrlOrPath.replace('/uploads/', '')
  const absolutePath = join(process.cwd(), 'uploads', relativePath)

  try {
    await unlink(absolutePath)
  } catch (error) {
    const err = error as NodeJS.ErrnoException
    if (err.code !== 'ENOENT') throw error
  }
}
