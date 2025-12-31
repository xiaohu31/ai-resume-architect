import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
  plugins: [react()],
  // 移除 define 块，不再将环境变量硬编码进打包后的 JavaScript 中
  // 这样生产环境构建出来的代码中不包含敏感的 API Key
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    }
  }
});
