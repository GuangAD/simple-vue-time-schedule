import { ref } from 'vue'
import type { CSSProperties, Ref } from 'vue'
import { isInTimeRange } from '../utils'
import type { TimeRange } from '../utils'

export function useDragSelect(
  timeList: Ref<TimeRange[][]>,
  updateSelectedValue: (params: {
    startTime: number
    startDay: number
    endTime: number
    endDay: number
    isAdd: boolean
  }) => void
) {
  let startTdEl: HTMLElement | null = null
  let startTdElRect: DOMRect | null = null
  let endTdEl: HTMLElement | null = null
  let start_point: {
    x: number
    y: number
  } | null = null
  let isAdd = false
  const scheduleShow = ref(false)
  const scheduleStyle = ref<CSSProperties>({})
  const scheduleClass = ref({
    'no-transition': false,
    'schedule-rang': true
  })

  let curTdEl: HTMLElement | null = null

  function getClientPosition(ele: HTMLElement, outer = false) {
    const clientRect = ele.getBoundingClientRect()
    return {
      x: clientRect.left + (outer ? clientRect.width : 0),
      y: clientRect.top + (outer ? clientRect.height : 0)
    }
  }

  function setShadow(e: MouseEvent) {
    curTdEl = e.target as HTMLElement
    if (!startTdEl || !start_point || !startTdElRect) {
      return
    }

    const curPos = getClientPosition(curTdEl, true)
    const currentTdElRect = curTdEl.getBoundingClientRect()

    const distanceX = curPos.x - start_point.x
    const distanceY = curPos.y - start_point.y

    const left = distanceX > 0 ? startTdElRect!.left : currentTdElRect.left
    const top = distanceY > 0 ? startTdElRect!.top : currentTdElRect.top

    const width =
      distanceX > 0 ? currentTdElRect.right - startTdElRect!.left : currentTdElRect.left - startTdElRect!.right
    const height =
      distanceY > 0 ? currentTdElRect.bottom - startTdElRect!.top : currentTdElRect.top - startTdElRect!.bottom

    scheduleStyle.value = {
      opacity: 0.6,
      top: top + 'px',
      left: left + 'px',
      width: Math.abs(width) + 'px',
      height: Math.abs(height) + 'px'
    }
  }

  let shadowRaf = 0
  let lastMouseEvent: MouseEvent | null = null
  function rafSetShadow(e: MouseEvent) {
    lastMouseEvent = e
    if (shadowRaf) {
      return
    }
    shadowRaf = requestAnimationFrame(() => {
      if (lastMouseEvent) {
        setShadow(lastMouseEvent)
      }
      shadowRaf = 0
      lastMouseEvent = null
    })
  }

  // 鼠标按下记录按下的dom
  function setFirstSource(week: number, time: number, e: MouseEvent) {
    const dayTimes = timeList.value[week]
    isAdd = dayTimes ? !dayTimes.some((range) => isInTimeRange(time, range)) : true

    if (e.button !== 0) {
      return
    }
    startTdEl = e.target as HTMLElement
    startTdElRect = startTdEl.getBoundingClientRect()
    start_point = getClientPosition(e.target as HTMLElement)
    scheduleShow.value = true
    scheduleStyle.value = {
      left: start_point.x + 'px',
      top: start_point.y + 'px',
      width: 0,
      height: 0,
      opacity: 0.6
    }
    scheduleClass.value['no-transition'] = true
  }

  function scheduleEnd() {
    if (start_point) {
      endTdEl = curTdEl
      scheduleClass.value['no-transition'] = false
      highlightScheduleArea(startTdEl, endTdEl)
      start_point = null
      startTdEl = null
      startTdElRect = null
      curTdEl = null
    }
  }

  function highlightScheduleArea(startEl: HTMLElement | null, endEl: HTMLElement | null) {
    if (!startEl || !endEl) {
      scheduleStyle.value.opacity = 0
      scheduleShow.value = false
      return
    }
    const startDay = parseInt(startEl.getAttribute('data-day') ?? '0', 10)
    const startTime = parseInt(startEl.getAttribute('data-time') ?? '0', 10)
    const endDay = parseInt(endEl.getAttribute('data-day') ?? '0', 10)
    const endTime = parseInt(endEl.getAttribute('data-time') ?? '0', 10)

    const sDay = Math.min(startDay, endDay)
    const eDay = Math.max(startDay, endDay)
    const sTime = Math.min(startTime, endTime)
    const eTime = Math.max(startTime, endTime)

    scheduleStyle.value.opacity = 0
    scheduleShow.value = false
    updateSelectedValue({
      startTime: sTime,
      startDay: sDay,
      endTime: eTime,
      endDay: eDay,
      isAdd
    })
  }

  return {
    scheduleShow,
    scheduleStyle,
    scheduleClass,
    setFirstSource,
    rafSetShadow,
    scheduleEnd
  }
}
