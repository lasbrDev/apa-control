import { type ElementType, useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'

import * as ScrollArea from '@radix-ui/react-scroll-area'
import { HomeIcon, LogOutIcon, MenuIcon, XIcon } from 'lucide-react'

import { cn } from '../../helpers/classname'
import { useEffectExceptOnMount } from '../../hooks/effect-except-on-mount'
import { Button } from '../button'
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
  title: string
  version?: string
  signOut: VoidFunction
  basename?: string
}

export const Panel = ({ pages, version, title, signOut, basename = '' }: PanelProps) => {
  const { pathname: actualPath } = useLocation()
  const [sidebarOpened, setSidebarOpened] = useState(false)
  const isHome = actualPath === basename

  useEffectExceptOnMount(() => {
    setSidebarOpened(false)
  }, [actualPath])

  return (
    <div id="panel" className="flex w-full flex-col overflow-x-hidden">
      <header className="fixed top-0 right-0 left-0 z-97 flex min-h-[calc(70px+env(safe-area-inset-top))] items-stretch justify-between bg-stone-100 pt-[env(safe-area-inset-top)] pr-[env(safe-area-inset-right)] pl-[env(safe-area-inset-left)] shadow-[0_4px_30px_4px_#0000001a] transition-[height] duration-300">
        <div className="mx-auto flex w-full items-center justify-between gap-4 px-4 lg:px-20">
          <Link className="flex items-center" to={basename}>
            <Logo className="inline h-10 max-w-full" />
            <span className="pl-3 font-semibold text-dark text-sm">{title}</span>
          </Link>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              className="inline-flex items-center justify-center font-semibold text-dark text-sm outline-hidden lg:hidden"
              onClick={() => setSidebarOpened(true)}
            >
              <MenuIcon className="mr-1 h-4 w-4" />
              <span>Menu</span>
            </button>

            <button
              type="button"
              className="inline-flex cursor-pointer items-center justify-center font-semibold text-dark text-sm outline-hidden"
              onClick={signOut}
            >
              <LogOutIcon className="mr-1 h-4 w-4" />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-full flex-auto items-stretch pr-[calc(1rem+env(safe-area-inset-right))] pl-[calc(1rem+env(safe-area-inset-left))] lg:px-20">
        <ScrollArea.Root>
          <div
            style={{ backfaceVisibility: 'hidden' }}
            className={cn(
              'fixed top-0 bottom-0 left-[calc(-295px-env(safe-area-inset-left))] z-1001 flex w-[calc(275px+env(safe-area-inset-left))] max-w-full transform-gpu overflow-y-auto bg-white shadow-[0_0_28px_#66666614] transition-[left] duration-300 lg:top-[100px] lg:bottom-[30px] lg:left-auto lg:z-94 lg:w-[255px] lg:overflow-hidden lg:rounded-sm lg:py-2',
              { 'left-0': sidebarOpened },
            )}
          >
            <ScrollArea.Viewport>
              <Button
                type="button"
                size="icon"
                variant="outline"
                className="absolute top-[calc(1rem+env(safe-area-inset-top))] right-4 h-8 w-8 lg:hidden"
                onClick={() => setSidebarOpened(false)}
              >
                <XIcon className="h-5 w-5" />
              </Button>

              <ul className="pt-[calc(1rem+env(safe-area-inset-top))] pr-[calc(.625rem+env(safe-area-inset-right))] pb-[calc(1rem+env(safe-area-inset-bottom))] pl-[calc(.625rem+env(safe-area-inset-left))]">
                <li className="flex flex-col">
                  <Link
                    className="group relative flex h-11 w-full grow items-center px-5 py-2 outline-hidden"
                    to={basename}
                  >
                    <HomeIcon className={cn('mr-2 h-5 w-5 group-hover:text-brand', { 'text-brand': isHome })} />
                    <span className={cn('font-semibold text-sm group-hover:text-brand', { 'text-brand': isHome })}>
                      Tela Inicial
                    </span>
                  </Link>
                </li>

                <li className="mt-5 flex h-10 px-5">
                  <h4 className="flex items-center font-bold text-xs uppercase tracking-wider">Menu</h4>
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

        <div className="max-w-full flex-auto shrink-0 pt-[calc(90px+env(safe-area-inset-top))] pb-4 lg:flex lg:flex-col lg:pt-[100px] lg:pl-[285px]">
          <Outlet />
        </div>
      </div>

      {version && (
        <footer className="my-3 max-w-full text-gray-400 text-sm lg:py-4">
          <div className="mx-auto w-full pr-[calc(1rem+env(safe-area-inset-right))] pb-[calc(.25rem+env(safe-area-inset-bottom))] pl-[calc(1rem+env(safe-area-inset-left))] lg:ml-[285px] lg:px-20 lg:py-0">
            {import.meta.env.VITE_APP_CUSTOMER_NAME} v{version}
          </div>
        </footer>
      )}
    </div>
  )
}
