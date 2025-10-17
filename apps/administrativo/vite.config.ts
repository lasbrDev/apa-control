import Unfonts from 'unplugin-fonts/vite'
import { defineConfig } from 'vite'

import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  return {
    base: mode === 'production' ? '/administrativo/' : undefined,
    plugins: [
      react(),
      Unfonts({
        google: {
          families: [{ name: 'Open Sans', styles: 'wght@300;400;500;600;700;800' }],
        },
      }),
    ],
  }
})
