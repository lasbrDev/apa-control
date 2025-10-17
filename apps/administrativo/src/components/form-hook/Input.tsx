import type { InputHTMLAttributes } from 'react'
import { useFormContext } from 'react-hook-form'

import clsx from 'clsx'

import { Input } from '../input'
import { getField } from './utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  name: string
}

export function FormInput(props: InputProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext()

  const fieldError = getField(errors, props.name)
  const isNumber = props.type === 'number'

  return (
    <Input
      id={props.name}
      {...register(props.name, { setValueAs: (value) => (isNumber ? (value === '' ? undefined : +value) : value) })}
      {...props}
      className={clsx(props.className, { 'border-danger': fieldError })}
    />
  )
}
