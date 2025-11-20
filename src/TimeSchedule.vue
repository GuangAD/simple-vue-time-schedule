<template>
  <div :class="baseClass" :style="cssVars">
    <div class="schedule-calendar">
      <!-- 拖拽选择时的遮罩层，显示选择区域 -->
      <div v-if="scheduleShow" :class="scheduleClass" :style="scheduleStyle"></div>
      <div class="table-wrap">
        <table class="schedule-calendar-table">
          <thead>
            <tr v-if="showHeader" class="schedule-calendar-time-all">
              <!-- 空白占位列，用于显示周几标签 -->
              <th v-if="showDateLabel" class="schedule-week-td" :style="{ width: labelWidth + 'px' }" rowspan="2"></th>
              <th class="schedule-calendar-time" colspan="24">{{ mergedTextConfig.am }}</th>
              <th class="schedule-calendar-time" colspan="24">{{ mergedTextConfig.pm }}</th>
            </tr>
            <tr class="schedule-calendar-time-item">
              <td v-for="(item, index) in dayHour" :key="index" colspan="2">
                {{ item }}
              </td>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(dayLabel, index) in props.dateList" :key="index">
              <td v-if="showDateLabel">
                <div class="schedule-label">
                  <!-- 全选复选框 -->
                  <input
                    type="checkbox"
                    v-if="showCheckbox"
                    :indeterminate="dayStates[index].indeterminate"
                    v-model="dayStates[index].checked"
                    @change="handleDayCheck(index)"
                  />
                  <div class="schedule-label-content">{{ dayLabel }}</div>
                </div>
              </td>
              <td
                v-for="(time, i) in dayHalfHour"
                :key="i"
                class="schedule-calendar-atom-time"
                :class="getScheduleCalendarClass(index, time)"
                :data-day="index"
                :data-time="time"
                @mousemove="($event) => canDrop && rafSetShadow($event)"
                @mousedown="($event) => canDrop && setFirstSource(index, time, $event)"
              ></td>
            </tr>
            <!-- 底部信息栏 -->
            <tr v-if="props.showFooter">
              <td class="schedule-table-tip" :colspan="maxColspan">
                <div v-if="hasSelectedTime" class="schedule-selected-time">
                  <div v-for="(_, index) in timeList" :key="index">
                    <p v-if="timePeriodStrArr[index]">
                      <span class="schedule-tip-text">
                        {{ props.dateList[index] }}
                      </span>
                      <span>{{ timePeriodStrArr[index] }}</span>
                    </p>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, inject } from 'vue'
import { copy } from 'fastest-json-copy'
import type { PropType } from 'vue'
import {
  dayHalfHour,
  dayHour,
  getClockString,
  getDayHalfHourFromRange,
  insertInterval,
  removeInterval,
  isInTimeRange,
  isRangeOverlap,
  THEME_KEY
} from './utils.ts'
import { useDragSelect } from './composables/useDragSelect.ts'

import type { TimeRange, ThemeConfig } from './utils.ts'

interface TextConfig {
  am?: string
  pm?: string
  error?: string
}

const props = defineProps({
  // 时间范围选择器是否可拖拽
  canDrop: { type: Boolean, default: true },
  // 时间范围选择器是否可重叠
  canOverlap: { type: Boolean, default: false },
  modelValue: { type: Array as PropType<string[][]>, default: () => [] },
  showFooter: { type: Boolean, default: true },
  showHeader: { type: Boolean, default: true },
  showCheckbox: { type: Boolean, default: false },
  showDateLabel: { type: Boolean, default: true },
  // 不可选的时间范围
  disabledTimeRange: { type: Array as PropType<string[][]>, default: () => [] },
  dateList: {
    type: Array as PropType<string[]>,
    default: () => ['星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期日']
  },
  labelWidth: { type: Number, default: 75 },
  textConfig: {
    type: Object as PropType<TextConfig>,
    default: () => ({})
  },
  theme: {
    type: Object as PropType<ThemeConfig>,
    default: () => ({})
  }
})

const emit = defineEmits(['update:modelValue', 'error', 'change'])

const defaultTextConfig = {
  am: '00:00 - 12:00',
  pm: '12:00 - 24:00',
  error: '选择的时间有冲突'
}

