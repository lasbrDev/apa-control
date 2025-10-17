export function hideEmail(email: string) {
  const [name, domain] = email.split('@')
  return `******${name.slice(-3)}@${domain}`
}
