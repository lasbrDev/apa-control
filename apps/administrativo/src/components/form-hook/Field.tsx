import type { HTMLAttributes } from 'react'

interface FieldProps extends HTMLAttributes<HTMLDivElement> {}

export function FormField(props: FieldProps) {
  return <div className="mb-6" {...props} />
}
