import type { ElementType } from 'react'

import clsx from 'clsx'

import { Input } from '../../input'

interface ReadOnlyInputProps {
  id?: string
  icon?: ElementType
  className?: string
  value: string | null | undefined
}

export const ReadOnlyInput = ({ id, className, value, icon: Icon }: ReadOnlyInputProps) => (
  <div className="relative w-full">
    <Input readOnly id={id} className={clsx(className, { 'pl-8': Boolean(Icon) })} value={value ?? ''} />

    {Icon && <Icon className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-zinc-400" />}
  </div>
)
