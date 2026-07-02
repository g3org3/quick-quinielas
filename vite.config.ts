import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import { TanStackRouterVite } from "@tanstack/router-vite-plugin";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // @ts-expect-error not sure why ts errors
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react(), TanStackRouterVite()],
    resolve: {
      alias: {
        "@": "/src",
      },
    },
    build: {
      sourcemap: true,
    },
    server: {
      proxy: {
        "/.netlify": {
          target: "http://localhost:9999",
          changeOrigin: true,
        },
        "/ingest/static": {
          target: "https://eu-assets.i.posthog.com",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/ingest/, ""),
        },
        "/ingest/array": {
          target: "https://eu-assets.i.posthog.com",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/ingest/, ""),
        },
        "/ingest": {
          target: env.VITE_PUBLIC_POSTHOG_HOST || "https://eu.i.posthog.com",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/ingest/, ""),
        },
      },
    },
  };
});
