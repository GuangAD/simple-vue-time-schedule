import { fileURLToPath, URL } from 'node:url'
import { resolve } from 'node:path'

import { defineConfig, UserConfig } from 'vite'
import vue from '@vitejs/plugin-vue2'
import { baseBuildConfig, getSharedPlugins } from '../vite.base.config'
import DtsPlugin from 'vite-plugin-dts'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), DtsPlugin()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      vue: resolve(__dirname, './node_modules/vue/dist/vue.runtime.esm.js')
    }
  },
  build: {
    ...(baseBuildConfig as UserConfig).build,
    outDir: resolve(__dirname, `../../dist/v2`)
  },
  optimizeDeps: {
    exclude: ['vue-demi', 'vue']
  }
})
