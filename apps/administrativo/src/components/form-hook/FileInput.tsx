import type { InputHTMLAttributes } from 'react'
import { useFormContext } from 'react-hook-form'

import clsx from 'clsx'

import { Input } from '../input'
import { getField } from './utils'

interface FileInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'multiple'> {
  name: string
}

export function FormFileInput(props: FileInputProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext()

  const fieldError = getField(errors, props.name)

  return (
    <Input
      id={props.name}
      multiple={false}
      type="file"
      {...register(props.name)}
      {...props}
      className={clsx(props.className, { 'border-danger': fieldError }, 'leading-[2.4]')}
    />
  )
}
