import type { HTMLAttributes } from 'react'

import { Spinner } from '../spinner'

interface InputLoadingProps extends HTMLAttributes<SVGElement> {
  loading: boolean
}

export function FormInputLoading({ loading, ...props }: InputLoadingProps) {
  return loading ? (
    <div className="-translate-y-1/2 absolute top-1/2 right-3">
      <Spinner className="fill-success" {...props} />
    </div>
  ) : null
}
