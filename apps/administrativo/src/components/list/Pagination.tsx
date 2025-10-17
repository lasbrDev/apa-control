import { ChevronLeftIcon, ChevronRightIcon, ChevronsLeftIcon, ChevronsRightIcon } from 'lucide-react'

import { cn } from '../../helpers/classname'

interface PaginationProps {
  current: number
  total: number
  changePage: (page: number) => void
}

export const Pagination = ({ current, total, changePage }: PaginationProps) => {
  const pages = pagesRange(current, total, 3)

  return total < 2 ? null : (
    <nav className="-space-x-px isolate inline-flex rounded-md shadow-xs" aria-label="Paginação">
      <button
        type="button"
        className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-gray-300 ring-inset hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:bg-gray-50 disabled:opacity-60"
        disabled={current === 1}
        onClick={() => changePage(1)}
      >
        <ChevronsLeftIcon className="h-5 w-5" aria-hidden="true" />
      </button>

      <button
        type="button"
        className="relative inline-flex items-center px-2 py-2 text-gray-400 ring-1 ring-gray-300 ring-inset hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:bg-gray-50 disabled:opacity-60"
        disabled={current === 1}
        onClick={() => changePage(current - 1)}
      >
        <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
      </button>

      {pages.map((num) => (
        <button
          key={num}
          type="button"
          className={cn(
            'relative hidden items-center px-4 py-2 font-semibold text-gray-900 text-sm ring-1 ring-gray-300 ring-inset hover:bg-gray-50 focus:z-20 focus:outline-offset-0 md:inline-flex',
            {
              'inline-flex bg-brand text-white hover:bg-brand focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2':
                num === current,
            },
          )}
          aria-label={`Página ${num}`}
          aria-current="page"
          onClick={() => changePage(num)}
          disabled={num === current}
        >
          {num}
        </button>
      ))}

      <button
        type="button"
        className="relative inline-flex items-center px-2 py-2 text-gray-400 ring-1 ring-gray-300 ring-inset hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:bg-gray-50 disabled:opacity-60"
        disabled={current === total}
        onClick={() => changePage(current + 1)}
      >
        <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
      </button>

      <button
        type="button"
        className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-gray-300 ring-inset hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:bg-gray-50 disabled:opacity-60"
        disabled={current === total}
        onClick={() => changePage(total)}
      >
        <ChevronsRightIcon className="h-5 w-5" aria-hidden="true" />
      </button>
    </nav>
  )
}

function pagesRange(currentPage: number, total: number, delta = 2) {
  const middle = Math.min(Math.max(currentPage, delta + 1), total - delta)
  const start = Math.max(middle - delta, 1)
  const end = middle + delta
  return Array(Math.ceil(end - start + 1))
    .fill(start)
    .map((x, y) => x + y)
}
