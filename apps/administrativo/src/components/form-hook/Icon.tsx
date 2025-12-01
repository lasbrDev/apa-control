import { cn } from '../../helpers/classname'

import type { ElementType, HTMLAttributes } from 'react'

interface IconProps extends HTMLAttributes<SVGElement> {
  icon: ElementType
}

export function FormIcon({ icon: Icon, ...props }: IconProps) {
  return (
    <Icon
      {...props}
      className={cn(
        '-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-zinc-400 dark:text-gray-500',
        props.className,
      )}
    />
  )
}
