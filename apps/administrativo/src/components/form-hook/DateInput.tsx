import type { InputHTMLAttributes } from 'react'
import { Controller, useFormContext } from 'react-hook-form'

import { clsx } from 'clsx'
import { format as formatDate, parseISO } from 'date-fns'
import { XIcon } from 'lucide-react'

import { Input } from '../input'

interface DateInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  name: string
  minDate?: Date | null
  maxDate?: Date | null
  isClearable?: boolean
}

export function FormDateInput({ name, minDate, maxDate, isClearable, ...props }: DateInputProps) {
  const { control } = useFormContext()
  const min = minDate ? formatDate(minDate, 'yyyy-MM-dd') : undefined
  const max = maxDate ? formatDate(maxDate, 'yyyy-MM-dd') : undefined

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => {
        const value = field.value
          ? typeof field.value === 'string'
            ? formatDate(parseISO(field.value), 'yyyy-MM-dd')
            : formatDate(field.value, 'yyyy-MM-dd')
          : ''

        const canClear = field.value && !props.disabled && isClearable

        return (
          <div className="relative">
            <Input
              id={name}
              {...props}
              {...field}
              min={min}
              max={max}
              value={value}
              type="date"
              disabled={props.disabled}
              className={clsx('appearance-none', props.className, { 'border-danger': error, 'pr-8': canClear })}
            />

            {canClear && (
              <button
                type="button"
                className="-translate-y-1/2 absolute top-1/2 right-3"
                onClick={() => field.onChange(null)}
              >
                <XIcon className="h-5 w-5" />
              </button>
            )}
          </div>
        )
      }}
    />
  )
}
