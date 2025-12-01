import { useState } from 'react'
import { Controller, useFormContext } from 'react-hook-form'

import { XCircleIcon } from 'lucide-react'

import { cn } from '../../helpers/classname'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../form/select'
import { Input } from '../input'

import type { SelectProps } from '@radix-ui/react-select'

export interface FormSelectSearchableOption {
  label: string
  value: string | number | boolean
}

interface FormSelectSearchableProps extends SelectProps {
  id?: string
  name: string
  type?: 'number'
  isClearable?: boolean
  disabled?: boolean
  placeholder?: string
  className?: string
  options: FormSelectSearchableOption[]
}

export const FormSelectSearchable = (props: FormSelectSearchableProps) => {
  const { control, setValue } = useFormContext()
  const { options, isClearable, type } = props
  const [search, setSearch] = useState('')

  const filteredOptions = options.filter((option) => option.label.toLowerCase().includes(search.toLowerCase()))

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

            {isClearable && field.value && (
              <button
                type="button"
                className="-translate-y-1/2 absolute top-1/2 right-8 text-danger dark:text-red-400"
                aria-label="Limpar"
                onClick={() => setValue(field.name, null)}
              >
                <XCircleIcon className="h-5 w-5" />
              </button>
            )}
          </div>
          <SelectContent>
            <div className="p-2">
              <Input
                type="text"
                placeholder="Buscar..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-sm border px-2 py-1"
              />
            </div>
            {filteredOptions.map(({ value, label }) => (
              <SelectItem key={String(value)} value={String(value)}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    />
  )
}
