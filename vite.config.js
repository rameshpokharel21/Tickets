import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueDevTools from "vite-plugin-vue-devtools";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    VitePWA({
      registerType: "autoUpdate", // auto-update the service worker
      manifest: {
        name: "Tickets",
        short_name: "App",
        description: "Scratchoff tickets inventory",
        theme_color: "#ffffff",
        icons: [
          {
            src: "/icons/icon_192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/icons/icon_512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
      workbox: {
        // Workbox options, like caching strategies, etc.
      },
    }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
