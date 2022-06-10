import adapter from '@sveltejs/adapter-node'
import { resolve } from 'path'
import preprocess from 'svelte-preprocess'
import json from '@rollup/plugin-json'

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: preprocess({}),
  kit: {
    adapter: adapter({
      out: 'build',
      precompress: false,
      envPrefix: '',
    }),
    vite: {
      plugins: [json()],
      ssr: {
        noExternal: [/^@material(?:-extra)?\//, 'vega-embed'],
      },
      optimizeDeps: {
        include: ['fast-deep-equal', 'clone', 'semver', 'json-stringify-pretty-compact', 'fast-json-stable-stringify'],
        exclude: ['path']
      },
      test: {
        threads: false,
        globals: true,
        environment: 'jsdom',
        setupFiles: ['./jest-setup.ts'],
        deps: {
          inline: [/@smui/],
        },
      },
      resolve: {
        alias: {
          $components: resolve('./src/components'),
          $stores: resolve('./src/stores/index.ts'),
        },
      },
    },
  },

  onwarn(warning, defaultHandler) {
    const warningCodeToIgnore = ['a11y-missing-content', 'a11y-missing-attribute']
    if (warningCodeToIgnore.includes(warning.code)) return

    defaultHandler(warning)
  },
}

export default config
