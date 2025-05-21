import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './', // ✅ important for Electron
  server: {
    // Proxy all /pmms requests to Freddie Mac’s CSV endpoint
    proxy: {
      '/pmms': {
        target: 'https://www.freddiemac.com',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/pmms/, '/pmms/docs')
      }
    }
  },
  build: {
    outDir: 'dist-frontend',
  },
});