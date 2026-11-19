import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8799',
        changeOrigin: true,
        headers: {
          Origin: 'http://127.0.0.1:8799',
        },
      },
      '/berkas': {
        target: 'http://127.0.0.1:8799',
        changeOrigin: true,
      },
      '/stream': {
        target: 'http://127.0.0.1:8799',
        changeOrigin: true,
      },
      '/font': {
        target: 'http://127.0.0.1:8799',
        changeOrigin: true,
      },
      '/aset': {
        target: 'http://127.0.0.1:8799',
        changeOrigin: true,
      },
    },
  },
})

