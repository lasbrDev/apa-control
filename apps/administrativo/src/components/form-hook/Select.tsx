import { Controller, useFormContext } from 'react-hook-form'

import { XCircleIcon } from 'lucide-react'

import type { SelectProps } from '@radix-ui/react-select'

import { cn } from '../../helpers/classname'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../form/select'

export interface FormSelectOption {
  label: string
  value: string | number | boolean
}

interface FormSelectProps extends SelectProps {
  id?: string
  name: string
  type?: 'number'
  isClearable?: boolean
  disabled?: boolean
  placeholder?: string
  className?: string
  options: FormSelectOption[]
}

export const FormSelect = (props: FormSelectProps) => {
  const { control, setValue } = useFormContext()
  const { options, isClearable, type } = props

  return (
    <Controller
      name={props.name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <Select
          value={field.value?.toString() ?? ''}
          disabled={field.disabled}
          onValueChange={(value) => field.onChange(type ? Number(value) : value)}
          {...props}
        >
          <div className="relative">
            <SelectTrigger
              name={field.name}
              disabled={!options.length || props.disabled}
              className={cn(props.className, { 'border-danger': error })}
            >
              <SelectValue placeholder={props.placeholder ?? 'Selecione...'} />
            </SelectTrigger>

            {isClearable && !(field.value === '' || field.value === null || typeof field.value === 'undefined') && (
              <button
                type="button"
                className="-translate-y-1/2 absolute top-1/2 right-8 text-danger"
                aria-label="Limpar"
                onClick={() => setValue(field.name, null)}
              >
                <XCircleIcon className="h-5 w-5" />
              </button>
            )}
          </div>
          <SelectContent>
            {options.map(({ value, label }) => {
              const stringValue = String(value)
              return (
                <SelectItem key={stringValue} value={stringValue}>
                  {label}
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
      )}
    />
  )
}
