<!-- eslint-disable vue/valid-v-model -->
<template>
  <div id="app">
    <input type="text" v-model="timeRange" @change="handleChange" />
    {{ selected }}
    <time-schedule canOverlap v-model="selected" show-checkbox :date-list="dateList"
      :disabled-time-range="disabledTimeRange" @change="handleRangeChange">
    </time-schedule>

    <!-- <div>
      <div v-for="(item, index) in list1" :key="index">
        <input type="text" v-model="list1[index]" /><span>{{ item }}</span>
      </div>
    </div>
    <br />
    <div>
      <div>
        <input type="text" v-model="list2[0]" /><span>{{ list2[0] }}</span>
      </div>
      <div>
        <input type="text" v-model="list2[1]" /><span>{{ list2[1] }}</span>
      </div>
      <div>
        <input type="text" v-model="list2[2]" /><span>{{ list2[2] }}</span>
      </div>
    </div>
    <br />
    <div>
      <div v-for="(item, index) in list3" :key="index">
        <input type="text" v-model="list3[index]" /><span>{{ item }}</span>
      </div>
    </div> -->
  </div>
</template>

<script lang="ts">
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
