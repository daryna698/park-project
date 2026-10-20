import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    base: './',            // ВАЖЛИВО для GitHub Pages: відносні шляхи
    server: { host: true, open: true }
})
