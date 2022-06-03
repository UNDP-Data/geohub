import adapter from '@sveltejs/adapter-node'
import { resolve } from 'path'
import preprocess from 'svelte-preprocess'

/** @type {import('@sveltejs/kit').Config} */
const config = {
  compilerOptions: {
    enableSourcemap: true,
  },
  preprocess: preprocess({
    sourceMap: true,
  }),
  kit: {
    adapter: adapter({
      out: 'build',
      precompress: false,
      envPrefix: '',
    }),
    vite: {
      ssr: {
        noExternal: [/^@material(?:-extra)?\//],
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
