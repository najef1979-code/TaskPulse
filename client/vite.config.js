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
        env.VITE_EXTERNAL_DOMAIN || 'taskpulse.ceraimic.eu',
        'localhost',
        env.VITE_LOCAL_IP || '192.168.2.128'
      ]
    }
  }
})
