<template>
  <time-schedule
    :model-value="selected"
    @update:model-value="handleChange"
    @error="handleError"
    :show-checkbox="false"
    :readonly="readonly"
    :show-date-label="false"
    :labels="labels"
    :show-footer="false"
    :show-header="false"
    :disabled="disabled"
    :can-overlap-disabled="canOverlapDisabled"
    :theme="theme"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { PropType } from 'vue'
import TimeSchedule from './TimeSchedule.vue'
import type { ThemeConfig } from './utils'

const props = defineProps({
  modelValue: {
    type: Array as PropType<string[]>,
    default: () => []
  },
  readonly: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Array as PropType<string[]>,
    default: () => []
  },
  theme: {
    type: Object as PropType<ThemeConfig>,
    default: () => ({})
  },
  canOverlapDisabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'change', 'error'])

const selected = computed(() => [props.modelValue])
const disabled = computed(() => [props.disabled])

const labels = ['时间']

function handleChange(newVal: string[][]) {
  emit('update:modelValue', newVal[0])
  emit('change', newVal[0])
}

function handleError(err: string) {
  emit('error', err)
}
</script>
