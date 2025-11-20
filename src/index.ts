import type { App } from 'vue'
import TimeSchedule from './TimeSchedule.vue'
import TimeScheduleAlone from './TimeScheduleAlone.vue'
import { THEME_KEY } from './utils.ts'
import type { ThemeConfig } from './utils.ts'

const TimeSchedulePlugin = {
  install(app: App, options?: { theme?: ThemeConfig }) {
    app.component('TimeSchedule', TimeSchedule)
    app.component('TimeScheduleAlone', TimeScheduleAlone)
    if (options?.theme) {
      app.provide(THEME_KEY, options.theme)
    }
  }
}
export { TimeSchedule, TimeScheduleAlone, TimeSchedulePlugin }
