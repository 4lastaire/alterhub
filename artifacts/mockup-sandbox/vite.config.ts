import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { mockupPreviewPlugin } from "./mockupPreviewPlugin";
import { VitePWA } from "vite-plugin-pwa";

function getValidatedPort(): number {
  const rawPort = process.env.PORT;

  if (!rawPort) {
    throw new Error("PORT environment variable is required but was not provided.");
  }

  const port = Number(rawPort);
  if (Number.isNaN(port) || port <= 0) {
    throw new Error(`Invalid PORT value: "${rawPort}"`);
  }

  return port;
}

function getBasePath(): string {
  const basePath = process.env.BASE_PATH;
  if (basePath) return basePath;

  // GitHub Pages project sites are hosted under /<repo>/.
  // Defaulting to "/" keeps local builds working without extra env.
  return "/";
}

export default defineConfig(({ command }) => {
  const basePath = getBasePath();
  const port = command === "serve" ? getValidatedPort() : undefined;

  return {
    base: basePath,
  plugins: [
    mockupPreviewPlugin(),
    react(),
    tailwindcss(),
    runtimeErrorOverlay(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["pwa-icon.svg"],
      manifest: {
        name: "Mockup Canvas",
        short_name: "Mockup",
        description: "UI prototyping sandbox with infinite canvas",
        theme_color: "#0b0f19",
        background_color: "#0b0f19",
        display: "standalone",
        scope: basePath,
        start_url: basePath,
        icons: [
          {
            src: "pwa-icon.svg",
            sizes: "any",
            type: "image/svg+xml",
            purpose: "any maskable",
          },
        ],
      },
      workbox: {
        // Cache build output + typical static assets.
        globPatterns: ["**/*.{js,css,html,ico,png,svg,webp,woff2}"],
        navigateFallback: "index.html",
      },
      devOptions: {
        enabled: process.env.NODE_ENV !== "production",
      },
    }),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer({
              root: path.resolve(import.meta.dirname, ".."),
            }),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
    },
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist"),
    emptyOutDir: true,
  },
  server: port
    ? {
        port,
        host: "0.0.0.0",
        allowedHosts: true,
        fs: {
          strict: true,
          deny: ["**/.*"],
        },
      }
    : undefined,
  preview: port
    ? {
        port,
        host: "0.0.0.0",
        allowedHosts: true,
      }
    : undefined,
  };
});
