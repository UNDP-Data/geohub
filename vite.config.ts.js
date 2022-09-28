// vite.config.ts
import { sveltekit } from "@sveltejs/kit/vite";
import { resolve } from "path";
var config = {
  plugins: [sveltekit()],
  ssr: {
    noExternal: [/^@material(?:-extra)?\//, "vega-embed"]
  },
  optimizeDeps: {
    include: ["fast-deep-equal", "clone", "semver", "json-stringify-pretty-compact", "fast-json-stable-stringify"],
    exclude: ["path"]
  },
  resolve: {
    alias: {
      $components: resolve("./src/components"),
      $stores: resolve("./src/stores/index.ts")
    }
  }
};
var vite_config_default = config;
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImltcG9ydCB7IHN2ZWx0ZWtpdCB9IGZyb20gJ0BzdmVsdGVqcy9raXQvdml0ZSdcbmltcG9ydCB7IHJlc29sdmUgfSBmcm9tICdwYXRoJ1xuXG4vKiogQHR5cGUge2ltcG9ydCgndml0ZScpLlVzZXJDb25maWd9ICovXG5jb25zdCBjb25maWcgPSB7XG4gIHBsdWdpbnM6IFtzdmVsdGVraXQoKV0sXG4gIHNzcjoge1xuICAgIG5vRXh0ZXJuYWw6IFsvXkBtYXRlcmlhbCg/Oi1leHRyYSk/XFwvLywgJ3ZlZ2EtZW1iZWQnXSxcbiAgfSxcbiAgb3B0aW1pemVEZXBzOiB7XG4gICAgaW5jbHVkZTogWydmYXN0LWRlZXAtZXF1YWwnLCAnY2xvbmUnLCAnc2VtdmVyJywgJ2pzb24tc3RyaW5naWZ5LXByZXR0eS1jb21wYWN0JywgJ2Zhc3QtanNvbi1zdGFibGUtc3RyaW5naWZ5J10sXG4gICAgZXhjbHVkZTogWydwYXRoJ10sXG4gIH0sXG4gIHJlc29sdmU6IHtcbiAgICBhbGlhczoge1xuICAgICAgJGNvbXBvbmVudHM6IHJlc29sdmUoJy4vc3JjL2NvbXBvbmVudHMnKSxcbiAgICAgICRzdG9yZXM6IHJlc29sdmUoJy4vc3JjL3N0b3Jlcy9pbmRleC50cycpLFxuICAgIH0sXG4gIH0sXG59XG5cbmV4cG9ydCBkZWZhdWx0IGNvbmZpZ1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFBO0FBQ0E7QUFHQSxJQUFNLFNBQVM7QUFBQSxFQUNiLFNBQVMsQ0FBQyxVQUFVLENBQUM7QUFBQSxFQUNyQixLQUFLO0FBQUEsSUFDSCxZQUFZLENBQUMsMkJBQTJCLFlBQVk7QUFBQSxFQUN0RDtBQUFBLEVBQ0EsY0FBYztBQUFBLElBQ1osU0FBUyxDQUFDLG1CQUFtQixTQUFTLFVBQVUsaUNBQWlDLDRCQUE0QjtBQUFBLElBQzdHLFNBQVMsQ0FBQyxNQUFNO0FBQUEsRUFDbEI7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQSxNQUNMLGFBQWEsUUFBUSxrQkFBa0I7QUFBQSxNQUN2QyxTQUFTLFFBQVEsdUJBQXVCO0FBQUEsSUFDMUM7QUFBQSxFQUNGO0FBQ0Y7QUFFQSxJQUFPLHNCQUFROyIsCiAgIm5hbWVzIjogW10KfQo=
