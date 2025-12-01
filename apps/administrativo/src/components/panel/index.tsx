import { type ElementType, useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'

import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import * as ScrollArea from '@radix-ui/react-scroll-area'
import { ChevronDownIcon, HomeIcon, LogOutIcon, MenuIcon, UserIcon } from 'lucide-react'

import { useApp } from '../../App'
import { cn } from '../../helpers/classname'
import { useEffectExceptOnMount } from '../../hooks/effect-except-on-mount'
import { Logo } from '../logo'
import { DropdownMenuItem, SingleMenuItem } from './MenuItem'

export interface Page {
  title: string
  path?: string
  icon?: ElementType
  strictActive?: boolean
  pages?: Page[]
}

interface PanelProps {
  pages: Page[]
  version?: string
  signOut: VoidFunction
  basename?: string
}

export const Panel = ({ pages, version, signOut, basename = '' }: PanelProps) => {
  const { pathname: actualPath } = useLocation()
  const [sidebarOpened, setSidebarOpened] = useState(false)
  const isHome = actualPath === basename
  const { operator } = useApp()

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const formatRole = (role: string) => {
    return role
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (l) => l.toUpperCase())
      .replace('Employee', '')
      .trim()
  }

  const displayRoles =
    operator.roles
      ?.filter((role) => role !== 'Employee')
      .map(formatRole)
      .filter(Boolean) || []

  useEffectExceptOnMount(() => {
    setSidebarOpened(false)
  }, [actualPath])

  return (
    <div id="panel" className="flex w-full flex-col overflow-x-hidden">
      <header className="glass-card relative top-[30px] right-4 left-4 z-97 flex min-h-[calc(128px+env(safe-area-inset-top))] w-[calc(100%-2rem)] items-center justify-between overflow-visible rounded-t-xl rounded-b-xl border-gray-200/60 border-b bg-white/90 pt-[env(safe-area-inset-top)] pr-[env(safe-area-inset-right)] pl-[env(safe-area-inset-left)] shadow-md backdrop-blur-xl transition-all duration-300 lg:fixed lg:top-[30px] lg:right-20 lg:left-20 lg:w-[calc(100%-10rem)]">
        <div className="mx-auto flex w-full max-w-full items-center justify-between gap-4 px-4 lg:px-20">
          <div className="flex items-center gap-3 lg:flex-1">
            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 font-medium text-base text-gray-700 outline-hidden transition-all duration-200 hover:bg-gray-100 hover:text-gray-900 active:scale-95 lg:hidden"
              onClick={() => setSidebarOpened(true)}
              aria-label="Abrir menu lateral"
            >
              <MenuIcon className="h-5 w-5" />
              <span>Menu</span>
            </button>
            <span className="hidden font-semibold text-gray-800 text-lg lg:inline-block">Painel Administrativo</span>
          </div>

          <Link
            className="group -translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 flex items-center justify-center transition-all duration-200 hover:opacity-90"
            to={basename}
            aria-label="Ir para página inicial"
          >
            <Logo className="h-20 max-w-full transition-transform duration-200 group-hover:scale-105 lg:h-24" />
          </Link>

          <div className="flex items-center justify-end gap-3 lg:flex-1 lg:justify-end">
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button
                  type="button"
                  className="group inline-flex items-center gap-2 rounded-lg px-2 py-1.5 outline-hidden transition-all duration-200 hover:bg-gray-100 active:scale-95"
                  aria-label="Menu do usuário"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-linear-to-br from-brand to-pink-500 font-semibold text-base text-white shadow-sm">
                    {operator.name ? getInitials(operator.name) : <UserIcon className="h-6 w-6" />}
                  </div>
                  <ChevronDownIcon className="h-4 w-4 text-gray-500 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                </button>
              </DropdownMenu.Trigger>

              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  align="end"
                  sideOffset={8}
                  className="glass-card data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 z-100 min-w-[200px] overflow-hidden rounded-xl border border-gray-200/50 p-1 shadow-lg"
                >
                  <div className="px-3 py-2.5">
                    <p className="font-semibold text-gray-900 text-sm">{operator.name || 'Usuário'}</p>
                    {displayRoles.length > 0 && (
                      <p className="mt-0.5 text-gray-500 text-xs">{displayRoles.join(', ')}</p>
                    )}
                  </div>

                  <DropdownMenu.Separator className="my-1 h-px bg-gray-200" />

                  <DropdownMenu.Item
                    className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2.5 text-sm outline-hidden transition-colors hover:bg-red-50 hover:text-red-600 focus:bg-red-50 focus:text-red-600"
                    onClick={signOut}
                  >
                    <LogOutIcon className="h-4 w-4" />
                    <span>Sair</span>
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-full flex-auto items-stretch pr-[calc(1rem+env(safe-area-inset-right))] pl-[calc(1rem+env(safe-area-inset-left))] lg:px-20">
        <ScrollArea.Root>
          <div
            style={{ backfaceVisibility: 'hidden' }}
            className={cn(
              'glass-card fixed top-0 bottom-0 left-[calc(-295px-env(safe-area-inset-left))] z-1001 flex w-[calc(275px+env(safe-area-inset-left))] max-w-full transform-gpu overflow-y-auto border-gray-200/50 border-r shadow-xl transition-[left] duration-300 lg:fixed lg:top-[calc(30px+128px+30px)] lg:bottom-[30px] lg:left-auto lg:z-94 lg:w-[260px] lg:overflow-hidden lg:rounded-xl lg:py-4',
              { 'left-0': sidebarOpened },
            )}
          >
            <ScrollArea.Viewport>
              <ul className="pt-[calc(1rem+env(safe-area-inset-top))] pr-2 pb-[calc(1rem+env(safe-area-inset-bottom))] pl-3">
                <li className="flex flex-col">
                  <Link
                    className={cn(
                      'group relative flex h-11 w-full grow items-center rounded-xl px-4 py-2.5 outline-hidden transition-all duration-200',
                      'hover:bg-linear-to-r hover:from-brand/8 hover:to-brand/5 hover:text-brand hover:shadow-sm',
                      isHome && 'bg-linear-to-r from-brand/12 to-brand/8 text-brand shadow-sm',
                    )}
                    to={basename}
                  >
                    {isHome && (
                      <span className="-translate-y-1/2 absolute top-1/2 left-0 h-10 w-1 rounded-r-full bg-linear-to-b from-brand to-brand/80 shadow-sm transition-all" />
                    )}
                    <HomeIcon
                      className={cn(
                        'relative z-10 mr-3 h-5 w-5 transition-all duration-200',
                        'group-hover:scale-110 group-hover:drop-shadow-sm',
                        isHome ? 'text-brand drop-shadow-sm' : 'text-gray-600 group-hover:text-brand',
                      )}
                    />
                    <span
                      className={cn('relative z-10 font-medium text-base transition-colors', isHome && 'text-brand')}
                    >
                      Tela Inicial
                    </span>
                  </Link>
                </li>

                <li className="mt-6 mb-3 flex h-8 items-center px-5">
                  <div className="h-px flex-1 bg-linear-to-r from-transparent via-gray-300 to-transparent" />
                  <h4 className="mx-3 flex items-center font-semibold text-gray-400 text-xs uppercase tracking-wider">
                    Menu
                  </h4>
                  <div className="h-px flex-1 bg-linear-to-r from-transparent via-gray-300 to-transparent" />
                </li>

                {pages.map((page) =>
                  'pages' in page ? (
                    <DropdownMenuItem key={page.title} page={page} basename={basename} />
                  ) : (
                    <SingleMenuItem key={page.title} page={page} basename={basename} />
                  ),
                )}
              </ul>
            </ScrollArea.Viewport>
            <ScrollArea.Scrollbar
              className="flex touch-none select-none bg-black/[.114] p-0.5 transition-colors duration-150 ease-out hover:bg-black/22 data-[orientation=horizontal]:h-2.5 data-[orientation=vertical]:w-2.5 data-[orientation=horizontal]:flex-col"
              orientation="vertical"
            >
              <ScrollArea.Thumb className="before:-translate-x-1/2 before:-translate-y-1/2 relative flex-1 rounded-[10px] bg-stone-500 before:absolute before:top-1/2 before:left-1/2 before:h-full before:min-h-[44px] before:w-full before:min-w-[44px] before:content-['']" />
            </ScrollArea.Scrollbar>
            <ScrollArea.Scrollbar
              className="flex touch-none select-none bg-black/[.114] p-0.5 transition-colors duration-150 ease-out hover:bg-black/22 data-[orientation=horizontal]:h-2.5 data-[orientation=vertical]:w-2.5 data-[orientation=horizontal]:flex-col"
              orientation="horizontal"
            >
              <ScrollArea.Thumb className="before:-translate-x-1/2 before:-translate-y-1/2 relative flex-1 rounded-[10px] bg-stone-500 before:absolute before:top-1/2 before:left-1/2 before:h-full before:min-h-[44px] before:w-full before:min-w-[44px] before:content-['']" />
            </ScrollArea.Scrollbar>
            <ScrollArea.Corner className="bg-black/22" />
          </div>
        </ScrollArea.Root>

        {sidebarOpened && (
          <div
            className="fixed top-0 right-0 bottom-0 left-0 z-1000 overflow-hidden bg-black/10 lg:hidden"
            onClick={() => setSidebarOpened(false)}
          />
        )}

        <div className="max-w-full flex-auto shrink-0 pt-12 pb-4 lg:flex lg:flex-col lg:pt-[calc(30px+128px+30px)] lg:pl-[285px]">
          <Outlet />
        </div>
      </div>

      {version && (
        <footer className="my-3 max-w-full text-base text-gray-400 lg:py-4">
          <div className="mx-auto w-full pr-[calc(1rem+env(safe-area-inset-right))] pb-[calc(.25rem+env(safe-area-inset-bottom))] pl-[calc(1rem+env(safe-area-inset-left))] lg:ml-[285px] lg:px-20 lg:py-0">
            {import.meta.env.VITE_APP_CUSTOMER_NAME} v{version}
          </div>
        </footer>
      )}
    </div>
  )
}
