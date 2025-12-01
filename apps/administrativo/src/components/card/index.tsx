import * as React from 'react'

import { cn } from '../../helpers/classname'

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('glass-card rounded-xl', className)} {...props} />
))

Card.displayName = 'Card'

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex flex-col p-6 sm:flex-row sm:items-start sm:justify-between', className)}
      {...props}
    />
  ),
)

CardHeader.displayName = 'CardHeader'

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn(
        'flex items-center gap-2 font-semibold text-lg leading-none tracking-tight dark:text-gray-100',
        className,
      )}
      {...props}
    />
  ),
)

CardTitle.displayName = 'CardTitle'

const CardToolbar = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('mt-6 flex flex-col gap-3 sm:mt-0 sm:flex-row sm:gap-2', className)} {...props} />
  ),
)

CardToolbar.displayName = 'CardToolbar'

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />,
)

CardContent.displayName = 'CardContent'

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex flex-col gap-4 p-6 pt-0 sm:flex-row sm:justify-end sm:gap-2', className)}
      {...props}
    />
  ),
)

CardFooter.displayName = 'CardFooter'

export { Card, CardHeader, CardFooter, CardTitle, CardToolbar, CardContent }
