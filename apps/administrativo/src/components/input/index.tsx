import React from 'react'

import { Slot } from '@radix-ui/react-slot'

import { cn } from '../../helpers/classname'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  asChild?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, asChild, ...props }, ref) => {
  const Comp = asChild ? Slot : 'input'
  return (
    <Comp
      ref={ref}
      type={type}
      className={cn(
        'flex h-11 w-full rounded-md border border-gray-200 bg-white px-3 py-1 text-base shadow-xs transition-colors file:border-0 file:bg-transparent file:font-medium file:text-base placeholder:text-gray-400 focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-brand disabled:cursor-not-allowed disabled:opacity-50',
        'dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 dark:file:text-gray-100',
        className,
      )}
      {...props}
    />
  )
})

Input.displayName = 'Input'

export { Input }
