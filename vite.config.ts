import path from "path"
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'



// https://vite.dev/config/
export default defineConfig(({mode}) => {
  const env = loadEnv(mode, process.cwd())

  return {
      plugins: [
    tanstackRouter({
    target: 'react',
    autoCodeSplitting: true,
  }), react(), tailwindcss()],
  resolve: {
  alias: {
    "@": path.resolve(import.meta.dirname, "./src"),
  },
},
  server: {
    proxy: {
      '/api': {
        target: env.VITE_PROXY_TARGET || 'http://localhost:5189', 
        changeOrigin: true,
        secure: false,
      },
      '/hubs': {
        target: env.VITE_PROXY_TARGET || 'http://localhost:5189',
        changeOrigin: true,
        secure: false,
        ws: true,
      },
    },
  },
  }
})
