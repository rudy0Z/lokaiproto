import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command }) => ({
  /*
   * Built assets are served from the portfolio at /embed/lokai/, so production
   * builds need that prefix or every script and stylesheet 404s inside the
   * iframe. Dev stays at '/' so `vite` still works normally. Sentinel does the
   * same thing (hardcoded there, since it has no separate dev use).
   */
  base: command === 'build' ? '/embed/lokai/' : '/',
  plugins: [
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],

  server: {
    proxy: {
      '/api/nvidia': {
        target: 'https://integrate.api.nvidia.com/v1',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/nvidia/, ''),
        secure: true,
      },
      '/api/sarvam': {
        target: 'https://api.sarvam.ai',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/sarvam/, ''),
        secure: true,
      },
    },
  },

  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('@phosphor-icons')) {
              return 'vendor-phosphor';
            }
            if (id.includes('@animateicons')) {
              return 'vendor-animateicons';
            }
            if (id.includes('react-dom') || id.includes('react-router') || id.includes('/node_modules/react/')) {
              return 'vendor-react';
            }
            if (id.includes('motion')) {
              return 'vendor-motion';
            }
          }
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
}))
