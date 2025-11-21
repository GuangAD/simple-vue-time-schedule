<template>
  <div class="playground">
    <h1>Simple Vue Time Schedule Playground</h1>

    <div class="controls">
      <div class="control-group">
        <label>
          <input type="checkbox" v-model="readonly" />
          Readonly
        </label>
        <label>
          <input type="checkbox" v-model="canOverlapDisabled" />
          Can Overlap Disabled
        </label>
        <label>
          <input type="checkbox" v-model="showFooter" />
          Show Footer
        </label>
      </div>

      <div class="control-group">
        <button @click="toggleTheme">Toggle Theme</button>
        <button @click="reset">Reset</button>
      </div>
    </div>

    <div class="section">
      <h2>Main Component</h2>
      <TimeSchedule
        v-model="schedule"
        :disabled="disabledRanges"
        :readonly="readonly"
        :can-overlap-disabled="canOverlapDisabled"
        :show-footer="showFooter"
        :labels="labels"
        :theme="currentTheme"
        @error="handleError"
        @change="handleChange"
      />
    </div>

    <div class="section">
      <h2>Single Line Component</h2>
      <TimeScheduleAlone
        v-model="singleSchedule"
        :disabled="disabledRanges[0]"
        :readonly="readonly"
        :can-overlap-disabled="canOverlapDisabled"
        :theme="currentTheme"
        @error="handleError"
      />
    </div>

    <div class="logs">
      <h3>Logs</h3>
      <div class="log-container">
        <div v-for="(log, index) in logs" :key="index" class="log-item">
          {{ log }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const schedule = ref<string[][]>([])
const singleSchedule = ref<string[]>([])
const readonly = ref(false)
const canOverlapDisabled = ref(false)
const showFooter = ref(true)
const isDarkTheme = ref(false)
const logs = ref<string[]>([])

const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const disabledRanges = ref([
  ['00:00~02:00', '12:00~13:00'], // Mon
  [], // Tue
  ['09:00~18:00'], // Wed (Full work day disabled)
  [],
  [],
  [],
  ['00:00~24:00'] // Sun (Full day disabled)
])

const currentTheme = computed(() => {
  return isDarkTheme.value
    ? {
        primaryColor: '#bb86fc',
        hoverBg: '#333',
        textColor: '#fff',
        subtextColor: '#aaa',
        borderColor: '#444',
        disabledColor: '#555'
      }
    : {}
})

const toggleTheme = () => {
  isDarkTheme.value = !isDarkTheme.value
  document.body.style.backgroundColor = isDarkTheme.value ? '#121212' : '#fff'
  document.body.style.color = isDarkTheme.value ? '#fff' : '#333'
}

const handleError = (msg: string) => {
  logs.value.unshift(`[Error] ${msg}`)
}

const handleChange = (val: string[][]) => {
  logs.value.unshift(`[Change] Value updated`)
}

const reset = () => {
  schedule.value = []
  singleSchedule.value = []
  logs.value = []
}
</script>

<style>
.playground {
  font-family: sans-serif;
  padding: 20px;
  max-width: 1000px;
  margin: 0 auto;
}

.controls {
  margin-bottom: 20px;
  padding: 15px;
  background: #f5f5f5;
  border-radius: 8px;
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.control-group {
  display: flex;
  gap: 15px;
  align-items: center;
}

.section {
  margin-bottom: 40px;
}

.logs {
  margin-top: 20px;
  border-top: 1px solid #ccc;
  padding-top: 10px;
}

.log-container {
  max-height: 200px;
  overflow-y: auto;
  background: #f0f0f0;
  padding: 10px;
  border-radius: 4px;
  font-family: monospace;
}

.log-item {
  margin-bottom: 5px;
  border-bottom: 1px solid #ddd;
}
</style>
