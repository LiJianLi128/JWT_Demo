import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 3001,
    proxy: {
      '/api': {
        // target: 'http://127.0.0.1:8080', // 代理目标地址(Flask)
        target: 'http://127.0.0.1:8081', // 代理目标地址(SpringBoot)
        secure: false, // 不验证证书
        changeOrigin: true, // 允许跨域
        // 去掉rewrite，保持/api前缀，后端需要/api/auth路径
      }
    }
  }
})