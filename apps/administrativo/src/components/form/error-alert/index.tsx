import { AlertTriangleIcon } from 'lucide-react'

import { cn } from '../../../helpers/classname'

const ErrorAlert = ({ error, className }: { error: string | undefined | null; className?: string }) =>
  error ? (
    <div
      className={cn(
        'flex w-full items-center justify-center gap-4 rounded-lg border border-danger px-4 py-3 text-danger text-sm',
        className,
      )}
      role="alert"
    >
      <AlertTriangleIcon className="h-5 w-5 shrink-0" />
      <div className="text-sm [&_p]:leading-relaxed">{error}</div>
    </div>
  ) : null

export { ErrorAlert }
