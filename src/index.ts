import TimeSchedule from './TimeSchedule.vue'
import TimeScheduleAlone from './TimeScheduleAlone.vue'
const TimeSchedulePlugin = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  install(app: any) {
    app.component('TimeSchedule', TimeSchedule)
    app.component('TimeScheduleAlone', TimeScheduleAlone)
  }
}
export { TimeSchedule, TimeScheduleAlone, TimeSchedulePlugin }
