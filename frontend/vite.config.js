import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    watch: { usePolling: process.env.WATCH_POLLING === 'true', interval: 300 },
    proxy: {
      '/api': {
        target: process.env.API_PROXY_TARGET ?? 'http://localhost:65432',
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
