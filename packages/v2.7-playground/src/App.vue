<!-- eslint-disable vue/no-deprecated-v-bind-sync -->
<template>
  <div id="app">
    <input type="text" v-model="timeRange" @change="handleChange" />
    {{ selected }}
    <time-schedule :modelValue.sync="selected" show-checkbox :date-list="dateList"
      :disabled-time-range="disabledTimeRange" @change="handleRangeChange">
    </time-schedule>
  </div>
</template>

<script lang="ts">
export default {
  name: 'App',

  data() {
    return {
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
