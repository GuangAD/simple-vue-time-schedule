# simple-vue-time-schedule

A simple, drag-and-drop time schedule selector for Vue 3.

![Simple Vue Time Schedule](https://github.com/GuangAD/simple-vue-time-schedule/blob/main/image/main.png?raw=true)

## Features

- 📅 **Drag-and-drop** time selection
- 🚫 Support for **disabled time ranges**
- 🌍 **Internationalization (i18n)** support
- 🎨 **Customizable theme** via CSS variables
- 📦 **TypeScript** support
- 📱 **Responsive** design

## Installation

```bash
npm install @ggc12319/simple-vue-time-schedule
# or
pnpm add @ggc12319/simple-vue-time-schedule
# or
yarn add @ggc12319/simple-vue-time-schedule
```

## Usage

### Global Registration

```javascript
import { createApp } from 'vue'
import App from './App.vue'
import SimpleTimeSchedule from '@ggc12319/simple-vue-time-schedule'
import '@ggc12319/simple-vue-time-schedule/style.css'

const app = createApp(App)
app.use(SimpleTimeSchedule)
app.mount('#app')
```

### Local Registration

```vue
<script setup>
import { ref } from 'vue'
import { TimeSchedule } from '@ggc12319/simple-vue-time-schedule'
import '@ggc12319/simple-vue-time-schedule/style.css'

const schedule = ref([])
</script>

<template>
  <TimeSchedule v-model="schedule" />
</template>
```

## API

### Props

| Name                 | Type         | Default           | Description                                                                                                                     |
| -------------------- | ------------ | ----------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `modelValue`         | `string[][]` | `[]`              | The selected time ranges. Two-dimensional array where index corresponds to the day (0-6). Example: `[['09:00~12:00'], [], ...]` |
| `disabled`           | `string[][]` | `[]`              | Disabled time ranges. Same format as `modelValue`.                                                                              |
| `labels`             | `string[]`   | `['星期一', ...]` | Labels for the rows (e.g., days of the week).                                                                                   |
| `readonly`           | `boolean`    | `false`           | If `true`, disables interaction.                                                                                                |
| `canDrop`            | `boolean`    | `true`            | Whether drag-and-drop is enabled (currently behaves same as readonly for selection).                                            |
| `canOverlapDisabled` | `boolean`    | `false`           | If `true`, allows selecting time ranges that overlap with disabled areas (removes disabled status).                             |
| `showFooter`         | `boolean`    | `true`            | Whether to show the footer with selected ranges summary.                                                                        |
| `showHeader`         | `boolean`    | `true`            | Whether to show the header with time labels.                                                                                    |
| `showCheckbox`       | `boolean`    | `false`           | Whether to show checkboxes for selecting entire rows.                                                                           |
| `showDateLabel`      | `boolean`    | `true`            | Whether to show the row labels column.                                                                                          |
| `labelWidth`         | `number`     | `75`              | Width of the label column in pixels.                                                                                            |
| `textConfig`         | `object`     | `{}`              | Configuration for text strings (i18n). See below.                                                                               |
| `theme`              | `object`     | `{}`              | Theme configuration object. See below.                                                                                          |

### Events

| Name                | Arguments             | Description                                                             |
| ------------------- | --------------------- | ----------------------------------------------------------------------- |
| `update:modelValue` | `(value: string[][])` | Emitted when selection changes. Used for `v-model`.                     |
| `change`            | `(value: string[][])` | Alias for `update:modelValue`.                                          |
| `error`             | `(message: string)`   | Emitted when an error occurs (e.g., trying to select an invalid range). |

### Text Configuration (`textConfig`)

Default values:

```javascript
{
  am: '00:00 - 12:00',
  pm: '12:00 - 24:00',
  error: '选择的时间有冲突' // 'Time conflict detected'
}
```

### Theme Configuration (`theme`)

You can pass a `theme` prop or provide it globally via plugin options.

```javascript
{
  primaryColor: '#338aff',   // Selected color
  errorColor: '#f70909',     // Error/Overlap color
  disabledColor: '#ddd',     // Disabled color
  hoverBg: '#f0f0f0',        // Hover background
  borderColor: '#ebebeb',    // Border color
  textColor: '#333',         // Main text color
  subtextColor: '#666'       // Secondary text color
}
```

## Customization

### CSS Variables

You can also override styles using CSS variables in your parent component:

```css
.schedule {
  --schedule-primary-color: #338aff;
  --schedule-error-color: #f70909;
  --schedule-disabled-color: #ddd;
  --schedule-hover-bg: #f0f0f0;
  --schedule-border-color: #ebebeb;
  --schedule-text-color: #333;
  --schedule-subtext-color: #666;
}
```

## License

MIT
