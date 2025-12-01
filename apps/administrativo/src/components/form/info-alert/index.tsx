import { InfoIcon } from 'lucide-react'

import { cn } from '../../../helpers/classname'

const InfoAlert = ({ message, className }: { message: string; className?: string }) => (
  <div
    className={cn(
      'flex w-full items-center justify-center gap-4 rounded-lg border border-dark px-4 py-3 text-dark dark:border-gray-600 dark:text-gray-300',
      className,
    )}
    role="alert"
  >
    <InfoIcon className="h-5 w-5 shrink-0" />
    <div className="text-sm [&_p]:leading-relaxed">{message}</div>
  </div>
)

export { InfoAlert }
