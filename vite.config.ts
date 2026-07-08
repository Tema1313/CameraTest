import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/CameraTest/',
  resolve: {
    alias: {
      'react-use-face-detection': path.resolve(
        __dirname,
        'node_modules/react-use-face-detection/build/index.js'
      )
    }
  }
})
