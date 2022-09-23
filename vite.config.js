import { sveltekit } from '@sveltejs/kit/vite'
import { resolve } from 'path'

/** @type {import('vite').UserConfig} */
const config = {
  plugins: [sveltekit()],
  ssr: {
    noExternal: [/^@material(?:-extra)?\//, 'vega-embed'],
  },
  optimizeDeps: {
    include: ['fast-deep-equal', 'clone', 'semver', 'json-stringify-pretty-compact', 'fast-json-stable-stringify'],
    exclude: ['path'],
  },
  resolve: {
    alias: {
      $components: resolve('./src/components'),
      $stores: resolve('./src/stores/index.ts'),
    },
  },
}

export default config