const mergedTextConfig = computed(() => ({ ...defaultTextConfig, ...props.textConfig }))

const globalTheme = inject<ThemeConfig>(THEME_KEY, {})
const defaultTheme: Required<ThemeConfig> = {
  primaryColor: '#338aff',
  errorColor: '#f70909',
  disabledColor: '#ddd',
  hoverBg: '#f0f0f0',
  borderColor: '#ebebeb',
  textColor: '#333',
  subtextColor: '#666'
}

const mergedTheme = computed(() => ({
  ...defaultTheme,
  ...globalTheme,
  ...props.theme
}))

const cssVars = computed(() => ({
  '--schedule-primary-color': mergedTheme.value.primaryColor,
  '--schedule-error-color': mergedTheme.value.errorColor,
  '--schedule-disabled-color': mergedTheme.value.disabledColor,
  '--schedule-hover-bg': mergedTheme.value.hoverBg,
  '--schedule-border-color': mergedTheme.value.borderColor,
  '--schedule-text-color': mergedTheme.value.textColor,
  '--schedule-subtext-color': mergedTheme.value.subtextColor
}))

// 选中的时间范围
const timeList = ref<TimeRange[][]>([])
// 选中的时间范围字符串数组
const timePeriodStrArr = ref<string[]>([])
// 不可选的时间范围索引数组
const disabledTimeRangeList = computed(() => {
  return generateTimeRangeIndexArray(props.disabledTimeRange)
})
// 当前日期是否全选
const dayStates = computed(() => {
  return timeList.value.map((dayTimes) => {
    const len = dayTimes ? dayTimes.length : 0
    if (len === 1 && dayTimes[0][0] === 0 && dayTimes[0][1] === 47) {
      return { checked: true, indeterminate: false }
    } else if (len === 0) {
      return { checked: false, indeterminate: false }
    }
    return { checked: false, indeterminate: true }
  })
})

const maxColspan = computed<number>(() => (props.showDateLabel ? 49 : 48))

watch(
  () => props.dateList,
  (newVal) => {
    const length = newVal.length
    timePeriodStrArr.value = Array.from({ length }, () => '')
  },
  {
    immediate: true
  }
)

// 是否有选中的时间范围
const hasSelectedTime = computed(() => {
  return timeList.value.some((ele) => ele && ele.length >= 1)
})

const baseClass = computed(() => {
  const classArr = ['schedule']
  if (props.showCheckbox) {
    classArr.push('schedule-show-checkbox')
  }
  return classArr
})

watch(
  () => props.modelValue,
  (newVal) => {
    const result = generateTimeRangeIndexArray(newVal)
    updateValue(result, { emitError: true, skipCopy: false })
  },
  { immediate: true, deep: true }
)

function isDayTimeDisabled(day: number, time: number) {
  return disabledTimeRangeList.value[day]?.some((range) => isInTimeRange(time, range)) || false
}

function getScheduleCalendarClass(index: number, time: number) {
  const isSelect = selectedJudgement(index, time)
  const isDisabled = isDayTimeDisabled(index, time)

  const isOverlap = isSelect && isDisabled

  const ret = []
  if (isOverlap) {
    ret.push('schedule-calendar-overlap')
  } else if (isSelect) {
    ret.push('schedule-calendar-selected')
  } else if (isDisabled) {
    ret.push('schedule-calendar-disabled')
  }
  return ret
}

function isEqualValue(arr1: TimeRange[][], arr2: TimeRange[][]) {
  if (arr1.length !== arr2.length) {
    return false
  }
  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i].length !== arr2[i].length) {
      return false
    }
    for (let j = 0; j < arr1[i].length; j++) {
      const [start1, end1] = arr1[i][j]
      const [start2, end2] = arr2[i][j]
      if (start1 !== start2 || end1 !== end2) {
        return false
      }
    }
  }
  return true
}

