import { fileURLToPath, URL } from 'node:url'
import { resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'

import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [dts({ rollupTypes: true, tsconfigPath: './tsconfig.app.json' }), vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    emptyOutDir: false,
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es', 'cjs', 'umd'],
      name: 'SimpleTimeSchedule',
      fileName: (format) => `simple-vue-time-schedule.${format}.js`,
      cssFileName: `style`
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        // 在 UMD 构建模式下为这些外部化的依赖提供一个全局变量
        globals: {
          vue: 'Vue'
        }
      }
    }
  },
  optimizeDeps: {
    exclude: ['vue']
  }
})

// https://vite.dev/config/
