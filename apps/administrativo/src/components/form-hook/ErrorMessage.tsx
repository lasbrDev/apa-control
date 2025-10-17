import { useFormContext } from 'react-hook-form'

import { getField } from './utils'

interface ErrorMessageProps {
  field: string
}

export function FormErrorMessage({ field }: ErrorMessageProps) {
  const {
    formState: { errors },
  } = useFormContext()

  const fieldError = getField(errors, field)

  if (!fieldError) {
    return null
  }

  return <span className="mt-1 block text-danger text-sm">{fieldError.message?.toString()}</span>
}
