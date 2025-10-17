import { useState } from 'react'

export interface RefreshObject {
  ref: boolean
  force: VoidFunction
}

export function useRefresh() {
  const [refresh, setRefresh] = useState(false)

  function force() {
    setRefresh((prev) => !prev)
  }

  return { ref: refresh, force }
}