function updateValue(newValue: TimeRange[][], options = { emitError: false, skipCopy: false }) {
  const newClonedValue: TimeRange[][] = options.skipCopy ? newValue : copy(newValue)

  let isError = false

  for (let i = 0; i < newClonedValue.length; i++) {
    if (newClonedValue[i]) {
      const disabledTimeRange = disabledTimeRangeList.value[i]
      if (!disabledTimeRange) {
        continue
      }
      for (const range of disabledTimeRange) {
        const isOverlap = newClonedValue[i].some((item) => isRangeOverlap(item, range))
        if (isOverlap) {
          if (!props.canOverlap) {
            newClonedValue[i] = removeInterval(newClonedValue[i], range)
          }
          isError = true
        }
      }
    }
  }
  if (isError && options.emitError) {
    emit('error', mergedTextConfig.value.error)
  }
  if (isEqualValue(newClonedValue, timeList.value)) {
    effectTimeListChange()
  } else {
    timeList.value = newClonedValue
    effectTimeListChange()

    doEmit()
  }
}

function effectTimeListChange() {
  for (let i = 0; i < timeList.value.length; i++) {
    transformTimeArrToString(timeList.value[i], i)
  }
}

function generateTimeRangeIndexArray(list: string[][]) {
  if (!list || !Array.isArray(list)) {
    return []
  }

  const result: TimeRange[][] = Array.from({ length: props.dateList.length }, () => [] as TimeRange[])

  list.forEach((dayRanges, dayIndex) => {
    if (!Array.isArray(dayRanges) || dayIndex >= props.dateList.length) {
      return
    }

    dayRanges.forEach((timeRange) => {
      const halfHourIds = getDayHalfHourFromRange(timeRange)
      if (halfHourIds.length !== 0) {
        result[dayIndex] = insertInterval(result[dayIndex], halfHourIds)
      }
    })
  })
  return result
}

function convertToTimeRange() {
  return timePeriodStrArr.value.map((item) => item.split('、').filter((item) => !!item))
}

function doEmit() {
  const timeRange = convertToTimeRange()
  emit('update:modelValue', timeRange)
  emit('change', timeRange)
}

function selectedJudgement(index: number, item: number) {
  const dayTimes = timeList.value[index]
  return dayTimes && dayTimes.some((range) => isInTimeRange(item, range))
}

function handleDayCheck(index: number) {
  const copyValue: TimeRange[][] = copy(timeList.value)

  if (dayStates.value[index].checked) {
    copyValue[index] = [[0, 47]]
  } else {
    copyValue[index] = []
  }
  updateValue(copyValue)
}
/**
 * @description 将时间范围数组转换为时间范围字符串
 * @param timeArr 所有的时间范围数组
 * @param targetTimePeriodStrArrIndex 目标时间范围字符串数组索引
 * @returns 时间范围字符串
 */
function transformTimeArrToString(timeArr: TimeRange[], targetTimePeriodStrArrIndex: number) {
  if (!timeArr || timeArr.length === 0) {
    timePeriodStrArr.value[targetTimePeriodStrArrIndex] = ''
    return
  }
  const rangeArr = timeArr
  const resStr = rangeArr
    .map((range) => {
      let endDayStr
      const startTimeStr = getClockString(range[0], 'start')
      if (range.length === 1) {
        endDayStr = getClockString(range[0], 'end')
      } else {
        endDayStr = getClockString(range[1]!, 'end')
      }
      return [startTimeStr, endDayStr].join('~')
    })
    .join('、')
  timePeriodStrArr.value[targetTimePeriodStrArrIndex] = resStr
}

function updateSelectedValue({
  startTime,
  startDay,
  endTime,
  endDay,
  isAdd
}: {
  startTime: number
  startDay: number
  endTime: number
  endDay: number
  isAdd: boolean
}) {
  const copyValue: TimeRange[][] = copy(timeList.value)
  for (let i = startDay; i <= endDay; i++) {
    const changeRange: TimeRange = [startTime, endTime]
    if (isAdd) {
      copyValue[i] = insertInterval(copyValue[i], changeRange)
    } else {
      copyValue[i] = removeInterval(copyValue[i], changeRange)
    }
  }
  updateValue(copyValue, { skipCopy: true, emitError: false })
}

const { scheduleShow, scheduleStyle, scheduleClass, setFirstSource, rafSetShadow, scheduleEnd } = useDragSelect(
  timeList,
  updateSelectedValue
)

