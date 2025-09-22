// oxlint-disable new-cap
import * as path from 'node:path'
import { defineConfig } from 'vite'

const outputName = 'index'

// https://vitejs.dev/config/
export const baseBuildConfig = defineConfig({
  build: {
    emptyOutDir: false,
    lib: {
      entry: path.resolve(__dirname, 'packages/components/index.ts'),
      formats: ['es', 'cjs', 'umd'],
      name: 'SimpleTimeSchedule',
      fileName: (format) => `${outputName}.${format}.js`,
      cssFileName: `${outputName}`
    },
    rollupOptions: {
      external: ['vue', '@vue/composition-api/dist/vue-composition-api.mjs'],
      output: {
        // 在 UMD 构建模式下为这些外部化的依赖提供一个全局变量
        globals: {
          vue: 'Vue',
          '@vue/composition-api/dist/vue-composition-api.mjs': 'VueCompositionAPI'
        }
      }
    }
  },
  optimizeDeps: {
    exclude: ['vue-demi', 'vue']
  }
})
