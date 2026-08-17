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
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'react-vendor';
          }
          if (id.includes('node_modules/lucide-react')) {
            return 'icons';
          }
          // Split heavy pages into their own chunks
          if (id.includes('/pages/ContactPage')) return 'page-contact';
          if (id.includes('/pages/QuotePage')) return 'page-quote';
          if (id.includes('/pages/AdminPage')) return 'page-admin';
          if (id.includes('/pages/CCTVPage')) return 'page-cctv';
          if (id.includes('/pages/AlarmPage')) return 'page-alarm';
          if (id.includes('/pages/SmartDoorLockPage')) return 'page-doorlock';
          if (id.includes('/pages/PortfolioPage')) return 'page-portfolio';
          if (id.includes('/pages/FAQPage')) return 'page-faq';
          if (id.includes('/pages/BlogPage')) return 'page-blog';
          if (id.includes('/pages/AboutPage')) return 'page-about';
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
})

