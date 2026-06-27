import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let cartographerPlugin = [];
if (process.env.NODE_ENV !== "production" && process.env.REPL_ID !== undefined) {
  try {
    const cartographerModule = require("@replit/vite-plugin-cartographer");
    cartographerPlugin = [cartographerModule.cartographer()];
  } catch (error) {
    console.warn("Cartographer plugin not available:", error);
  }
}

export default defineConfig({
  plugins: [react(), runtimeErrorOverlay(), ...cartographerPlugin],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@assets": path.resolve(__dirname, "src", "photos")
    }
  },
  root: __dirname,
  build: {
    outDir: path.resolve(__dirname, "..", "dist", "frontend"),
    emptyOutDir: true
  },
  css: {
    postcss: path.resolve(__dirname, "postcss.config.js")
  },
  server: {
    port: 5173,
    host: true,
    proxy: {
      "/api": {
        target: process.env.VITE_API_BASE_URL || "http://127.0.0.1:5000",
        changeOrigin: true,
        secure: false
      }
    },
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  },
  define: {
    "process.env": process.env
  }
});
