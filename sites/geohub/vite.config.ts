import { sveltekit } from '@sveltejs/kit/vite'
import { resolve } from 'path'
import { UserConfig } from 'vite'

const config: UserConfig = {
  plugins: [sveltekit()],
  ssr: {
    noExternal: [/^@material(?:-extra)?\//, 'vega-embed', 'svelte-carousel', 'simply-reactive'],
  },
  resolve: {
    alias: {
      $components: resolve('./src/components'),
      $stores: resolve('./src/stores/index.ts'),
    },
  },
  optimizeDeps: {
    include: ['lodash.get', 'lodash.isequal', 'lodash.clonedeep'],
  },
}

export default config
