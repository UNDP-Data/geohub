import adapter from '@sveltejs/adapter-node'
import { resolve } from "path";
import preprocess from 'svelte-preprocess'

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: preprocess({}),

  kit: {
    adapter: adapter({
      out: 'build',
      precompress: false,
      envPrefix: ''
    }),
    vite: {
      ssr: {
        noExternal: [/^@material(?:-extra)?\//],
      },
      test: {
        threads: false,
        environment: "jsdom",
        deps: {
          inline: [/@smui/]
        },
      },
      resolve: {
				alias: {
          $components: resolve('./src/components'),
          $stores: resolve('./src/stores/index.ts'),
				}
			},
    }
  },

  onwarn(warning, defaultHandler) {
    const warningCodeToIgnore = ['a11y-missing-content', 'a11y-missing-attribute']
    if (warningCodeToIgnore.includes(warning.code)) return;

    defaultHandler(warning);
  }
}

export default config
