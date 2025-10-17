import iTransitLogo from '../../assets/img/logo.png'
import iTransitNavLogo from '../../assets/img/logoNav.png'

interface LogoProps {
  className?: string
  isLogin?: boolean
}

export const Logo = ({ className, isLogin }: LogoProps) => {
  return (
    <img
      className={className}
      alt={import.meta.env.VITE_APP_CUSTOMER_NAME}
      src={isLogin ? iTransitLogo : iTransitNavLogo}
    />
  )
}
