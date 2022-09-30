import { sveltekit } from '@sveltejs/kit/vite'
import { resolve } from 'path'
import { UserConfig } from 'vite'

const config: UserConfig = {
  plugins: [sveltekit()],
  ssr: {
    noExternal: [/^@material(?:-extra)?\//, 'vega-embed'],
  },
  resolve: {
    alias: {
      $components: resolve('./src/components'),
      $stores: resolve('./src/stores/index.ts'),
    },
  },
}

export default config
