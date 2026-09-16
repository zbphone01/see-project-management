import { defineConfig } from 'vite'
import { createVuePlugin } from 'vite-plugin-vue2'

export default defineConfig({
  plugins: [createVuePlugin()],
  server: { host: '127.0.0.1', port: 4173 },
  build: { outDir: 'dist', assetsDir: 'assets' }
})
