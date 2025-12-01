import { Controller, useFormContext } from 'react-hook-form'

import { clsx } from 'clsx'
import { format as formatDate, parseISO } from 'date-fns'
import { XIcon } from 'lucide-react'

import { Input } from '../input'

import type { InputHTMLAttributes } from 'react'

interface DateTimeInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  name: string
  isClearable?: boolean
}

export function FormDateTimeInput({ name, isClearable, ...props }: DateTimeInputProps) {
  const { control } = useFormContext()

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => {
        const value = field.value
          ? typeof field.value === 'string'
            ? formatDate(parseISO(field.value), `yyyy-MM-dd'T'HH:mm`)
            : formatDate(field.value, `yyyy-MM-dd'T'HH:mm`)
          : ''

        const canClear = field.value !== null && !props.disabled && isClearable

        return (
          <div className="relative">
            <Input
              id={name}
              {...props}
              {...field}
              value={value}
              type="datetime-local"
              className={clsx('appearance-none', props.className, { 'border-danger': error, 'pr-8': canClear })}
            />

            {canClear && (
              <button
                type="button"
                className="-translate-y-1/2 absolute top-1/2 right-3"
                onClick={() => field.onChange(null)}
              >
                <XIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </button>
            )}
          </div>
        )
      }}
    />
  )
}
