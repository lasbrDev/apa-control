export function resolveFileUrl(pathOrUrl: string, apiUrl: string): string {
  if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')) {
    return pathOrUrl
  }

  const normalizedApiUrl = apiUrl.replace(/\/+$/g, '')
  const normalizedPath = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`

  return `${normalizedApiUrl}${normalizedPath}`
}
