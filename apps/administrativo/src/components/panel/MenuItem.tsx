import { useCallback, useState } from 'react'
import { Link, matchRoutes, useLocation, useMatch, useResolvedPath } from 'react-router-dom'

import { clsx } from 'clsx'
import { ChevronRightIcon, DotIcon } from 'lucide-react'

import type { Page } from '.'
import { cn } from '../../helpers/classname'
import { firstOrSelf } from '../../helpers/first-or-self'

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
          className="group relative flex h-11 w-full grow items-center px-5 py-2 outline-hidden"
          href={href}
          target="_blank"
          rel="noreferrer"
        >
          {Icon && <Icon className={cn('mr-2 h-5 w-5 group-hover:text-brand', { 'text-brand': match })} />}
          <span className={cn('font-semibold text-sm group-hover:text-brand', { 'text-brand': match })}>
            {page.title}
          </span>
        </a>
      </li>
    )
  }

  return (
    <li className="flex flex-col">
      <Link className="group relative flex h-11 w-full grow items-center px-5 py-2 outline-hidden" to={to}>
        {Icon && <Icon className={cn('mr-2 h-5 w-5 group-hover:text-brand', { 'text-brand': match })} />}
        <span className={cn('font-semibold text-sm group-hover:text-brand', { 'text-brand': match })}>
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
      <Link className="group relative flex h-11 w-full grow items-center px-5 py-2 outline-hidden" to={to}>
        <DotIcon className={cn('mr-2 h-5 w-5 group-hover:text-brand', { 'text-brand': match })} />
        <span className={cn('font-semibold text-sm group-hover:text-brand', { 'text-brand': match })}>
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
    <li
      className={clsx('flex flex-col', { '[&>button>:last-child]:rotate-90 [&>div]:flex': opened })}
      aria-haspopup="true"
    >
      <button
        className="group relative flex h-11 w-full grow items-center px-5 py-2 outline-hidden"
        type="button"
        onClick={handleButtonClick}
      >
        {Icon && <Icon className="mr-2 h-5 w-5 group-hover:text-brand" />}
        <span className="font-semibold text-sm group-hover:text-brand">{page.title}</span>
        <ChevronRightIcon className="ml-2 h-4 w-4 transition-all duration-300" />
      </button>
      <div className="hidden">
        <ul className="flex grow flex-col">
          {page.pages!.map((page) => (
            <ChildMenuItem key={page.path} page={page} basename={basename} strictActive={strictAtive!} />
          ))}
        </ul>
      </div>
    </li>
  )
}
