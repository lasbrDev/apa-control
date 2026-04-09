import { type ElementType, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { MoreHorizontalIcon } from 'lucide-react'

export type ActionListItem<T> = {
  title: string
  icon: ElementType
  action: string | ((values: T) => void)
  hideWhen?: (values: T) => boolean
}

type ActionListProps<T> = {
  values: T
  primaryKey: keyof T
  actions: ActionListItem<T>[]
}

type ActionListButton<T> = {
  id: string
  values: T
  title: string
  icon: ElementType
  action: string | ((values: T) => void)
}

export function ActionsList<T>({ actions, values, primaryKey }: ActionListProps<T>) {
  const visibleActions = actions.filter(({ hideWhen }) => !hideWhen || !hideWhen(values))

  if (visibleActions.length === 0) return null

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger
        className="inline-flex h-8 w-8 items-center justify-center rounded-md p-0 font-medium text-sm transition-colors hover:bg-zinc-200 hover:text-black focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-zinc-300 disabled:pointer-events-none disabled:opacity-50 data-[state=open]:ring-1 data-[state=open]:ring-zinc-300 dark:data-[state=open]:ring-gray-600 dark:focus-visible:ring-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-100"
        title="Ações"
      >
        <span className="sr-only">Abrir menu</span>
        <MoreHorizontalIcon className="h-4 w-4 fill-black dark:fill-gray-300" />
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={4}
          className="data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 min-w-32 overflow-hidden rounded-md border bg-white p-1 shadow-md data-[state=closed]:animate-out data-[state=open]:animate-in dark:border-gray-700 dark:bg-gray-800 dark:shadow-lg"
        >
          {visibleActions.map(({ action, icon, title }) => (
            <ActionButton
              id={`${values[primaryKey]}`}
              key={`${icon}-${title}`}
              icon={icon}
              title={title}
              action={action}
              values={values}
            />
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}

function ActionButton<T>({ id, action, icon: Icon, title, values }: ActionListButton<T>) {
  const navigate = useNavigate()
  const handleClick = useCallback(() => {
    if (typeof action === 'string') {
      navigate(action.replace(':id', id))
      return
    }

    action(values)
  }, [action, id])

  return (
    <DropdownMenu.Item
      className="relative flex cursor-pointer select-none items-center gap-2 rounded-xs px-2 py-1.5 text-base outline-hidden transition-colors focus:bg-zinc-100 focus:text-black data-disabled:pointer-events-none data-disabled:opacity-50 dark:text-gray-200 dark:focus:bg-gray-700 dark:focus:text-gray-100 dark:hover:bg-gray-700"
      onClick={handleClick}
    >
      {Icon && <Icon className="h-4 w-4 shrink-0 text-current" />}
      {title && <span>{title}</span>}
    </DropdownMenu.Item>
  )
}
