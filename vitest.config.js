import { defineConfig } from 'vitest/config'
import { resolve } from 'path'
import { svelte } from '@sveltejs/vite-plugin-svelte'

export default defineConfig({
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  plugins: [svelte({ hot: !process.env.VITEST })],
  test: {
    threads: false,
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./jest-setup.ts'],
    // deps: {
    //   inline: [/@smui/],
    // },
  },
  resolve: {
    alias: {
      $lib: resolve('./src/lib'),
      $components: resolve('./src/components'),
      $stores: resolve('./src/stores/index.ts'),
    },
  },
})
