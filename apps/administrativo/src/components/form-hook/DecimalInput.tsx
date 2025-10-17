import { Controller, useFormContext } from 'react-hook-form'
import { NumericFormat, type NumericFormatProps } from 'react-number-format'

import clsx from 'clsx'

import { Input } from '../input'

interface DecimalInputProps extends NumericFormatProps {
  name: string
}

export const FormDecimalInput = (props: DecimalInputProps) => {
  const { control } = useFormContext()

  return (
    <Controller
      name={props.name}
      control={control}
      render={({ field: { onChange, ref, ...field }, fieldState: { error } }) => (
        <NumericFormat
          id={props.name}
          {...field}
          getInputRef={ref}
          onValueChange={({ floatValue }) => onChange(floatValue)}
          className={clsx(props.className, { 'border-danger': error })}
          fixedDecimalScale
          decimalSeparator=","
          thousandSeparator="."
          inputMode="decimal"
          customInput={Input}
          decimalScale={2}
          {...props}
        />
      )}
    />
  )
}
