import { cn } from '../../helpers/classname'
import { Logo } from '../logo'

const HomeBoxBackground: React.FC<React.InputHTMLAttributes<HTMLDivElement>> = ({ className, children, ...props }) => (
  <div
    {...props}
    className={cn(
      'flex min-h-screen w-full flex-col flex-wrap items-center justify-center bg-linear-to-br from-violet-50 via-pink-50 to-rose-50 px-4',
      className,
    )}
    style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%)',
      backgroundSize: '400% 400%',
      animation: 'gradient 15s ease infinite',
    }}
  >
    <style>
      {`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}
    </style>
    {children}
  </div>
)

const HomeBox: React.FC<React.InputHTMLAttributes<HTMLDivElement>> = ({ className, children, ...props }) => (
  <div
    {...props}
    className={cn(
      'glass-card my-10 w-full animate-fade-in rounded-2xl px-7 py-10 shadow-2xl md:max-w-md md:px-14 md:py-12',
      className,
    )}
  >
    {children}
  </div>
)

const HomeBoxLogo: React.FC<React.InputHTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div {...props} className={cn('flex items-center justify-center px-4', className)}>
    <Logo isLogin className="max-h-36 w-auto max-w-full" />
  </div>
)

export { HomeBox, HomeBoxBackground, HomeBoxLogo }
