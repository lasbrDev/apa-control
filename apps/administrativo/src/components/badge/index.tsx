import type * as React from 'react'

import { type VariantProps, cva } from 'class-variance-authority'

import { cn } from '../../helpers/classname'

const badgeVariants = cva(
  'inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        danger: 'border-transparent bg-danger text-white shadow',
        warning: 'border-transparent bg-warning text-white shadow',
        success: 'border-transparent bg-success text-white shadow',
        brand: 'border-transparent bg-brand text-white shadow',
        outline: 'border-stone-200 bg-transparent text-stone-600',
        default: 'text-stone-600',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
