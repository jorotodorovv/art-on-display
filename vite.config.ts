import { defineConfig } from "vite";
import path from "path";

import react from "@vitejs/plugin-react-swc";
import vercel from 'vite-plugin-vercel';

import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      // Proxy /api requests to your backend server
      '/api': {
        target: 'http://localhost:3000', // Replace with your backend server address
        changeOrigin: true, // Recommended for virtual hosted sites
        // secure: false, // Uncomment if your backend uses a self-signed SSL certificate
        // rewrite: (path) => path.replace(/^\/api/, '') // Optional: if your backend doesn't expect the /api prefix
      }
    }
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
    vercel(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
