import { useEffect, useState } from 'react'

import { cn } from '../../helpers/classname'
import { Logo } from '../logo'

const HomeBoxBackground: React.FC<React.InputHTMLAttributes<HTMLDivElement>> = ({ className, children, ...props }) => {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains('dark'))
    }

    checkTheme()
    const observer = new MutationObserver(checkTheme)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })

    return () => observer.disconnect()
  }, [])

  const lightGradient = 'linear-gradient(135deg, #b8c4f5 0%, #c4a8d4 25%, #f8d2fe 50%, #fbb5be 75%, #b8dfff 100%)'
  const darkGradient = 'linear-gradient(135deg, #1a1a2e 0%, #16213e 25%, #0f3460 50%, #1a1a2e 75%, #16213e 100%)'

  return (
    <div
      {...props}
      className={cn(
        'flex min-h-screen w-full flex-col flex-wrap items-center justify-center bg-linear-to-br from-violet-50 via-pink-50 to-rose-50 px-4',
        className,
      )}
      style={{
        background: isDark ? darkGradient : lightGradient,
        backgroundSize: '400% 400%',
        animation: 'gradient 15s ease infinite',
        transition: 'background 0.3s ease',
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
}

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
