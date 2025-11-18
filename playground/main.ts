import { createApp } from 'vue'
import App from './App.vue'
import { TimeSchedulePlugin } from '../src/index.ts'
createApp(App).use(TimeSchedulePlugin).mount('#app')
