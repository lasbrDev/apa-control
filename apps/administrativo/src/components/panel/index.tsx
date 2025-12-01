import { type ElementType, useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'

import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import * as ScrollArea from '@radix-ui/react-scroll-area'
import { ChevronDownIcon, HomeIcon, LogOutIcon, MenuIcon, MoonIcon, SunIcon, UserIcon } from 'lucide-react'

import { useApp } from '../../App'
import { cn } from '../../helpers/classname'
import { useEffectExceptOnMount } from '../../hooks/effect-except-on-mount'
import { useTheme } from '../../hooks/theme'
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
  signOut: VoidFunction
  basename?: string
}

export const Panel = ({ pages, signOut, basename = '' }: PanelProps) => {
  const { pathname: actualPath } = useLocation()
  const [sidebarOpened, setSidebarOpened] = useState(false)
  const [hasInteracted, setHasInteracted] = useState(false)
  const isHome = actualPath === basename
  const { operator } = useApp()
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    const currentTheme = theme || 'light'
    const newTheme = currentTheme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  useEffectExceptOnMount(() => {
    setSidebarOpened(false)
  }, [actualPath])

  return (
    <div id="panel" className="flex w-full flex-col overflow-x-hidden lg:h-screen lg:overflow-hidden">
      <header className="glass-card relative top-[30px] right-4 left-4 z-97 flex min-h-[calc(128px+env(safe-area-inset-top))] w-[calc(100%-2rem)] items-center justify-between overflow-visible rounded-t-xl rounded-b-xl border-gray-200/50 border-b bg-white/90 pt-[env(safe-area-inset-top)] pr-[env(safe-area-inset-right)] pl-[env(safe-area-inset-left)] backdrop-blur-xl transition-all duration-300 ease-in-out lg:fixed lg:top-[30px] lg:right-20 lg:left-20 lg:w-[calc(100%-10rem)] dark:border-gray-700/50 dark:bg-gray-900/90">
        <div className="mx-auto flex w-full max-w-full items-center justify-between gap-4 px-4 lg:px-20">
          <div className="flex items-center gap-3 lg:flex-1">
            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 font-medium text-base text-gray-700 outline-hidden transition-all duration-200 hover:bg-gray-100 hover:text-gray-900 active:scale-95 lg:hidden dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100"
              onClick={() => {
                setHasInteracted(true)
                setSidebarOpened(true)
              }}
              aria-label="Abrir menu lateral"
            >
              <MenuIcon className="h-5 w-5" />
              <span>Menu</span>
            </button>
            <span className="hidden font-semibold text-gray-800 text-lg lg:inline-block dark:text-gray-200">
              Painel Administrativo
            </span>
          </div>

          <Link
            className="group -translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 flex items-center justify-center transition-all duration-200 hover:opacity-90"
            to={basename}
            aria-label="Ir para página inicial"
          >
            <Logo className="h-20 max-w-full transition-transform duration-200 group-hover:scale-105 lg:h-24" />
          </Link>

          <div className="flex items-center justify-end gap-3 lg:flex-1 lg:justify-end">
            <DropdownMenu.Root modal={false}>
              <DropdownMenu.Trigger asChild>
                <button
                  type="button"
                  className="group inline-flex items-center gap-2 rounded-lg px-2 py-1.5 outline-hidden transition-all duration-200 hover:bg-gray-100 active:scale-95 dark:hover:bg-gray-800"
                  aria-label={`Menu do usuário ${operator.name || ''}`}
                  aria-haspopup="menu"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-linear-to-br from-brand to-pink-500 font-semibold text-base text-white">
                    {operator.name ? getInitials(operator.name) : <UserIcon className="h-6 w-6" />}
                  </div>
                  <ChevronDownIcon className="h-4 w-4 text-gray-500 transition-transform duration-200 group-data-[state=open]:rotate-180 dark:text-gray-400" />
                </button>
              </DropdownMenu.Trigger>

              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  align="end"
                  sideOffset={8}
                  collisionPadding={16}
                  className="glass-card data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 z-100 min-w-[200px] overflow-hidden rounded-xl border border-gray-200/50 p-1"
                >
                  <div className="px-3 py-2.5">
                    <p className="font-semibold text-gray-900 text-sm leading-tight dark:text-gray-100">
                      {operator.name || 'Usuário'}
                    </p>
                    {operator.profileName && (
                      <p className="mt-1 text-gray-500 text-xs leading-tight dark:text-gray-400">
                        {operator.profileName}
                      </p>
                    )}
                  </div>

                  <DropdownMenu.Separator className="my-1 h-px bg-gray-200 dark:bg-gray-700" />

                  <DropdownMenu.Item
                    className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2.5 text-sm outline-hidden transition-colors hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900 focus:outline-hidden dark:focus:bg-gray-800 dark:focus:text-gray-100 dark:hover:bg-gray-800 dark:hover:text-gray-100"
                    onSelect={(e) => {
                      e.preventDefault()
                      toggleTheme()
                    }}
                  >
                    {(theme || 'light') === 'light' ? (
                      <>
                        <MoonIcon className="h-4 w-4" />
                        <span>Modo Escuro</span>
                      </>
                    ) : (
                      <>
                        <SunIcon className="h-4 w-4" />
                        <span>Modo Claro</span>
                      </>
                    )}
                  </DropdownMenu.Item>

                  <DropdownMenu.Separator className="my-1 h-px bg-gray-200 dark:bg-gray-700" />

                  <DropdownMenu.Item
                    className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2.5 text-sm outline-hidden transition-colors hover:bg-red-50 hover:text-red-600 focus:bg-red-50 focus:text-red-600 focus:outline-hidden dark:focus:bg-red-950/30 dark:focus:text-red-400 dark:hover:bg-red-950/30 dark:hover:text-red-400"
                    onClick={signOut}
                    onSelect={(e) => {
                      e.preventDefault()
                      signOut()
                    }}
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

      <div className="mx-auto flex w-full max-w-full flex-auto items-stretch pr-[calc(1rem+env(safe-area-inset-right))] pl-[calc(1rem+env(safe-area-inset-left))] lg:h-[calc(100vh-30px)] lg:overflow-hidden lg:px-20 lg:pt-[calc(30px+128px+30px)] lg:pb-[30px]">
        <ScrollArea.Root>
          <div
            style={{ backfaceVisibility: 'hidden' }}
            className={cn(
              'glass-card fixed top-0 bottom-0 z-1001 flex w-[calc(275px+env(safe-area-inset-left))] max-w-full transform-gpu overflow-y-auto border-gray-200/50 border-r shadow-sm transition-[left] duration-300 ease-in-out lg:top-[calc(30px+128px+30px)] lg:bottom-[30px] lg:left-auto lg:z-94 lg:w-[260px] lg:overflow-hidden lg:rounded-xl lg:py-4',
              sidebarOpened
                ? hasInteracted
                  ? 'slide-in-from-left left-0 animate-in duration-300'
                  : 'left-0'
                : hasInteracted
                  ? 'slide-out-to-left left-[calc(-295px-env(safe-area-inset-left))] animate-out duration-300'
                  : 'left-[calc(-295px-env(safe-area-inset-left))]',
            )}
          >
            <ScrollArea.Viewport>
              <ul className="pt-[calc(1rem+env(safe-area-inset-top))] pr-2 pb-[calc(1rem+env(safe-area-inset-bottom))] pl-3">
                <li className="flex flex-col">
                  <Link
                    className={cn(
                      'group relative flex h-11 w-full grow items-center rounded-xl px-4 py-2.5 outline-hidden transition-all duration-200',
                      'hover:bg-linear-to-r hover:from-brand/8 hover:to-brand/5 hover:text-brand',
                      isHome && 'bg-linear-to-r from-brand/12 to-brand/8 text-brand',
                    )}
                    to={basename}
                  >
                    {isHome && (
                      <span className="-translate-y-1/2 absolute top-1/2 left-0 h-10 w-1 rounded-r-full bg-linear-to-b from-brand to-brand/80 transition-all" />
                    )}
                    <HomeIcon
                      className={cn(
                        'relative z-10 mr-3 h-5 w-5 transition-all duration-200',
                        'group-hover:scale-110',
                        isHome ? 'text-brand' : 'text-gray-600 group-hover:text-brand dark:text-gray-400',
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
                  <div className="h-px flex-1 bg-linear-to-r from-transparent via-gray-300 to-transparent dark:via-gray-600" />
                  <h4 className="mx-3 flex items-center font-semibold text-gray-400 text-xs uppercase tracking-wider dark:text-gray-500">
                    Menu
                  </h4>
                  <div className="h-px flex-1 bg-linear-to-r from-transparent via-gray-300 to-transparent dark:via-gray-600" />
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
              className="flex touch-none select-none bg-black/[.114] p-0.5 transition-colors duration-150 ease-out hover:bg-black/22 data-[orientation=horizontal]:h-2.5 data-[orientation=vertical]:w-2.5 data-[orientation=horizontal]:flex-col dark:bg-white/[.114] dark:hover:bg-white/22"
              orientation="vertical"
            >
              <ScrollArea.Thumb className="before:-translate-x-1/2 before:-translate-y-1/2 relative flex-1 rounded-[10px] bg-stone-500 before:absolute before:top-1/2 before:left-1/2 before:h-full before:min-h-[44px] before:w-full before:min-w-[44px] before:content-[''] dark:bg-gray-600" />
            </ScrollArea.Scrollbar>
          </div>
        </ScrollArea.Root>

        <div
          className={cn(
            'fixed top-0 right-0 bottom-0 left-0 z-1000 overflow-hidden bg-black/10 transition-opacity duration-300 ease-in-out lg:hidden',
            sidebarOpened ? 'opacity-100' : 'pointer-events-none opacity-0',
          )}
          onClick={() => {
            setHasInteracted(true)
            setSidebarOpened(false)
          }}
        />

        <div className="max-w-full flex-auto shrink-0 pt-12 pb-4 lg:flex lg:h-[calc(100vh-30px-128px-30px-30px)] lg:flex-col lg:overflow-hidden lg:pt-0 lg:pb-0 lg:pl-[285px]">
          <div className="h-full w-full lg:overflow-hidden lg:rounded-xl">
            <div className="h-full w-full lg:hidden">
              <Outlet />
            </div>
            <ScrollArea.Root className="hidden h-full w-full lg:block">
              <ScrollArea.Viewport className="h-full w-full">
                <Outlet />
              </ScrollArea.Viewport>
              <ScrollArea.Scrollbar
                className="flex touch-none select-none bg-black/[.114] p-0.5 transition-colors duration-150 ease-out hover:bg-black/22 data-[orientation=horizontal]:h-2.5 data-[orientation=vertical]:w-2.5 data-[orientation=horizontal]:flex-col dark:bg-white/[.114] dark:hover:bg-white/22"
                orientation="vertical"
              >
                <ScrollArea.Thumb className="before:-translate-x-1/2 before:-translate-y-1/2 relative flex-1 rounded-[10px] bg-stone-500 before:absolute before:top-1/2 before:left-1/2 before:h-full before:min-h-[44px] before:w-full before:min-w-[44px] before:content-[''] dark:bg-gray-600" />
              </ScrollArea.Scrollbar>
            </ScrollArea.Root>
          </div>
        </div>
      </div>
    </div>
  )
}
