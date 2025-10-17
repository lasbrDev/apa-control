import type React from 'react'
import { forwardRef } from 'react'

import { Input } from '../../input'

type InputProps = React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>

interface TextInputProps extends InputProps {
  mask?: string
  maskPlaceholder?: string
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>((props, ref) => <Input {...props} ref={ref} />)

TextInput.displayName = 'Input'
