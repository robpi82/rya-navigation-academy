/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  build: {
    rollupOptions: {
      output: {
        // Nur recharts und seine eigenen Bibliotheken in den Diagramm-Chunk – React bleibt im Start-Chunk,
        // damit der Diagramm-Chunk erst geladen wird, wenn eine Seite Diagramme zeigt.
        manualChunks(id) {
          // Gemeinsame Basis (React, clsx) eigens bündeln, sonst zieht Rollup sie als Abhängigkeit in den Diagramm-Chunk
          if (/node_modules\/(react|react-dom|scheduler|react-is|clsx)\//.test(id)) return 'vendor'
          if (/node_modules\/(recharts|recharts-scale|react-smooth|victory-vendor|d3-[a-z-]+|internmap|lodash|eventemitter3|decimal\.js-light|tiny-invariant|fast-equals)\//.test(id)) return 'recharts'
        },
      },
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
