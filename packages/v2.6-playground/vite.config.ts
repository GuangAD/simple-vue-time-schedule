import { resolve } from 'path'
import { defineConfig } from 'vite'
import { createVuePlugin as vue2 } from 'vite-plugin-vue2'
import ScriptSetup from 'unplugin-vue2-script-setup/vite'
import { baseBuildConfig } from '../../vite.base.config.ts'

export const viteVue2Config = defineConfig({
  plugins: [vue2(), ScriptSetup({})],
  server: {
    port: 2000
  },
  ...baseBuildConfig,
  resolve: {
    alias: {
      vue: resolve(__dirname, './node_modules/vue/dist/vue.runtime.esm.js')
    }
  },
  build: {
    ...(baseBuildConfig as UserConfig).build,
    outDir: resolve(__dirname, '../../dist/v2')
  }
})

export default viteVue2Config
