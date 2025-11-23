import { createApp } from 'vue'
import App from './App.vue'

import { TimeSchedulePlugin } from '@ggc12319/simple-vue-time-schedule'
import '@ggc12319/simple-vue-time-schedule/style.css'

createApp(App).use(TimeSchedulePlugin).mount('#app')
