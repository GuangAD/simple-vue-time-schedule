# simple-vue-time-schedule

A simple, drag-and-drop time schedule selector for Vue 3.

## Features

- 📅 Drag-and-drop time selection
- 🚫 Support for disabled time ranges
- 🌍 Internationalization (i18n) support
- 🎨 Customizable theme via CSS variables
- 📦 TypeScript support

## Installation

```bash
npm install simple-vue-time-schedule
# or
pnpm add simple-vue-time-schedule
# or
yarn add simple-vue-time-schedule
```

## Usage

### Global Registration

```javascript
import { createApp } from 'vue'
import App from './App.vue'
import SimpleTimeSchedule from 'simple-vue-time-schedule'
import 'simple-vue-time-schedule/dist/style.css'

const app = createApp(App)
app.use(SimpleTimeSchedule)
app.mount('#app')
```

### Local Registration

```vue
<script setup>
import { ref } from 'vue'
import { TimeSchedule } from 'simple-vue-time-schedule'
import 'simple-vue-time-schedule/dist/style.css'

const schedule = ref([])
</script>

<template>
  <TimeSchedule v-model="schedule" />
</template>
```

## API

### Props

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |

| Name                | Arguments             | Description                                   |
| ------------------- | --------------------- | --------------------------------------------- |
| `update:modelValue` | `(value: string[][])` | Emitted when selection changes.               |
| `change`            | `(value: string[][])` | Alias for `update:modelValue`.                |
| `error`             | `(message: string)`   | Emitted when an error occurs (e.g., overlap). |

## Customization

### Internationalization (i18n)

You can customize the text by passing a `textConfig` object:

```vue
<template>
  <TimeSchedule
    :textConfig="{
      am: '00:00 - 12:00',
      pm: '12:00 - 24:00',
      error: 'Time conflict detected'
    }"
    :dateList="['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']"
  />
</template>
```

### Theming

You can customize the colors using CSS variables:

```css
.schedule {
  --schedule-primary-color: #338aff; /* Selected color */
  --schedule-error-color: #f70909; /* Error/Overlap color */
  --schedule-disabled-color: #ddd; /* Disabled color */
  --schedule-hover-bg: #f0f0f0; /* Hover background */
  --schedule-border-color: #ebebeb; /* Border color */
  --schedule-text-color: #333; /* Main text color */
  --schedule-subtext-color: #666; /* Secondary text color */
}
```

## License

MIT
