import { Navigate, matchRoutes, useLocation } from 'react-router-dom'

import { version } from '../../../package.json'
import { useApp } from '../../App'
import { Panel } from '../panel'

import type { ElementType } from 'react'

export interface PageProps {
  title: string
  path?: string
  icon?: ElementType
  roles?: string[]
  strictActive?: boolean
  pages?: Pick<PageProps, 'title' | 'path' | 'roles'>[]
}

interface PanelProps {
  pages: PageProps[]
  basename?: string
}

export function PanelOutlet({ pages, basename = '' }: PanelProps) {
  const app = useApp()
  const location = useLocation()

  if (!app.token) {
    return <Navigate to="/login" replace />
  }

  const allPages = pages.flatMap((page) =>
    'pages' in page ? page.pages!.map<PageProps>((p) => ({ ...p, roles: p.roles || page.roles })) : page,
  )

  const routes = matchRoutes(allPages, location, basename)
  const roles = routes?.flatMap(({ route }) => (route as PageProps).roles).filter(Boolean) as string[]

  if (roles?.length && !roles.some((role: string) => app.operator.roles.includes(role))) {
    return <Navigate to="/nao-encontrado" replace />
  }

  const filteredPages = pages
    .filter(({ roles }) => !roles || app.operator.roles?.some((role: string) => roles.includes(role)))
    .map((page) => {
      const newPage = { ...page }

      if (page.pages) {
        newPage.pages = page.pages.filter(
          ({ roles }) => !roles || app.operator.roles?.some((role: string) => roles.includes(role)),
        )
      }

      return newPage
    })

  return <Panel basename={basename} version={version} pages={filteredPages} signOut={app.signOut} />
}
