import { useCallback, useEffect, useState } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import Select, { type StylesConfig } from 'react-select'

import { getSelectClassNames } from '../../helpers/select'

export interface FormOption {
  label: string
  value: number | string | boolean
}

interface FormSelectProps<T extends FormOption> {
  id?: string
  name: string
  disabled?: boolean
  placeholder?: string
  styles?: StylesConfig<T, true>
  options: T[]
}

export function FormMultiSelect<T extends FormOption>({
  id,
  name,
  placeholder,
  disabled,
  styles,
  options,
}: FormSelectProps<T>) {
  const [selected, setSelected] = useState<T[]>([])
  const { control, watch } = useFormContext()

  const noOptionsMessage = useCallback(() => 'Nenhum resultado foi encontrado.', [])
  const value = watch(name)

  useEffect(() => {
    const items = options.filter((option) => value?.includes(option.value))

    setSelected(items)
  }, [value])

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <Select
          unstyled
          isClearable
          id={id}
          classNames={getSelectClassNames<T, true>({ controlClassName: error ? 'border-danger' : undefined })}
          styles={styles}
          isDisabled={disabled}
          isMulti={true}
          placeholder={placeholder ?? 'Selecione...'}
          noOptionsMessage={noOptionsMessage}
          value={selected}
          options={options}
          onChange={(items) => {
            setSelected([...items])
            field.onChange(items.map((item) => item.value))
          }}
        />
      )}
    />
  )
}
