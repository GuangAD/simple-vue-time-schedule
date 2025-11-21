import { ref } from 'vue'
import { parseRangeToBitmask, formatBitmaskToRanges } from '../utils'

export function useTimeBitmask(daysCount = 7) {
  // 每天用一个 BigInt 表示 48 个半小时
  const weekState = ref<bigint[]>(new Array(daysCount).fill(0n))

  // 从字符串数组导入
  const fromStringArray = (data: string[][]) => {
    const newState = new Array(daysCount).fill(0n)
    data.forEach((dayRanges, dayIndex) => {
      if (dayIndex >= daysCount) {
        return
      }
      let mask = 0n
      dayRanges.forEach((rangeStr) => {
        mask |= parseRangeToBitmask(rangeStr)
      })
      newState[dayIndex] = mask
    })
    weekState.value = newState
  }

  // 导出为字符串数组
  const toStringArray = (): string[][] => {
    return weekState.value.map((dayBits) => formatBitmaskToRanges(dayBits))
  }

  // 更新状态
  const toggleRange = (...args: [number, number, number, boolean]) => {
    const [day, start, end, value] = args
    if (day < 0 || day >= daysCount || start > end) {
      return
    }

    const length = BigInt(end - start + 1)
    const mask = ((1n << length) - 1n) << BigInt(start)

    if (value) {
      weekState.value[day] |= mask
    } else {
      weekState.value[day] &= ~mask
    }
  }

  return {
    weekState,
    fromStringArray,
    toStringArray,
    toggleRange
  }
}
