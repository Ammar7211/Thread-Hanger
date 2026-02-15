import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  // Only the name of your repo, surrounded by slashes
  base: '/Thread-Hanger/', 
  plugins: [react()],
})