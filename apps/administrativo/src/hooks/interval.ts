import { useEffect, useRef } from 'react'

export function useInterval(callback: VoidFunction, delay: number | null) {
  const callbacRef = useRef<VoidFunction>()

  useEffect(() => {
    callbacRef.current = callback
  })

  useEffect(() => {
    if (!delay) {
      return () => {
        /* */
      }
    }

    const interval = setInterval(() => {
      if (callbacRef.current) {
        callbacRef.current()
      }
    }, delay)

    return () => clearInterval(interval)
  }, [delay])
}
