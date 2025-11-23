import { ref } from 'vue'
import { parseRangeToBitmask, formatBitmaskToRanges } from '../utils'

export function useTimeBitmask(daysCount = 7) {
  // 每天用一个 BigInt 表示 48 个半小时
  const weekState = ref<bigint[]>(new Array(daysCount).fill(0n))
  const disabledState = ref<bigint[]>(new Array(daysCount).fill(0n))

  // 从字符串数组导入
  const fromStringArray = (data: string[][]) => {
    const newState = new Array(daysCount).fill(0n)
    data.forEach((dayRanges, dayIndex) => {
      if (dayIndex >= daysCount) {
        return
      }
      let mask = 0n
      dayRanges.forEach((rangeStr) => {
        // 将形如 "08:00-09:30" 的字符串解析为 48 位 BigInt 掩码，并按位或合并到当天的总掩码中
        mask |= parseRangeToBitmask(rangeStr)
      })
      newState[dayIndex] = mask
    })
    weekState.value = newState
  }

  // 导入不可用区域
  const fromDisabledStringArray = (data: string[][]) => {
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
    disabledState.value = newState
  }

  // 导出为字符串数组
  const toStringArray = (): string[][] => {
    return weekState.value.map((dayBits) => formatBitmaskToRanges(dayBits))
  }

  // 更新状态
  /**
   * 根据传入的“天索引、起始位、结束位、是否置位”四个参数，
   * 把对应那一天（weekState[day]）的某一段连续位（start 到 end）整体置 1 或置 0。
   *
   * 参数说明：
   *  - day: 星期几的索引（0 起，默认 0~6）
   *  - start: 要操作的起始位（0 起，代表 00:00–00:30）
   *  - end: 要操作的结束位（含）；若省略则与 start 相同，只改 1 位
   *  - value: true 表示把这段位全部置 1（选中），false 表示全部置 0（取消选中）
   *
   * 实现思路：
   *  1. 先检查 day 越界或 start > end 直接返回，避免非法写入。
   *  2. 计算需要操作的连续位长度 length = end - start + 1。
   *  3. 构造一个 length 位全 1 的掩码 mask：
   *        mask = ((1n << length) - 1n) << BigInt(start)
   *     例如 start=4, length=3 得到 0b1110000n。
   *  4. 根据 value 决定是“按位或”置 1 还是“按位与取反”置 0。
   */
  const toggleRange = (...args: [number, number, number, boolean]) => {
    const [day, start, end, value] = args
    if (day < 0 || day >= daysCount || start > end) {
      return
    }

    const length = BigInt((end ?? start) - start + 1)
    const mask = ((1n << length) - 1n) << BigInt(start)

    if (value) {
      weekState.value[day] |= mask
    } else {
      weekState.value[day] &= ~mask
    }
  }

  return {
    weekState,
    disabledState,
    fromStringArray,
    fromDisabledStringArray,
    toStringArray,
    toggleRange
  }
}
