import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['test/e2e/chat/**/*.test.ts'],
    environment: 'node',
    fileParallelism: false,
  },
})
