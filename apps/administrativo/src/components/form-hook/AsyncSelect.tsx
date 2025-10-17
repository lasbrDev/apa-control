import { useCallback, useState } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import AsyncSelect from 'react-select/async'

import { getSelectClassNames } from '../../helpers/select'
import type { FormSelectOption } from './Select'

interface FormSelectProps {
  id?: string
  name: string
  isMulti?: boolean
  isClearable?: boolean
  disabled?: boolean
  placeholder?: string
  loadOptions: (inputValue: string) => Promise<FormSelectOption[]>
}

export const FormAsyncSelect = ({ id, name, placeholder, disabled, isClearable, loadOptions }: FormSelectProps) => {
  const [selected, setSelected] = useState<FormSelectOption | null>(null)
  const { control } = useFormContext()
  const noOptionsMessage = useCallback(() => 'Nenhum resultado foi encontrado.', [])

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <AsyncSelect
          unstyled
          cacheOptions
          defaultOptions
          id={id}
          name={name}
          classNames={getSelectClassNames<FormSelectOption, false>({
            controlClassName: error ? 'border-danger' : undefined,
          })}
          isDisabled={disabled}
          isClearable={isClearable}
          placeholder={placeholder ?? 'Selecione...'}
          noOptionsMessage={noOptionsMessage}
          value={selected}
          loadOptions={loadOptions}
          onChange={(item) => {
            setSelected(item)
            field.onChange(item?.value ?? null)
          }}
        />
      )}
    />
  )
}
