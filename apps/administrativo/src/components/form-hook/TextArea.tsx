import type { TextareaHTMLAttributes } from 'react'
import { useFormContext } from 'react-hook-form'

import clsx from 'clsx'

import { TextArea } from '../textarea'
import { getField } from './utils'

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  name: string
}

export function FormTextArea(props: TextAreaProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext()

  const fieldError = getField(errors, props.name)

  return (
    <TextArea
      id={props.name}
      {...register(props.name)}
      {...props}
      className={clsx(props.className, { 'border-danger': fieldError })}
    />
  )
}
