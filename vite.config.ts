import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    postcss: './postcss.config.js',
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  },
  build: {
    // Increase chunk size warning limit to 1000 kB
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // Manual chunking strategy
        manualChunks(id) {
          // Vendor chunks - separate large libraries
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'react-vendor';
            }
            if (id.includes('@radix-ui') || id.includes('lucide-react')) {
              return 'ui-vendor';
            }
            if (id.includes('react-hook-form') || id.includes('zod')) {
              return 'form-vendor';
            }
            if (id.includes('axios') || id.includes('date-fns')) {
              return 'utility-vendor';
            }
            // All other node_modules
            return 'vendor';
          }
          
          // Application chunks - group by feature
          if (id.includes('/src/pages/officers/')) {
            return 'officer-pages';
          }
          if (id.includes('/src/pages/user/')) {
            return 'user-pages';
          }
          if (id.includes('/src/pages/auth/')) {
            return 'auth-pages';
          }
          if (id.includes('/src/pages/payment/')) {
            return 'payment-pages';
          }
          if (id.includes('/src/components/common/')) {
            return 'components-common';
          }
          if (id.includes('/src/components/forms/')) {
            return 'components-forms';
          }
          if (id.includes('/src/services/')) {
            return 'services';
          }
        },
        // Optimize chunk file names
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },
    // Enable source maps for production debugging (optional)
    sourcemap: false,
    // Optimize build performance - use esbuild (faster and built-in)
    minify: 'esbuild',
  },
  server: {
    port: 3000,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5012',
        changeOrigin: true,
        secure: true,
        headers: {
          'ngrok-skip-browser-warning': 'true',
          'Accept': 'application/json',
        },
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            proxyReq.setHeader('ngrok-skip-browser-warning', 'true');
            console.log('Sending Request:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response:', proxyRes.statusCode, req.url);
          });
        },
      }
    }
  }
})
