import { HomeIcon } from 'lucide-react'
import type { PageProps } from '../components/panel-outlet'

// Defina aqui as páginas do menu principal
export const pages: PageProps[] = [
  { title: 'Home', path: '/', icon: HomeIcon, roles: ['Admin'] },
  // Adicione suas páginas aqui...
]
