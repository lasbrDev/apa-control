import { type InputHTMLAttributes, useState } from 'react'
import { Controller, useFormContext } from 'react-hook-form'

import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import clsx from 'clsx'
import { ChevronDownIcon } from 'lucide-react'

import { cn } from '../../helpers/classname'
import { Button } from '../button'
import { Input } from '../input'

interface FormDurationInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  name: string
}

export const FormDurationInput = (props: FormDurationInputProps) => {
  const { control, getValues } = useFormContext()
  const value = getValues(props.name)
  const [focused, setFocused] = useState(false)
  const [selectedType, setSelectedType] = useState(getInitialType(value))

  return (
    <Controller
      name={props.name}
      control={control}
      render={({ field, fieldState: { error } }) => {
        const viewValue = getViewValue(field.value, selectedType)

        return (
          <div className="flex items-stretch">
            <Input
              id={props.name}
              min={0}
              type="number"
              inputMode="numeric"
              {...props}
              className={clsx('rounded-r-none', props.className, { 'border-danger': error })}
              value={focused && viewValue === 0 ? '' : viewValue}
              onBlur={() => setFocused(false)}
              onFocus={() => setFocused(true)}
              onChange={({ target }) => {
                const { value } = target

                field.onChange(value === '' ? null : getMinutes(Number(value), selectedType))
              }}
            />

            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <Button
                  variant="brand"
                  className="h-auto shrink-0 rounded-l-none font-medium data-[state=open]:bg-dark"
                >
                  <span>{selectedType.name}</span>
                  <ChevronDownIcon className="ml-2 h-3 w-3" />
                </Button>
              </DropdownMenu.Trigger>

              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  align="end"
                  className="z-1060 min-w-56 rounded-md rounded-t-none bg-white py-3 shadow-[0_0_50px_0_rgba(0,0,0,.2)] dark:border dark:border-gray-700 dark:bg-gray-800"
                >
                  {types.map((type) => (
                    <DropdownMenu.Item key={type.id} asChild>
                      <button
                        type="button"
                        className={cn(
                          'flex w-full grow items-center whitespace-nowrap px-5 py-2 text-sm outline-hidden hover:bg-stone-100 hover:text-black dark:hover:bg-gray-700 dark:hover:text-gray-100',
                          { 'bg-brand text-white hover:bg-brand/90 hover:text-white': type.id === selectedType.id },
                        )}
                        onClick={() => setSelectedType(type)}
                      >
                        {type.name}
                      </button>
                    </DropdownMenu.Item>
                  ))}
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          </div>
        )
      }}
    />
  )
}

const types = [
  { id: 'min', name: 'minutos' },
  { id: 'hour', name: 'horas' },
  { id: 'day', name: 'dias' },
]

function getInitialType(value: number) {
  if (value === 0 || !value) return types[0]
  if ((value / 60) % 24 === 0) return types[2]
  if (value % 60 === 0) return types[1]
  return types[0]
}

function getViewValue(value: number, type: FormDurationInputProps) {
  if (type.id === 'day') return value / 60 / 24
  if (type.id === 'hour') return value / 60
  return value
}

function getMinutes(value: number, type: FormDurationInputProps) {
  if (type.id === 'day') return value * 60 * 24
  if (type.id === 'hour') return value * 60
  return value
}
