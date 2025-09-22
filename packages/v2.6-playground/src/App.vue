<!-- eslint-disable vue/no-deprecated-v-bind-sync -->
<template>
  <div id="app">
    <!--  :show-checkbox="false"
      :show-date-label="false"
      :show-footer="false" -->
    <input type="text" v-model="timeRange" @change="handleChange" />
    {{ selected }}
    <time-schedule
      :model-value.sync="selected"
      :date-list="dateList"
      :show-checkbox="true"
      :disabled-time-range="disabledTimeRange"
      :can-overlap="true"
      @change="handleRangeChange1"
    >
    </time-schedule>

    <time-schedule-alone
      :model-value.sync="selected2"
      :can-overlap="true"
      :disabled-time-range="disabledTimeRange[0]"
      @change="handleRangeChange2"
    >
    </time-schedule-alone>
  </div>
</template>

<script lang="ts">
export default {
  name: 'App',
  data() {
    return {
      timeRange: '00:00~03:00',
      dateList: ['时间'],
      selected: [['00:00~03:00'], ['00:00~24:00'], ['00:00~23:30']],
      selected2: ['00:00~03:00'],
      disabledTimeRange: [['05:00~08:00']]
    }
  },
  methods: {
    handleChange() {
      this.selected = [[this.timeRange]]
      this.selected2 = [this.timeRange]
    },
    handleRangeChange1(val: string[][]) {
      console.log('🚀 ~ handleRangeChange1 ~ handleRangeChange1:', val)
      this.timeRange = val[0]?.[0] || ''
      this.handleChange()
    },
    handleRangeChange2(val: string[]) {
      console.log('🚀 ~ handleRangeChange2 ~ handleRangeChange2:', val)
      this.timeRange = val[0]
      this.handleChange()
    }
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
