import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: [
        'src/utils/**',
        'src/hooks/**',
        'src/components/UI/**'
      ],
      exclude: ['src/pages/**', 'src/App.tsx', 'src/main.tsx', 'src/styles/**']
    }
  }
})