onMounted(() => {
  if (props.canDrop) {
    document.addEventListener('mouseup', scheduleEnd)
    document.addEventListener('wheel', scheduleEnd, { passive: true })
  }
})

onUnmounted(() => {
  document.removeEventListener('mouseup', scheduleEnd)
  document.removeEventListener('wheel', scheduleEnd)
})
</script>
<style scoped>
.schedule {
  --schedule-primary-color: #338aff;
  --schedule-error-color: #f70909;
  --schedule-disabled-color: #ddd;
  --schedule-hover-bg: #f0f0f0;
  --schedule-border-color: #ebebeb;
  --schedule-text-color: #333;
  --schedule-subtext-color: #666;

  min-width: 700px;
}

.schedule table {
  border-left: none;
  border-style: hidden;
  table-layout: fixed;
  width: 100%;
}

.schedule .table-wrap {
  margin: 0 auto;
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid var(--schedule-border-color);
}

.schedule td,
.schedule th {
  padding: 0;
}

.schedule-header {
  border: 1px solid var(--schedule-border-color);
  border-bottom: none;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 38px;
  padding: 0 12px;
  font-size: 12px;
  background-color: transparent;
}

.schedule-rang {
  background: var(--schedule-primary-color);
  width: 0;
  height: 0;
  position: fixed;
  z-index: 2;
  top: 0;
  left: 0;
  pointer-events: none;
  transition: all 1ms ease;
}

.schedule-week-td {
  padding: 20px 0;
}

.schedule-calendar {
  user-select: none;
  position: relative;
  display: inline-block;
}

.schedule-calendar-time {
  font-weight: 400;
}

.schedule-calendar-time-all {
  height: 39px;
}

.schedule-calendar-time-item {
  height: 31px;
}

.schedule-calendar-atom-time:hover {
  background: var(--schedule-hover-bg);
}

.schedule-calendar .schedule-calendar-disabled {
  background: var(--schedule-disabled-color);
  cursor: not-allowed;
}

.schedule-calendar .schedule-calendar-selected,
.schedule-calendar .schedule-calendar-selected:hover {
  background: var(--schedule-primary-color);
}

.schedule-calendar .schedule-calendar-overlap,
.schedule-calendar .schedule-calendar-overlap:hover {
  background: var(--schedule-error-color);
}

.schedule-calendar-table {
  border-collapse: separate;
  border-radius: 4px;
}

.schedule-calendar-table tr td,
.schedule-calendar-table tr th {
  border-left: none;
  border-top: none;
  border-bottom: 1px solid;
  border-bottom-color: var(--schedule-border-color);
  border-right: 1px solid;
  border-right-color: var(--schedule-border-color);
  font-size: 14px;
  text-align: center;
  min-width: 11px;
  line-height: 1.8em;
  transition: background 0.2s ease;
  color: var(--schedule-text-color);
  background: 0 0;
}

.schedule-calendar-table tr td:last-child,
.schedule-calendar-table tr th:last-child {
  border-right: none;
}

.schedule-calendar-table tbody tr {
  height: 30px;
}

.schedule-calendar-table tbody tr:last-child td {
  border-bottom: none;
}

.schedule-calendar-table .schedule-table-tip {
  line-height: 2.4em;
  padding: 12px 12px 0 19px;
}

.schedule-tip-text {
  color: var(--schedule-text-color);
  margin-right: 8px;
}

.schedule-selected-time {
  text-align: left;
  line-height: 2.4em;
}

.schedule-selected-time .schedule-tip-text {
  min-width: 60px;
}

.schedule-selected-time div:last-child {
  margin-bottom: 6px;
}

.schedule-selected-time p {
  word-break: break-all;
  margin: 0 0 8px;
  font-size: 14px;
  line-height: 22px;
  display: flex;
  color: var(--schedule-subtext-color);
}

.schedule-show-checkbox .schedule-label {
  text-align: left;
  display: flex;
}

.schedule-show-checkbox .schedule-label .checkbox {
  padding-left: 5px;
}

.schedule-show-checkbox .schedule-label-content {
  padding-left: 5px;
  align-items: center;
}
</style>
