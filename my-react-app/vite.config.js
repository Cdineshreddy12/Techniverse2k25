import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'


export default defineConfig({
  plugins: [react()],
  css: {
    postcss: './postcss.config.js', // Optional if you have a custom postcss config
  },
})
