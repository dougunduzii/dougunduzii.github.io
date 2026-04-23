// vite.config.js
import { defineConfig } from "file:///E:/desktop/blog/node_modules/vite/dist/node/index.js";
import vue from "file:///E:/desktop/blog/node_modules/@vitejs/plugin-vue/dist/index.mjs";
var vite_config_default = defineConfig({
  plugins: [vue()],
  base: "/",
  resolve: {
    alias: {
      "@": "/src"
    }
  },
  server: {
    port: 3e3,
    open: true
  },
  build: {
    outDir: "dist",
    assetsDir: "assets",
    sourcemap: false,
    minify: "terser",
    chunkSizeWarningLimit: 1e3,
    rollupOptions: {
      output: {
        manualChunks: {
          "vue-vendor": ["vue", "vue-router"],
          "markdown-vendor": ["marked"],
          "highlight-vendor": ["highlight.js"]
        }
      }
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJFOlxcXFxkZXNrdG9wXFxcXGJsb2dcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkU6XFxcXGRlc2t0b3BcXFxcYmxvZ1xcXFx2aXRlLmNvbmZpZy5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRTovZGVza3RvcC9ibG9nL3ZpdGUuY29uZmlnLmpzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSdcclxuaW1wb3J0IHZ1ZSBmcm9tICdAdml0ZWpzL3BsdWdpbi12dWUnXHJcblxyXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xyXG4gIHBsdWdpbnM6IFt2dWUoKV0sXHJcbiAgYmFzZTogJy8nLFxyXG4gIHJlc29sdmU6IHtcclxuICAgIGFsaWFzOiB7XHJcbiAgICAgICdAJzogJy9zcmMnXHJcbiAgICB9XHJcbiAgfSxcclxuICBzZXJ2ZXI6IHtcclxuICAgIHBvcnQ6IDMwMDAsXHJcbiAgICBvcGVuOiB0cnVlXHJcbiAgfSxcclxuICBidWlsZDoge1xyXG4gICAgb3V0RGlyOiAnZGlzdCcsXHJcbiAgICBhc3NldHNEaXI6ICdhc3NldHMnLFxyXG4gICAgc291cmNlbWFwOiBmYWxzZSxcclxuICAgIG1pbmlmeTogJ3RlcnNlcicsXHJcbiAgICBjaHVua1NpemVXYXJuaW5nTGltaXQ6IDEwMDAsXHJcbiAgICByb2xsdXBPcHRpb25zOiB7XHJcbiAgICAgIG91dHB1dDoge1xyXG4gICAgICAgIG1hbnVhbENodW5rczoge1xyXG4gICAgICAgICAgJ3Z1ZS12ZW5kb3InOiBbJ3Z1ZScsICd2dWUtcm91dGVyJ10sXHJcbiAgICAgICAgICAnbWFya2Rvd24tdmVuZG9yJzogWydtYXJrZWQnXSxcclxuICAgICAgICAgICdoaWdobGlnaHQtdmVuZG9yJzogWydoaWdobGlnaHQuanMnXVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxufSlcclxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFxTyxTQUFTLG9CQUFvQjtBQUNsUSxPQUFPLFNBQVM7QUFFaEIsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsU0FBUyxDQUFDLElBQUksQ0FBQztBQUFBLEVBQ2YsTUFBTTtBQUFBLEVBQ04sU0FBUztBQUFBLElBQ1AsT0FBTztBQUFBLE1BQ0wsS0FBSztBQUFBLElBQ1A7QUFBQSxFQUNGO0FBQUEsRUFDQSxRQUFRO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixNQUFNO0FBQUEsRUFDUjtBQUFBLEVBQ0EsT0FBTztBQUFBLElBQ0wsUUFBUTtBQUFBLElBQ1IsV0FBVztBQUFBLElBQ1gsV0FBVztBQUFBLElBQ1gsUUFBUTtBQUFBLElBQ1IsdUJBQXVCO0FBQUEsSUFDdkIsZUFBZTtBQUFBLE1BQ2IsUUFBUTtBQUFBLFFBQ04sY0FBYztBQUFBLFVBQ1osY0FBYyxDQUFDLE9BQU8sWUFBWTtBQUFBLFVBQ2xDLG1CQUFtQixDQUFDLFFBQVE7QUFBQSxVQUM1QixvQkFBb0IsQ0FBQyxjQUFjO0FBQUEsUUFDckM7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
