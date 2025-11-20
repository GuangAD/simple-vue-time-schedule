<!-- eslint-disable vue/no-deprecated-v-bind-sync -->
<template>
  <time-schedule
    :model-value="selected"
    @update:model-value="handleChange"
    @error="handleError"
    :show-checkbox="false"
    :can-drop="canDrop"
    :can-overlap="canOverlap"
    :show-date-label="false"
    :date-list="dateList"
    :show-footer="false"
    :show-header="false"
    :disabled-time-range="_disabledTimeRange"
    :theme="theme"
  />
</template>

<script setup lang="ts">
import { computed, defineProps } from 'vue'
import type { PropType } from 'vue'
import TimeSchedule from './TimeSchedule.vue'
import type { ThemeConfig } from './utils.ts'

const props = defineProps({
  modelValue: {
    type: Array as PropType<string[]>,
    default: () => []
  },
  canDrop: {
    type: Boolean,
    default: true
  },
  canOverlap: { type: Boolean, default: false },
  disabledTimeRange: {
    type: Array as PropType<string[]>,
    default: () => []
  },
  theme: {
    type: Object as PropType<ThemeConfig>,
    default: () => ({})
  }
})

const emit = defineEmits(['update:modelValue', 'change', 'error'])

const selected = computed(() => [props.modelValue])
const _disabledTimeRange = computed(() => [props.disabledTimeRange])

const dateList = ['时间']

function handleChange(nelValue: string[][]) {
  emit('update:modelValue', nelValue[0])
  emit('change', nelValue[0])
}

function handleError(err: string) {
  emit('error', err)
}
</script>
