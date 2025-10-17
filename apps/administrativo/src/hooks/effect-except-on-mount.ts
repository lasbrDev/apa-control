import type React from 'react'
import { useEffect, useRef } from 'react'

export function useEffectExceptOnMount(effect: React.EffectCallback, dependencies: React.DependencyList) {
  const mounted = useRef(false)

  useEffect(() => {
    if (mounted.current) {
      return effect()
    }
    mounted.current = true
  }, dependencies)
}
