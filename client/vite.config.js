/* global process */

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

import packageJson from "./package.json" with { type: "json" };

const appVersion = packageJson.version;
const buildCommit = process.env.GITHUB_SHA || process.env.VITE_COMMIT_SHA || "local";
const builtAt = process.env.BUILD_TIMESTAMP || new Date().toISOString();

const buildInfoPlugin = {
  name: "dashpoint-build-info",
  generateBundle() {
    this.emitFile({
      type: "asset",
      fileName: "build-info.json",
      source: JSON.stringify({ version: appVersion, commit: buildCommit, builtAt }, null, 2),
    });
  },
};

// https://vite.dev/config/
export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(appVersion),
    __APP_COMMIT__: JSON.stringify(buildCommit),
    __APP_BUILT_AT__: JSON.stringify(builtAt),
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  plugins: [
    react(),
    tailwindcss(),
    buildInfoPlugin,
    VitePWA({
      registerType: "prompt",
      includeAssets: ["icon-192.svg", "icon-512.svg"],
      manifest: {
        name: "DashPoint - Personal Productivity Dashboard",
        short_name: "DashPoint",
        description:
          "Your all-in-one personal productivity dashboard with planner widgets, weather, and content tools",
        theme_color: "#8B5CF6",
        background_color: "#ffffff",
        id: "/",
        lang: "en",
        dir: "ltr",
        display: "standalone",
        scope: "/",
        start_url: "/",
        orientation: "portrait-primary",
        categories: ["productivity", "lifestyle", "utilities"],
        icons: [
          {
            src: "icon-192.svg",
            sizes: "192x192",
            type: "image/svg+xml",
            purpose: "any maskable",
          },
          {
            src: "icon-512.svg",
            sizes: "512x512",
            type: "image/svg+xml",
            purpose: "any maskable",
          },
        ],
      },
      devOptions: {
        enabled: false,
      },
      workbox: {
        cacheId: `dashpoint-${appVersion}`,
        cleanupOutdatedCaches: true,
        maximumFileSizeToCacheInBytes: 8 * 1024 * 1024,
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        navigateFallback: "index.html",
        navigateFallbackDenylist: [/^\/_/, /^\/api\//, /\/[^/?]+\.[^/]+$/],
        runtimeCaching: [
          {
            urlPattern: ({ request, url }) =>
              request.destination === "image" && url.origin === self.location.origin,
            handler: "CacheFirst",
            options: {
              cacheName: `dashpoint-images-${appVersion}`,
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 60 * 60 * 24 * 7,
              },
            },
          },
        ],
      },
    }),
  ],
});
