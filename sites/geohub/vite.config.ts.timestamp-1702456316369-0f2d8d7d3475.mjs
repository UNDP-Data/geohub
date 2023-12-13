// vite.config.ts
import { sveltekit } from "file:///Users/j_igarashi/Documents/git/UNDP-Data/geohub/node_modules/.pnpm/@sveltejs+kit@1.27.7_svelte@4.2.8_vite@4.5.1/node_modules/@sveltejs/kit/src/exports/vite/index.js";
import { defineConfig } from "file:///Users/j_igarashi/Documents/git/UNDP-Data/geohub/node_modules/.pnpm/vitest@0.33.0_jsdom@23.0.1_sass@1.69.5/node_modules/vitest/dist/config.js";
import { resolve } from "path";
var vite_config_default = defineConfig({
  plugins: [sveltekit()],
  ssr: {
    noExternal: [/^@material(?:-extra)?\//, "vega-embed", "svelte-carousel", "simply-reactive"]
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMval9pZ2FyYXNoaS9Eb2N1bWVudHMvZ2l0L1VORFAtRGF0YS9nZW9odWIvc2l0ZXMvZ2VvaHViXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvVXNlcnMval9pZ2FyYXNoaS9Eb2N1bWVudHMvZ2l0L1VORFAtRGF0YS9nZW9odWIvc2l0ZXMvZ2VvaHViL3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9Vc2Vycy9qX2lnYXJhc2hpL0RvY3VtZW50cy9naXQvVU5EUC1EYXRhL2dlb2h1Yi9zaXRlcy9nZW9odWIvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBzdmVsdGVraXQgfSBmcm9tICdAc3ZlbHRlanMva2l0L3ZpdGUnO1xuaW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZXN0L2NvbmZpZyc7XG5pbXBvcnQgeyByZXNvbHZlIH0gZnJvbSAncGF0aCc7XG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG5cdHBsdWdpbnM6IFtzdmVsdGVraXQoKV0sXG5cdHNzcjoge1xuXHRcdG5vRXh0ZXJuYWw6IFsvXkBtYXRlcmlhbCg/Oi1leHRyYSk/XFwvLywgJ3ZlZ2EtZW1iZWQnLCAnc3ZlbHRlLWNhcm91c2VsJywgJ3NpbXBseS1yZWFjdGl2ZSddXG5cdH0sXG5cdHJlc29sdmU6IHtcblx0XHRhbGlhczoge1xuXHRcdFx0JGNvbXBvbmVudHM6IHJlc29sdmUoJy4vc3JjL2NvbXBvbmVudHMnKSxcblx0XHRcdCRzdG9yZXM6IHJlc29sdmUoJy4vc3JjL3N0b3Jlcy9pbmRleC50cycpXG5cdFx0fVxuXHR9LFxuXHRzZXJ2ZXI6IHtcblx0XHRmczoge1xuXHRcdFx0Ly8gQWxsb3cgc2VydmluZyBmaWxlcyBmcm9tIG9uZSBsZXZlbCB1cCB0byB0aGUgcHJvamVjdCByb290XG5cdFx0XHRhbGxvdzogWycuLi8uLiddXG5cdFx0fVxuXHR9LFxuXHR0ZXN0OiB7XG5cdFx0aW5jbHVkZTogWydzcmMvKiovKi57dGVzdCxzcGVjfS57anMsdHN9J10sXG5cdFx0dGhyZWFkczogZmFsc2UsXG5cdFx0Z2xvYmFsczogdHJ1ZSxcblx0XHRlbnZpcm9ubWVudDogJ2pzZG9tJyxcblx0XHRzZXR1cEZpbGVzOiBbJy4vc2V0dXBUZXN0LnRzJ10sXG5cdFx0Y292ZXJhZ2U6IHtcblx0XHRcdHByb3ZpZGVyOiAnaXN0YW5idWwnLFxuXHRcdFx0cmVwb3J0ZXI6IFsndGV4dCcsICdqc29uJywgJ2h0bWwnXVxuXHRcdH1cblx0fVxufSk7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQXlXLFNBQVMsaUJBQWlCO0FBQ25ZLFNBQVMsb0JBQW9CO0FBQzdCLFNBQVMsZUFBZTtBQUV4QixJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMzQixTQUFTLENBQUMsVUFBVSxDQUFDO0FBQUEsRUFDckIsS0FBSztBQUFBLElBQ0osWUFBWSxDQUFDLDJCQUEyQixjQUFjLG1CQUFtQixpQkFBaUI7QUFBQSxFQUMzRjtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ1IsT0FBTztBQUFBLE1BQ04sYUFBYSxRQUFRLGtCQUFrQjtBQUFBLE1BQ3ZDLFNBQVMsUUFBUSx1QkFBdUI7QUFBQSxJQUN6QztBQUFBLEVBQ0Q7QUFBQSxFQUNBLFFBQVE7QUFBQSxJQUNQLElBQUk7QUFBQTtBQUFBLE1BRUgsT0FBTyxDQUFDLE9BQU87QUFBQSxJQUNoQjtBQUFBLEVBQ0Q7QUFBQSxFQUNBLE1BQU07QUFBQSxJQUNMLFNBQVMsQ0FBQyw4QkFBOEI7QUFBQSxJQUN4QyxTQUFTO0FBQUEsSUFDVCxTQUFTO0FBQUEsSUFDVCxhQUFhO0FBQUEsSUFDYixZQUFZLENBQUMsZ0JBQWdCO0FBQUEsSUFDN0IsVUFBVTtBQUFBLE1BQ1QsVUFBVTtBQUFBLE1BQ1YsVUFBVSxDQUFDLFFBQVEsUUFBUSxNQUFNO0FBQUEsSUFDbEM7QUFBQSxFQUNEO0FBQ0QsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
