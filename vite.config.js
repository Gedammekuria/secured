import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false
      }
    },
    warmup: {
      clientFiles: [
        './src/main.jsx',
        './src/App.jsx',
        './src/pages/Home.jsx',
        './src/pages/CCTVPage.jsx',
        './src/pages/PortfolioPage.jsx',
        './src/pages/ContactPage.jsx',
      ],
    },
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-dom/client',
      'lucide-react',
      'react/jsx-runtime'
    ],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'react-vendor';
          }
          if (id.includes('node_modules/lucide-react')) {
            return 'icons';
          }
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
})
