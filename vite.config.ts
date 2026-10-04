import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// `base` relativo permite publicar em GitHub Pages (subpasta /<repo>/) sem configuração extra.
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
})
