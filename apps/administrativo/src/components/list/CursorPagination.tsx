import { PlusIcon } from 'lucide-react'

import { Button } from '../button'
import { Spinner } from '../spinner'

type CursorPaginationProps = {
  nextCursor: number
  isLoading: boolean
  changeCursor: (cursor: number) => void
}

export const CursorPagination = ({ nextCursor, isLoading, changeCursor }: CursorPaginationProps) => {
  return (
    <nav aria-label="pagination" className="mx-auto flex w-full justify-center">
      <ul className="flex flex-row items-center gap-1">
        <li>
          <Button
            size="sm"
            variant="brand"
            className="gap-1 pl-2.5"
            aria-label="Carregar mais itens"
            onClick={() => changeCursor(nextCursor)}
          >
            {isLoading ? (
              <Spinner />
            ) : (
              <>
                <PlusIcon className="h-4 w-4" />
                <span>Carregar mais itens</span>
              </>
            )}
          </Button>
        </li>
      </ul>
    </nav>
  )
}
