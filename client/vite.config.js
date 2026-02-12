import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [react()],
    server: {
      port: 3050,
      host: true,
      allowedHosts: [
        'localhost',
        '127.0.0.1',
        ...(env.VITE_CUSTOM_DOMAIN ? [env.VITE_CUSTOM_DOMAIN] : []),
        '192.168.2.128'
      ]
    }
  }
})
