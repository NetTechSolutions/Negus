import { defineConfig } from 'vite'
import { resolve } from 'path'
import { cpSync } from 'fs'

export default defineConfig({
  root: '.',
  base: './',
  build: {
    rollupOptions: {
      input: {
        main:     resolve(__dirname, 'index.html'),
        projects: resolve(__dirname, 'projects.html'),
        about:    resolve(__dirname, 'about.html'),
        contact:  resolve(__dirname, 'contact.html'),
      }
    }
  },
  plugins: [{
    name: 'copy-images',
    // After Vite finishes writing dist/, copy the full images tree so that
    // JS string paths like /src/assets/images/... resolve correctly at runtime.
    closeBundle() {
      cpSync(
        resolve(__dirname, 'src/assets/images'),
        resolve(__dirname, 'dist/src/assets/images'),
        { recursive: true }
      )
    }
  }]
})
