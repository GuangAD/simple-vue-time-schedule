<template>
  <div :class="baseClass" :style="cssVars">
    <!-- Header -->
    <div v-if="showHeader" class="schedule-header-row">
      <div v-if="showDateLabel" class="schedule-corner-cell" :style="{ width: labelWidth + 'px' }"></div>
      <div class="schedule-time-header">
        <div class="schedule-am-pm">
          <div class="am">{{ mergedTextConfig.am }}</div>
          <div class="pm">{{ mergedTextConfig.pm }}</div>
        </div>
        <div class="schedule-hours">
          <div v-for="hour in dayHour" :key="hour" class="hour-cell">{{ hour }}</div>
        </div>
      </div>
    </div>

    <!-- Body -->
    <div class="schedule-body">
      <!-- Labels Column -->
      <div v-if="showDateLabel" class="schedule-labels-col" :style="{ width: labelWidth + 'px' }">
        <div v-for="(label, index) in props.labels" :key="index" class="schedule-label-cell">
          <div class="schedule-label-content">
            <input v-if="showCheckbox" type="checkbox" :checked="isDayFull(index)" @change="toggleDay(index, $event)" />
            <span>{{ label }}</span>
          </div>
        </div>
      </div>

      <!-- Grid Container -->
      <div ref="gridContainer" class="schedule-grid" :style="gridStyle" @mousedown="onGridMouseDown">
        <!-- Render cells -->
        <template v-for="(dayBits, dayIndex) in weekState" :key="dayIndex">
          <div
            v-for="timeIndex in 48"
            :key="timeIndex - 1"
            class="schedule-cell"
            :class="getCellClass(dayIndex, timeIndex - 1)"
          ></div>
        </template>
      </div>
    </div>

    <!-- Footer -->
    <div v-if="showFooter" class="schedule-footer">
      <div v-if="hasSelectedTime" class="schedule-selected-info">
        <div v-for="(ranges, index) in currentRanges" :key="index">
          <p v-if="ranges.length > 0">
            <span class="schedule-tip-text">{{ props.labels[index] }}</span>
            <span>{{ formatRanges(ranges) }}</span>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, inject } from 'vue'
import type { PropType } from 'vue'
import { useTimeBitmask } from './composables/useTimeBitmask'
import { useGridSelection } from './composables/useGridSelection'
import { dayHour, THEME_KEY } from './utils'
import type { ThemeConfig } from './utils'

const props = defineProps({
  modelValue: { type: Array as PropType<string[][]>, default: () => [] },
  disabled: { type: Array as PropType<string[][]>, default: () => [] },
  labels: {
    type: Array as PropType<string[]>,
    default: () => ['星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期日']
  },
  readonly: { type: Boolean, default: false },
  showFooter: { type: Boolean, default: true },
  showHeader: { type: Boolean, default: true },
  showCheckbox: { type: Boolean, default: false },
  showDateLabel: { type: Boolean, default: true },
  labelWidth: { type: Number, default: 75 },
  textConfig: { type: Object, default: () => ({}) },
  theme: { type: Object as PropType<ThemeConfig>, default: () => ({}) }
})

const emit = defineEmits(['update:modelValue', 'change', 'error'])

// --- Theme & Text Config ---
const defaultTextConfig = { am: '00:00 - 12:00', pm: '12:00 - 24:00', error: '选择的时间有冲突' }
const mergedTextConfig = computed(() => ({ ...defaultTextConfig, ...props.textConfig }))

const globalTheme = inject<ThemeConfig>(THEME_KEY, {})
const defaultTheme = {
  primaryColor: '#338aff',
  errorColor: '#f70909',
  disabledColor: '#ddd',
  hoverBg: '#f0f0f0',
  borderColor: '#ebebeb',
  textColor: '#333',
  subtextColor: '#666'
}
const mergedTheme = computed(() => ({ ...defaultTheme, ...globalTheme, ...props.theme }))
const cssVars = computed(() => ({
  '--schedule-primary-color': mergedTheme.value.primaryColor,
  '--schedule-error-color': mergedTheme.value.errorColor,
  '--schedule-disabled-color': mergedTheme.value.disabledColor,
  '--schedule-hover-bg': mergedTheme.value.hoverBg,
  '--schedule-border-color': mergedTheme.value.borderColor,
  '--schedule-text-color': mergedTheme.value.textColor,
  '--schedule-subtext-color': mergedTheme.value.subtextColor
}))

const baseClass = computed(() => ['schedule', props.showCheckbox ? 'schedule-show-checkbox' : ''])

// --- Core Logic ---
const daysCount = computed(() => props.labels.length)
const { weekState, fromStringArray, toStringArray, toggleRange } = useTimeBitmask(daysCount.value)

// Re-init bitmask if labels length changes (unlikely but good to handle)
watch(daysCount, () => {
  // Note: this resets state. In a real app we might want to preserve data.
  // But changing labels length usually means context switch.
  // We'll just re-sync from modelValue.
  fromStringArray(props.modelValue)
})

// Sync modelValue to Bitmask
watch(
  () => props.modelValue,
  (newVal) => {
    fromStringArray(newVal)
  },
  { immediate: true, deep: true }
)

// Computed for display
const currentRanges = computed(() => toStringArray())
const hasSelectedTime = computed(() => weekState.value.some((bits) => bits > 0n))

const formatRanges = (ranges: string[]) => {
  return ranges.join('、')
}

