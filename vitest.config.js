import { defineConfig } from 'vite'
import viteConfig from './vite.config.js'

export default defineConfig({
    optimizeDeps: viteConfig.optimizeDeps,
    test: viteConfig.test,
    resolve: viteConfig.resolve
})