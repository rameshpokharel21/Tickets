import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueDevTools from "vite-plugin-vue-devtools";
import { resolve } from "path";
import { viteStaticCopy } from "vite-plugin-static-copy";

export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    viteStaticCopy({
      targets: [
        {
          src: "electron/preload.js",
          dest: ".",
        },
        {
          src: "public/sql-wasm.wasm",
          dest: ".",
        },
      ],
    }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  base: "./", // Keep it for Electron, but ensure assets are loaded properly
  build: {
    outDir: "dist",
    assetsDir: ".",
    emptyOutDir: true,
    target: "esnext", // Ensure latest Electron compatibility
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
      },
    },
  },
});
