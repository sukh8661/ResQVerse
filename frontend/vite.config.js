import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      "@": path.resolve(process.cwd(), "src"),
      "@assets": path.resolve(process.cwd(), "src/photos"),
    },
  },

  build: {
    outDir: "dist",
    emptyOutDir: true,
  },

  css: {
    postcss: path.resolve(process.cwd(), "postcss.config.js"),
  },

  server: {
    port: 5173,
    host: true,

    proxy: {
      "/api": {
        target:
          process.env.VITE_API_URL ||
          "http://127.0.0.1:5000",
        changeOrigin: true,
        secure: false,
      },

      "/ws": {
        target:
          process.env.VITE_API_URL ||
          "ws://127.0.0.1:5000",
        ws: true,
        changeOrigin: true,
        secure: false,
      },
    },
  },
});