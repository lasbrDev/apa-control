export function toQueryString(object: Record<string, unknown>): string {
  return Object.entries(object)
    .filter(([, v]) => v !== null && typeof v !== 'undefined')
    .map(([k, v]) => [v === true ? k : `${k}=${v instanceof Date ? v.toISOString() : v}`])
    .join('&')
}
