'use client'
// Listbox/option custom para dropdown searchable; useSemanticElements desativada em overrides no biome.json

import { useCallback, useEffect, useRef, useState } from 'react'
import { Controller, useFormContext } from 'react-hook-form'

import { cn } from '../../helpers/classname'
import { Input } from '../input'
import { getField } from './utils'

export interface FormSearchableSelectOption {
  value: string
  label: string
}

export interface FormSearchableSelectProps {
  name: string
  searchOptions: (query: string) => Promise<FormSearchableSelectOption[]>
  minChars?: number
  debounceMs?: number
  placeholder?: string
  className?: string
  /** Opção exibida primeiro (ex.: "Cadastrar novo animal"); ao selecionar, o valor do campo é emptyOption.value */
  emptyOption?: FormSearchableSelectOption
  /** Rótulo a exibir quando o valor já está definido (ex.: carregado na edição); evita mostrar só o id */
  displayLabel?: string
}

const DEFAULT_MIN_CHARS = 3
const DEFAULT_DEBOUNCE_MS = 300

export function FormSearchableSelect({
  name,
  searchOptions,
  minChars = DEFAULT_MIN_CHARS,
  debounceMs = DEFAULT_DEBOUNCE_MS,
  placeholder,
  className,
  emptyOption,
  displayLabel,
}: FormSearchableSelectProps) {
  const {
    control,
    formState: { errors },
  } = useFormContext()
  const fieldError = getField(errors, name)
  const [options, setOptions] = useState<FormSearchableSelectOption[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [selectedOption, setSelectedOption] = useState<FormSearchableSelectOption | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const fetchQueryRef = useRef<string | null>(null)

  const loadOptions = useCallback(
    async (query: string) => {
      if (query.trim().length < minChars) {
        setOptions([])
        setIsOpen(false)
        return
      }
      fetchQueryRef.current = query
      setIsLoading(true)
      try {
        const items = await searchOptions(query.trim())
        if (fetchQueryRef.current === query) {
          setOptions(items)
          setIsOpen(items.length > 0 || Boolean(emptyOption))
        }
      } catch {
        if (fetchQueryRef.current === query) {
          setOptions([])
          setIsOpen(Boolean(emptyOption))
        }
      } finally {
        if (fetchQueryRef.current === query) {
          setIsLoading(false)
        }
      }
    },
    [searchOptions, minChars, emptyOption],
  )

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => {
        const triggerSearch = (value: string) => {
          if (debounceRef.current) {
            clearTimeout(debounceRef.current)
            debounceRef.current = null
          }
          if (value.trim().length < minChars) {
            setOptions([])
            setIsOpen(Boolean(emptyOption))
            setSelectedOption(null)
            return
          }
          debounceRef.current = setTimeout(() => {
            debounceRef.current = null
            loadOptions(value)
          }, debounceMs)
        }

        const value = field.value ?? ''
        const valueStr = String(value)
        const isEmptyOption = emptyOption && valueStr === emptyOption.value
        const isNumericValue = /^\d+$/.test(valueStr)
        const displayValue =
          isEmptyOption && emptyOption
            ? emptyOption.label
            : selectedOption && String(selectedOption.value) === valueStr
              ? selectedOption.label
              : displayLabel && isNumericValue
                ? displayLabel
                : value

        return (
          <div ref={containerRef} className={cn('relative', className)}>
            <div className="relative">
              <Input
                id={name}
                type="text"
                value={displayValue}
                onChange={(e) => {
                  const next = e.target.value
                  field.onChange(next)
                  setSelectedOption(null)
                  triggerSearch(next)
                }}
                onFocus={() => {
                  if (value && String(value).trim().length >= minChars && !isNumericValue && !isEmptyOption) {
                    loadOptions(String(value))
                  } else if (value && isNumericValue && options.length === 0) {
                    setOptions([])
                    setIsOpen(Boolean(emptyOption))
                  } else if (emptyOption && !value) {
                    setIsOpen(true)
                  }
                }}
                placeholder={placeholder}
                className={cn('pr-9', { 'border-danger': fieldError })}
                autoComplete="off"
              />
              {isLoading && (
                <span className="-translate-y-1/2 absolute top-1/2 right-3">
                  <svg
                    className="h-4 w-4 animate-spin text-gray-500 dark:text-gray-400"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    aria-hidden
                  >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                </span>
              )}
            </div>
            {isOpen && (options.length > 0 || emptyOption) && (
              <div
                className="absolute z-50 mt-1 max-h-48 w-full overflow-auto rounded-md border border-gray-200 bg-white py-1 shadow-md dark:border-gray-700 dark:bg-gray-800"
                role="listbox"
                tabIndex={0}
                aria-label="Opções de busca"
              >
                {emptyOption && (
                  <button
                    key={emptyOption.value}
                    type="button"
                    tabIndex={0}
                    role="option"
                    aria-selected={false}
                    className="w-full cursor-pointer px-3 py-2 text-left text-sm hover:bg-brand hover:text-white dark:hover:bg-brand/90"
                    onMouseDown={(e) => {
                      e.preventDefault()
                      field.onChange(emptyOption.value)
                      setSelectedOption(null)
                      setOptions([])
                      setIsOpen(false)
                    }}
                  >
                    {emptyOption.label}
                  </button>
                )}
                {options.map((item) => (
                  <button
                    key={`${item.value}-${item.label}`}
                    type="button"
                    tabIndex={0}
                    role="option"
                    aria-selected={false}
                    className="w-full cursor-pointer px-3 py-2 text-left text-sm hover:bg-brand hover:text-white dark:hover:bg-brand/90"
                    onMouseDown={(e) => {
                      e.preventDefault()
                      field.onChange(item.value)
                      setSelectedOption(item)
                      setOptions([])
                      setIsOpen(false)
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}
            {fieldError && <span className="mt-1 block text-danger text-sm">{String(fieldError.message)}</span>}
          </div>
        )
      }}
    />
  )
}
