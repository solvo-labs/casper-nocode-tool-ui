// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import wasm from "vite-plugin-wasm";
import { NodeGlobalsPolyfillPlugin } from "@esbuild-plugins/node-globals-polyfill";

// https://vitejs.dev/config/
export default defineConfig(({ command }) => {
  const config = {
    plugins: [
      react(),
      wasm(),
      NodeGlobalsPolyfillPlugin({
        buffer: true,
      }),
    ],
    base: "/",
  };

  if (command !== "serve") {
  }

  return config;
});