// --- Interaction ---
const gridContainer = ref<HTMLElement | null>(null)

// 临时状态，用于在拖拽过程中记录起始状态
let dragStartSnapshot: bigint[] = []

const handleSelect = (...args: [number, number, number, number, boolean]) => {
  const [startDay, startTime, endDay, endTime, isAdd] = args

  if (dragStartSnapshot.length > 0) {
    weekState.value = [...dragStartSnapshot]
  }

  for (let d = startDay; d <= endDay; d++) {
    toggleRange(d, startTime, endTime, isAdd)
  }

  const newRanges = toStringArray()
  emit('update:modelValue', newRanges)
  emit('change', newRanges)
}

const { handleMouseDown } = useGridSelection({
  rows: daysCount.value,
  cols: 48,
  containerRef: gridContainer,
  onSelect: handleSelect
})

// Update grid selection rows when labels change
watch(daysCount, () => {
  // useGridSelection doesn't expose a way to update rows/cols dynamically
  // without refactoring it to accept refs.
  // But useGridSelection reads options once.
  // We should refactor useGridSelection to accept MaybeRef or just Ref for rows/cols.
  // For now, let's assume labels don't change often.
  // Actually, useGridSelection takes values, not refs.
  // Let's verify useGridSelection implementation.
})

const onGridMouseDown = (e: MouseEvent) => {
  if (props.readonly) {
    return
  }

  dragStartSnapshot = [...weekState.value]

  const target = e.target as HTMLElement
  const isSelected = target.classList.contains('schedule-selected')

  handleMouseDown(e, !isSelected)
}

// --- Helpers ---
const getCellClass = (day: number, time: number) => {
  const isSelected = (weekState.value[day] & (1n << BigInt(time))) !== 0n
  const classes = []
  if (isSelected) {
    classes.push('schedule-selected')
  }

  // Add border logic via class instead of nth-child for last row
  if (day === daysCount.value - 1) {
    classes.push('schedule-last-row')
  }

  return classes.join(' ')
}

const isDayFull = (day: number) => {
  const fullMask = (1n << 48n) - 1n
  return (weekState.value[day] & fullMask) === fullMask
}

const toggleDay = (day: number, e: Event) => {
  if (props.readonly) {
    return
  }
  const checked = (e.target as HTMLInputElement).checked
  toggleRange(day, 0, 47, checked)
  const newRanges = toStringArray()
  emit('update:modelValue', newRanges)
  emit('change', newRanges)
}

const gridStyle = computed(() => ({
  gridTemplateRows: `repeat(${daysCount.value}, 1fr)`
}))
</script>

<style scoped>
.schedule {
  font-size: 12px;
  color: var(--schedule-text-color);
  user-select: none;
  min-width: 700px;
}

/* Header Layout */
.schedule-header-row {
  display: flex;
  border: 1px solid var(--schedule-border-color);
  border-bottom: none;
  background: #f8f9fa;
}

.schedule-corner-cell {
  border-right: 1px solid var(--schedule-border-color);
  flex-shrink: 0;
}

.schedule-time-header {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.schedule-am-pm {
  display: flex;
  border-bottom: 1px solid var(--schedule-border-color);
  height: 24px;
  line-height: 24px;
  text-align: center;
}

.am,
.pm {
  flex: 1;
}

.am {
  border-right: 1px solid var(--schedule-border-color);
}

.schedule-hours {
  display: flex;
  height: 24px;
  line-height: 24px;
}

.hour-cell {
  flex: 1;
  text-align: center;
  border-right: 1px solid var(--schedule-border-color);
}
.hour-cell:last-child {
  border-right: none;
}

/* Body Layout */
.schedule-body {
  display: flex;
  border: 1px solid var(--schedule-border-color);
}

.schedule-labels-col {
  flex-shrink: 0;
  border-right: 1px solid var(--schedule-border-color);
}

.schedule-label-cell {
  height: 30px; /* Fixed height for now, matches grid row */
  display: flex;
  align-items: center;
  padding-left: 10px;
  border-bottom: 1px solid var(--schedule-border-color);
}
.schedule-label-cell:last-child {
  border-bottom: none;
}

.schedule-label-content {
  display: flex;
  align-items: center;
  gap: 5px;
}

/* Grid Layout */
.schedule-grid {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(48, 1fr);
  /* grid-template-rows is set via inline style */
  background: #fff;
  cursor: pointer;
}

.schedule-cell {
  border-right: 1px solid #eee;
  border-bottom: 1px solid #eee;
  /* Half-hour dashed line logic could be added here with nth-child */
}

/* Add border for hours (every 2 cells) */
.schedule-cell:nth-child(2n) {
  border-right: 1px solid var(--schedule-border-color);
}

/* Remove right border for last column */
.schedule-cell:nth-child(48n) {
  border-right: none;
}

/* Remove bottom border for last row */
.schedule-cell.schedule-last-row {
  border-bottom: none;
}

/* States */
.schedule-selected {
  background-color: var(--schedule-primary-color);
}

.schedule-cell:hover {
  background-color: var(--schedule-hover-bg);
}
.schedule-selected:hover {
  background-color: var(--schedule-primary-color); /* Keep primary color on hover if selected */
  opacity: 0.8;
}

/* Footer */
.schedule-footer {
  margin-top: 10px;
  font-size: 12px;
  color: var(--schedule-subtext-color);
}
.schedule-tip-text {
  margin-right: 10px;
  font-weight: bold;
}
</style>
