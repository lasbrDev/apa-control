import { useCallback, useState } from 'react'
import { Link, matchRoutes, useLocation, useMatch, useResolvedPath } from 'react-router-dom'

import { ChevronRightIcon, DotIcon } from 'lucide-react'

import { cn } from '../../helpers/classname'
import { firstOrSelf } from '../../helpers/first-or-self'

import type { Page } from '.'

interface SingleMenuItemProps {
  page: Page
  basename: string
}

interface DropdownMenuItemProps {
  page: Page
  basename: string
}

export const SingleMenuItem = ({ page, basename }: SingleMenuItemProps) => {
  const href = firstOrSelf(page.path!)
  const isExternal = !!href.match('https?://')
  const to = basename + href
  const resolved = useResolvedPath(to)
  const match = useMatch({ path: resolved.pathname, end: page.strictActive ?? false })
  const { icon: Icon } = page

  if (isExternal) {
    return (
      <li className="flex flex-col">
        <a
          className={cn(
            'group relative flex h-11 w-full grow items-center rounded-lg px-5 py-2 outline-hidden transition-all duration-200 ease-in-out',
            'hover:bg-brand/5 hover:text-brand',
            match && 'bg-brand/10 text-brand',
          )}
          href={href}
          target="_blank"
          rel="noreferrer"
        >
          {match && (
            <span className="-translate-y-1/2 absolute top-1/2 left-0 h-10 w-1 rounded-r-full bg-linear-to-b from-brand to-brand/80 shadow-sm transition-all" />
          )}
          {Icon && (
            <Icon
              className={cn(
                'relative z-10 mr-3 h-5 w-5 transition-all duration-200',
                'group-hover:scale-110 group-hover:drop-shadow-sm',
                match ? 'text-brand drop-shadow-sm' : 'text-gray-600 group-hover:text-brand dark:text-gray-400',
              )}
            />
          )}
          <span className={cn('relative z-10 font-medium text-base transition-colors', match && 'text-brand')}>
            {page.title}
          </span>
        </a>
      </li>
    )
  }

  return (
    <li className="flex flex-col">
      <Link
        className={cn(
          'group relative flex h-11 w-full grow items-center rounded-xl px-4 py-2.5 outline-hidden transition-all duration-200 ease-in-out',
          'hover:bg-linear-to-r hover:from-brand/8 hover:to-brand/5 hover:text-brand hover:shadow-sm',
          match && 'bg-linear-to-r from-brand/12 to-brand/8 text-brand shadow-sm',
        )}
        to={to}
      >
        {match && (
          <span className="-translate-y-1/2 absolute top-1/2 left-0 h-8 w-1 rounded-r-full bg-brand transition-all" />
        )}
        {Icon && (
          <Icon
            className={cn(
              'relative z-10 mr-3 h-5 w-5 transition-all duration-200',
              'group-hover:scale-110',
              match ? 'text-brand' : 'text-gray-600 group-hover:text-brand dark:text-gray-400',
            )}
          />
        )}
        <span className={cn('relative z-10 font-medium text-base transition-colors', match && 'text-brand')}>
          {page.title}
        </span>
      </Link>
    </li>
  )
}

const ChildMenuItem = ({ page, basename, strictActive }: SingleMenuItemProps & { strictActive: boolean }) => {
  const href = firstOrSelf(page.path!)
  const to = basename + href
  const resolved = useResolvedPath(to)
  const match = useMatch({ path: resolved.pathname, end: strictActive ?? false })

  return (
    <li aria-haspopup="true" className="flex flex-col">
      <Link
        className={cn(
          'group relative flex h-10 w-full grow items-center rounded-lg px-4 py-2 pl-9 outline-hidden transition-all duration-200 ease-in-out',
          'hover:bg-linear-to-r hover:from-brand/8 hover:to-brand/5 hover:text-brand',
          match && 'bg-linear-to-r from-brand/12 to-brand/8 text-brand',
        )}
        to={to}
      >
        {match && (
          <span className="-translate-y-1/2 absolute top-1/2 left-0 h-8 w-1 rounded-r-full bg-linear-to-b from-brand to-brand/80 transition-all" />
        )}
        <DotIcon
          className={cn(
            'relative z-10 mr-3 h-4 w-4 transition-all duration-200',
            'group-hover:scale-110',
            match ? 'text-brand' : 'text-gray-500 group-hover:text-brand dark:text-gray-500',
          )}
        />
        <span className={cn('relative z-10 font-medium text-sm transition-colors', match && 'text-brand')}>
          {page.title}
        </span>
      </Link>
    </li>
  )
}

export const DropdownMenuItem = ({ page, basename }: DropdownMenuItemProps) => {
  const location = useLocation()
  const strictAtive = page.strictActive
  const [opened, setOpened] = useState<boolean>(Boolean(matchRoutes(page.pages!, location, basename)))
  const handleButtonClick = useCallback((ev: React.MouseEvent<HTMLButtonElement>) => {
    ev.preventDefault()
    setOpened((prev) => !prev)

    const { target } = ev

    let parent = (target as HTMLButtonElement).parentNode as HTMLDivElement
    if (!parent.classList.contains('item')) parent = parent.parentNode as HTMLDivElement
  }, [])

  const { icon: Icon } = page

  return (
    <li className="flex flex-col" aria-haspopup="true">
      <button
        className={cn(
          'group relative flex h-11 w-full grow items-center rounded-xl px-4 py-2.5 outline-hidden transition-all duration-200 ease-in-out',
          'hover:bg-linear-to-r hover:from-brand/8 hover:to-brand/5 hover:text-brand hover:shadow-sm',
          opened && 'bg-linear-to-r from-brand/12 to-brand/8 text-brand shadow-sm',
        )}
        type="button"
        onClick={handleButtonClick}
      >
        {Icon && (
          <Icon
            className={cn(
              'relative z-10 mr-3 h-5 w-5 transition-all duration-200',
              'group-hover:scale-110',
              opened ? 'text-brand' : 'text-gray-600 group-hover:text-brand',
            )}
          />
        )}
        <span
          className={cn(
            'relative z-10 flex-1 text-left font-medium text-base transition-colors',
            opened && 'text-brand',
          )}
        >
          {page.title}
        </span>
        <ChevronRightIcon
          className={cn('relative z-10 ml-2 h-4 w-4 transition-all duration-300', opened && 'rotate-90 text-brand')}
        />
      </button>
      <div
        className={cn(
          'overflow-hidden transition-all duration-300 ease-in-out',
          opened ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0',
        )}
      >
        <ul className="flex grow flex-col gap-1.5 py-2 pl-2">
          {page.pages!.map((page) => (
            <ChildMenuItem key={page.path} page={page} basename={basename} strictActive={strictAtive!} />
          ))}
        </ul>
      </div>
    </li>
  )
}
