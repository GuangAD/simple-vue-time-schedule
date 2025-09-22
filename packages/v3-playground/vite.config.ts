import { fileURLToPath, URL } from 'node:url'
import { resolve } from 'node:path'
import DtsPlugin from 'vite-plugin-dts'

import { defineConfig, UserConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { baseBuildConfig } from '../../vite.base.config'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), DtsPlugin()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      vue: resolve(__dirname, './node_modules/vue/dist/vue.runtime.esm-browser.js')
    }
  },
  ...baseBuildConfig,
  build: {
    ...(baseBuildConfig as UserConfig).build,
    outDir: resolve(__dirname, `../../dist/v3`)
  },
  optimizeDeps: {
    exclude: ['vue-demi', 'vue']
  }
})

// https://vite.dev/config/
