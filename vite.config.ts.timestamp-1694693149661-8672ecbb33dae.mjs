// vite.config.ts
import { defineConfig } from "file:///Users/afarukcali/Desktop/casper/casper-nocode-tool-ui/node_modules/vite/dist/node/index.js";
import react from "file:///Users/afarukcali/Desktop/casper/casper-nocode-tool-ui/node_modules/@vitejs/plugin-react/dist/index.mjs";
import wasm from "file:///Users/afarukcali/Desktop/casper/casper-nocode-tool-ui/node_modules/vite-plugin-wasm/exports/import.mjs";
import { NodeGlobalsPolyfillPlugin } from "file:///Users/afarukcali/Desktop/casper/casper-nocode-tool-ui/node_modules/@esbuild-plugins/node-globals-polyfill/dist/index.js";
var vite_config_default = defineConfig(({ command }) => {
  const config = {
    plugins: [
      react(),
      wasm(),
      NodeGlobalsPolyfillPlugin({
        buffer: true
      })
    ],
    base: "/"
  };
  if (command !== "serve") {
  }
  return config;
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvYWZhcnVrY2FsaS9EZXNrdG9wL2Nhc3Blci9jYXNwZXItbm9jb2RlLXRvb2wtdWlcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9Vc2Vycy9hZmFydWtjYWxpL0Rlc2t0b3AvY2FzcGVyL2Nhc3Blci1ub2NvZGUtdG9vbC11aS92aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vVXNlcnMvYWZhcnVrY2FsaS9EZXNrdG9wL2Nhc3Blci9jYXNwZXItbm9jb2RlLXRvb2wtdWkvdml0ZS5jb25maWcudHNcIjsvLyB2aXRlLmNvbmZpZy5qc1xuaW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVcIjtcbmltcG9ydCByZWFjdCBmcm9tIFwiQHZpdGVqcy9wbHVnaW4tcmVhY3RcIjtcbmltcG9ydCB3YXNtIGZyb20gXCJ2aXRlLXBsdWdpbi13YXNtXCI7XG5pbXBvcnQgeyBOb2RlR2xvYmFsc1BvbHlmaWxsUGx1Z2luIH0gZnJvbSBcIkBlc2J1aWxkLXBsdWdpbnMvbm9kZS1nbG9iYWxzLXBvbHlmaWxsXCI7XG5cbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoKHsgY29tbWFuZCB9KSA9PiB7XG4gIGNvbnN0IGNvbmZpZyA9IHtcbiAgICBwbHVnaW5zOiBbXG4gICAgICByZWFjdCgpLFxuICAgICAgd2FzbSgpLFxuICAgICAgTm9kZUdsb2JhbHNQb2x5ZmlsbFBsdWdpbih7XG4gICAgICAgIGJ1ZmZlcjogdHJ1ZSxcbiAgICAgIH0pLFxuICAgIF0sXG4gICAgYmFzZTogXCIvXCIsXG4gIH07XG5cbiAgaWYgKGNvbW1hbmQgIT09IFwic2VydmVcIikge1xuICB9XG5cbiAgcmV0dXJuIGNvbmZpZztcbn0pO1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUNBLFNBQVMsb0JBQW9CO0FBQzdCLE9BQU8sV0FBVztBQUNsQixPQUFPLFVBQVU7QUFDakIsU0FBUyxpQ0FBaUM7QUFHMUMsSUFBTyxzQkFBUSxhQUFhLENBQUMsRUFBRSxRQUFRLE1BQU07QUFDM0MsUUFBTSxTQUFTO0FBQUEsSUFDYixTQUFTO0FBQUEsTUFDUCxNQUFNO0FBQUEsTUFDTixLQUFLO0FBQUEsTUFDTCwwQkFBMEI7QUFBQSxRQUN4QixRQUFRO0FBQUEsTUFDVixDQUFDO0FBQUEsSUFDSDtBQUFBLElBQ0EsTUFBTTtBQUFBLEVBQ1I7QUFFQSxNQUFJLFlBQVksU0FBUztBQUFBLEVBQ3pCO0FBRUEsU0FBTztBQUNULENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
