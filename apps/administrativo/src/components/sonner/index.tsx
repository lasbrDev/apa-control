import { useTheme } from 'next-themes'
import { Toaster as Sonner } from 'sonner'

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme } = useTheme()
  return <Sonner richColors className="toaster group" theme={theme as ToasterProps['theme']} {...props} />
}

export { Toaster }
