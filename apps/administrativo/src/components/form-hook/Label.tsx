import * as React from 'react'

import * as Label from '@radix-ui/react-label'

import { cn } from '../../helpers/classname'

const FormLabel = React.forwardRef<
  React.ElementRef<typeof Label.Root>,
  React.ComponentPropsWithoutRef<typeof Label.Root>
>(({ className, ...props }, ref) => (
  <Label.Root
    ref={ref}
    className={cn(
      'mb-2 inline-block font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
      className,
    )}
    {...props}
  />
))

FormLabel.displayName = Label.Root.displayName

export { FormLabel }
