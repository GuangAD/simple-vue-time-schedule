import Vue from 'vue'
import App from './App.vue'
import { TimeSchedulePlugin } from 'time-schedule'
// import { TimeSchedulePlugin } from '../../../dist/v2/index.es.js'
// import '../../../dist/v2/index.css'
Vue.use(TimeSchedulePlugin)
new Vue({ render: (h) => h(App) }).$mount('#app')
