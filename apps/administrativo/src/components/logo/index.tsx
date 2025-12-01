import { useEffect, useState } from 'react'

import logo from '../../assets/img/logo.png'
import logoDark from '../../assets/img/logoDark.png'
import logoNav from '../../assets/img/logoNav.png'

interface LogoProps {
  className?: string
  isLogin?: boolean
}

export const Logo = ({ className, isLogin }: LogoProps) => {
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

  const getLogo = () => {
    if (isLogin) {
      return isDark ? logoDark : logo
    }
    // Usa logoDark para o nav também quando estiver em dark mode
    return isDark ? logoDark : logoNav
  }

  return <img className={className} alt={import.meta.env.VITE_APP_CUSTOMER_NAME} src={getLogo()} />
}
