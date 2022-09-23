import adapter from '@sveltejs/adapter-node'
import { resolve } from 'path'
import preprocess from 'svelte-preprocess'
// import json from '@rollup/plugin-json'

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: preprocess({}),
  kit: {
    adapter: adapter({
      out: 'build',
      precompress: false,
      envPrefix: '',
    }),
  },

  onwarn(warning, defaultHandler) {
    if (process.env.NODE_ENV === 'production') return
    const warningCodeToIgnore = ['a11y-missing-content', 'a11y-missing-attribute', 'css-unused-selector']
    if (warningCodeToIgnore.includes(warning.code)) return

    defaultHandler(warning)
  },
}

export default config
