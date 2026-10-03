import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 若部署到 GitHub Pages 子路徑，請把 base 改成 '/你的repo名稱/'
export default defineConfig({ plugins: [react()], base: './' })
