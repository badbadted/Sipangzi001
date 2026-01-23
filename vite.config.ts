import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 8080, // 使用端口 8080
        host: 'localhost',
        strictPort: true, // 嚴格使用指定端口 8080，如果端口被占用則報錯，不會自動切換到 3000 或 3002
        // 注意：此配置確保不會使用 3000 或 3002 端口
        open: true, // 自動開啟瀏覽器
      },
      plugins: [react()],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
