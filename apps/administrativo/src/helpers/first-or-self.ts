export function firstOrSelf(path: string | string[]) {
  return Array.isArray(path) ? path[0] : path
}
