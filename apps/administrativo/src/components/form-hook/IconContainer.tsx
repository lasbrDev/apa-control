import type { HTMLAttributes } from 'react'

interface IconContainerProps extends HTMLAttributes<HTMLDivElement> {}

export function FormIconContainer(props: IconContainerProps) {
  return <div className="relative w-full" {...props} />
}
