import type { App } from 'vue'
import TimeSchedule from './TimeSchedule.vue'
import TimeScheduleAlone from './TimeScheduleAlone.vue'
const TimeSchedulePlugin = {
  install(app: App) {
    app.component('TimeSchedule', TimeSchedule)
    app.component('TimeScheduleAlone', TimeScheduleAlone)
  }
}
export { TimeSchedule, TimeScheduleAlone, TimeSchedulePlugin }
