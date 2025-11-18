<!-- eslint-disable vue/valid-v-model -->
<template>
  <div id="app">
    <h1>Vue 3</h1>
    <input type="text" v-model="timeRange" @change="handleChange" />
    {{ selected }}
    <time-schedule
      canOverlap
      v-model="selected"
      show-checkbox
      :date-list="dateList"
      :disabled-time-range="disabledTimeRange"
      @change="handleRangeChange"
    >
    </time-schedule>
  </div>
</template>

<script>
export default {
  name: 'App',

  data() {
    return {
      list1: [1, 2, 3],
      list2: [1, 2, 3],
      list3: [1, 2, 3],
      dateList: ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
      timeRange: '00:00~03:00',
      selected: [['00:00~03:00'], ['00:00~24:00'], ['00:00~23:30']],
      selected2: [[], [0, 1, 2], [], [], [], [], []],
      disabledTimeRange: [['05:00~08:00']]
    }
  },
  methods: {
    handleChange() {
      this.selected = [[this.timeRange]]
    },
    handleRangeChange() {
      this.timeRange = this.selected[0][0]
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
