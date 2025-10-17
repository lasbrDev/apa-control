import { dirname as getDirname, resolve } from 'node:path'
import url from 'node:url'

export function getRootFolder(path: string) {
  const filename = url.fileURLToPath(import.meta.url)
  const dirname = getDirname(filename)
  const isDev = dirname.includes('src')
  const [initialPath] = dirname.split(/src|dist/gi)
  return resolve(initialPath, isDev ? 'src' : 'dist', path)
}
