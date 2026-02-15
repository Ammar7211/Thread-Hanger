import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // Change this from '/Thread-Hanger/' to just '/'
  base: '/', 
  plugins: [react()],
})