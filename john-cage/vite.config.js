// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/John-cage/',   // 仓库名，大小写和连字符与 GitHub 完全一致
})
