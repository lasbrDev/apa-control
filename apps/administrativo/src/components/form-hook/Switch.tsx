import { Controller, useFormContext } from 'react-hook-form'

import { Switch } from '../form/switch'

interface FormSwitchProps extends React.ComponentProps<typeof Switch> {
  name: string
}

export const FormSwitch = (props: FormSwitchProps) => {
  const { control } = useFormContext()

  return (
    <Controller
      name={props.name}
      control={control}
      render={({ field }) => (
        <Switch id={props.name} checked={field.value} onCheckedChange={field.onChange} {...props} />
      )}
    />
  )
}
