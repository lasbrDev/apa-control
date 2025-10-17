import { Controller, useFormContext } from 'react-hook-form'
import { type IMaskInputProps, IMaskMixin } from 'react-imask'

import clsx from 'clsx'

import { Input } from '../input'

const MaskedInput = IMaskMixin<HTMLInputElement, IMaskInputProps<HTMLInputElement>>(({ inputRef, ...props }) => (
  <Input ref={inputRef} {...props} />
))

export function FormMaskInput(props: React.ComponentProps<typeof MaskedInput> & { name: string }) {
  const { control } = useFormContext()

  return (
    <Controller
      name={props.name}
      control={control}
      render={({ field: { ref, ...field }, fieldState: { error } }) => (
        <MaskedInput
          id={props.name}
          {...field}
          {...props}
          onAccept={field.onChange}
          inputRef={ref}
          className={clsx(props.className, { 'border-danger': error })}
        />
      )}
    />
  )
}
