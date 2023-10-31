// vite.config.ts
import { sveltekit } from "file:///home/thuha/Desktop/UNDP/geohub/node_modules/.pnpm/@sveltejs+kit@1.27.0_svelte@4.2.2_vite@4.5.0/node_modules/@sveltejs/kit/src/exports/vite/index.js";
import { defineConfig } from "file:///home/thuha/Desktop/UNDP/geohub/node_modules/.pnpm/vitest@0.33.0_jsdom@22.1.0_sass@1.69.4/node_modules/vitest/dist/config.js";
import { resolve } from "path";
var vite_config_default = defineConfig({
  plugins: [sveltekit()],
  ssr: {
    noExternal: [
      /^@material(?:-extra)?\//,
      "vega-embed",
      "svelte-carousel",
      "simply-reactive",
      "@watergis/svelte-maplibre-menu"
    ]
  },
  resolve: {
    alias: {
      $components: resolve("./src/components"),
      $stores: resolve("./src/stores/index.ts")
    }
  },
  server: {
    fs: {
      // Allow serving files from one level up to the project root
      allow: ["../.."]
    }
  },
  test: {
    include: ["src/**/*.{test,spec}.{js,ts}"],
    threads: false,
    globals: true,
    environment: "jsdom",
    setupFiles: ["./setupTest.ts"],
    coverage: {
      provider: "istanbul",
      reporter: ["text", "json", "html"]
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS90aHVoYS9EZXNrdG9wL1VORFAvZ2VvaHViL3NpdGVzL2dlb2h1YlwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL2hvbWUvdGh1aGEvRGVza3RvcC9VTkRQL2dlb2h1Yi9zaXRlcy9nZW9odWIvdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL2hvbWUvdGh1aGEvRGVza3RvcC9VTkRQL2dlb2h1Yi9zaXRlcy9nZW9odWIvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBzdmVsdGVraXQgfSBmcm9tICdAc3ZlbHRlanMva2l0L3ZpdGUnO1xuaW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZXN0L2NvbmZpZyc7XG5pbXBvcnQgeyByZXNvbHZlIH0gZnJvbSAncGF0aCc7XG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG5cdHBsdWdpbnM6IFtzdmVsdGVraXQoKV0sXG5cdHNzcjoge1xuXHRcdG5vRXh0ZXJuYWw6IFtcblx0XHRcdC9eQG1hdGVyaWFsKD86LWV4dHJhKT9cXC8vLFxuXHRcdFx0J3ZlZ2EtZW1iZWQnLFxuXHRcdFx0J3N2ZWx0ZS1jYXJvdXNlbCcsXG5cdFx0XHQnc2ltcGx5LXJlYWN0aXZlJyxcblx0XHRcdCdAd2F0ZXJnaXMvc3ZlbHRlLW1hcGxpYnJlLW1lbnUnXG5cdFx0XVxuXHR9LFxuXHRyZXNvbHZlOiB7XG5cdFx0YWxpYXM6IHtcblx0XHRcdCRjb21wb25lbnRzOiByZXNvbHZlKCcuL3NyYy9jb21wb25lbnRzJyksXG5cdFx0XHQkc3RvcmVzOiByZXNvbHZlKCcuL3NyYy9zdG9yZXMvaW5kZXgudHMnKVxuXHRcdH1cblx0fSxcblx0c2VydmVyOiB7XG5cdFx0ZnM6IHtcblx0XHRcdC8vIEFsbG93IHNlcnZpbmcgZmlsZXMgZnJvbSBvbmUgbGV2ZWwgdXAgdG8gdGhlIHByb2plY3Qgcm9vdFxuXHRcdFx0YWxsb3c6IFsnLi4vLi4nXVxuXHRcdH1cblx0fSxcblx0dGVzdDoge1xuXHRcdGluY2x1ZGU6IFsnc3JjLyoqLyoue3Rlc3Qsc3BlY30ue2pzLHRzfSddLFxuXHRcdHRocmVhZHM6IGZhbHNlLFxuXHRcdGdsb2JhbHM6IHRydWUsXG5cdFx0ZW52aXJvbm1lbnQ6ICdqc2RvbScsXG5cdFx0c2V0dXBGaWxlczogWycuL3NldHVwVGVzdC50cyddLFxuXHRcdGNvdmVyYWdlOiB7XG5cdFx0XHRwcm92aWRlcjogJ2lzdGFuYnVsJyxcblx0XHRcdHJlcG9ydGVyOiBbJ3RleHQnLCAnanNvbicsICdodG1sJ11cblx0XHR9XG5cdH1cbn0pO1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFzVCxTQUFTLGlCQUFpQjtBQUNoVixTQUFTLG9CQUFvQjtBQUM3QixTQUFTLGVBQWU7QUFFeEIsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDM0IsU0FBUyxDQUFDLFVBQVUsQ0FBQztBQUFBLEVBQ3JCLEtBQUs7QUFBQSxJQUNKLFlBQVk7QUFBQSxNQUNYO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLElBQ0Q7QUFBQSxFQUNEO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDUixPQUFPO0FBQUEsTUFDTixhQUFhLFFBQVEsa0JBQWtCO0FBQUEsTUFDdkMsU0FBUyxRQUFRLHVCQUF1QjtBQUFBLElBQ3pDO0FBQUEsRUFDRDtBQUFBLEVBQ0EsUUFBUTtBQUFBLElBQ1AsSUFBSTtBQUFBO0FBQUEsTUFFSCxPQUFPLENBQUMsT0FBTztBQUFBLElBQ2hCO0FBQUEsRUFDRDtBQUFBLEVBQ0EsTUFBTTtBQUFBLElBQ0wsU0FBUyxDQUFDLDhCQUE4QjtBQUFBLElBQ3hDLFNBQVM7QUFBQSxJQUNULFNBQVM7QUFBQSxJQUNULGFBQWE7QUFBQSxJQUNiLFlBQVksQ0FBQyxnQkFBZ0I7QUFBQSxJQUM3QixVQUFVO0FBQUEsTUFDVCxVQUFVO0FBQUEsTUFDVixVQUFVLENBQUMsUUFBUSxRQUFRLE1BQU07QUFBQSxJQUNsQztBQUFBLEVBQ0Q7QUFDRCxDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
