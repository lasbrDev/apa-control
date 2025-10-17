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
        'flex h-11 w-full rounded-md border border-zinc-200 bg-white px-3 py-1 text-sm shadow-xs transition-colors file:border-0 file:bg-transparent file:font-medium file:text-sm placeholder:text-zinc-400 focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-brand disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  )
})

Input.displayName = 'Input'

export { Input }
