// oxlint-disable no-console
// 定义一天的半小时时间点数组 (0-47，共 48 个半小时)
const dayHalfHour = Array.from({ length: 48 }, (_, i) => i)

// 定义一小时时间点数组 (0-23)
const dayHour = Array.from({ length: 24 }, (_, i) => i)

/**
 * 辅助函数：根据半小时 ID (0-47) 和类型 ('start' 或 'end') 获取时钟字符串
 */
function getClockString(id: number, type: 'start' | 'end'): string {
  if (!Number.isInteger(id)) {
    console.error('ERROR: getClockString() Input id is not integer.')
    return ''
  }

  let h = Math.floor(id / 2)
  const min = id % 2

  if (type === 'end' && min === 1) {
    h += 1
  }

  // Handle 24:00 case
  if (h === 24 && type === 'end') {
    return '24:00'
  }

  const hourStr = h <= 9 ? `0${h}` : `${h}`
  let minStr = ''

  if (type === 'start') {
    minStr = min === 1 ? ':30' : ':00'
  } else {
    minStr = min === 0 ? ':30' : ':00'
  }

  return `${hourStr}${minStr}`
}

/**
 * 辅助函数：根据时间点字符串和类型生成半小时 ID (0-47)
 */
function getIndexFromClockString(timeStr: string, type: 'start' | 'end'): number {
  if (!timeStr) {
    return -1
  }

  const timeRegex = /^(([01]\d|2[0-3]):([0-5]\d))|(24:00)$/
  if (!timeRegex.test(timeStr)) {
    return -1
  }

  const [hours, minutes] = timeStr.split(':').map(Number)

  let id: number
  if (type === 'start') {
    id = hours * 2 + Math.floor(minutes / 30)
  } else {
    if (minutes === 0 && hours === 0) {
      return -1
    }

    if (minutes === 0) {
      id = (hours - 1) * 2 + 1
    } else if (minutes === 30) {
      id = hours * 2
    } else {
      return -1
    }
  }

  if (id < 0 || id > 47) {
    return -1
  }
  return id
}

/**
 * 将时间范围字符串转换为位图掩码
 * 例如: "00:00~01:00" -> 3n (二进制 11)
 */
function parseRangeToBitmask(rangeStr: string): bigint {
  if (!rangeStr) {
    return 0n
  }

  const [startStr, endStr] = rangeStr.split('~')
  const start = getIndexFromClockString(startStr, 'start')
  const end = getIndexFromClockString(endStr, 'end')

  if (start === -1 || end === -1 || start > end) {
    return 0n
  }

  const length = BigInt(end - start + 1)
  return ((1n << length) - 1n) << BigInt(start)
}

/**
 * 将位图掩码转换为时间范围字符串数组
 */
function formatBitmaskToRanges(mask: bigint): string[] {
  const ranges: string[] = []
  let start = -1

  for (let i = 0; i < 48; i++) {
    const isSet = (mask & (1n << BigInt(i))) !== 0n

    if (isSet) {
      if (start === -1) {
        start = i
      }
    } else {
      if (start !== -1) {
        ranges.push(`${getClockString(start, 'start')}~${getClockString(i - 1, 'end')}`)
        start = -1
      }
    }
  }

  if (start !== -1) {
    ranges.push(`${getClockString(start, 'start')}~${getClockString(47, 'end')}`)
  }

  return ranges
}

export interface ThemeConfig {
  primaryColor?: string
  errorColor?: string
  disabledColor?: string
  hoverBg?: string
  borderColor?: string
  textColor?: string
  subtextColor?: string
}

export const THEME_KEY = Symbol('TimeScheduleTheme')

export { dayHalfHour, dayHour, getClockString, getIndexFromClockString, parseRangeToBitmask, formatBitmaskToRanges }
