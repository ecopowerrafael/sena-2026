import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "node:url";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      // O bundle consome o TypeScript do pacote compartilhado; o build CJS de
      // packages/shared existe para o Nest, e seu re-export não é estático o
      // bastante para o Rollup enxergar as constantes.
      "@sena/shared": fileURLToPath(new URL("../../packages/shared/src/index.ts", import.meta.url)),
    },
  },
  server: {
    port: 3000,
    host: true,
  },
});
