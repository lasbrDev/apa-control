import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    clearMocks: true,
    slowTestThreshold: 15e3,
    testTimeout: 30e3,
    globalSetup: ['./src/tests/global.ts'],
  },
})
