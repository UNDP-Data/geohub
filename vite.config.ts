import { sveltekit } from '@sveltejs/kit/vite';
import type { UserConfig } from 'vite';
import { resolve } from 'path'

const config: UserConfig = {
	plugins: [sveltekit()],
	ssr: {
        noExternal: [/^@material(?:-extra)?\//, 'vega-embed'],
      },
      optimizeDeps: {
        include: ['fast-deep-equal', 'clone', 'semver', 'json-stringify-pretty-compact', 'fast-json-stable-stringify'],
        exclude: ['path'],
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
};

export default config;
