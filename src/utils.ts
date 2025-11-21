// oxlint-disable no-console

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
    minStr = min === 1 ? '30' : '00'
  } else {
    minStr = min === 0 ? '30' : '00'
  }

  return `${hourStr}:${minStr}`
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

  // 计算需要设置的位长度。例如，如果 start=4, end=10，则 length=7 (4到10位都需要设置)
  const length = BigInt(end - start + 1) // length = 10 - 4 + 1 = 7n

  // 步骤 1: 创建一个长度为 `length` 的全 1 比特序列。
  // `1n << length` 会生成一个在 `length` 位置为 1，其余为 0 的 BigInt。
  // 例如，如果 length = 7，`1n << 7n` 得到 `0b10000000n` (即 128n)。
  // 减去 `1n` 后，`0b10000000n - 1n` 得到 `0b01111111n` (即 127n)。
  // 这是一个从第 0 位到第 `length - 1` 位都是 1 的序列。
  const allOnesMask = (1n << length) - 1n // allOnesMask = (1n << 7n) - 1n = 0b01111111n

  // 步骤 2: 将这个全 1 序列左移 `start` 位。
  // 这会将 `allOnesMask` 中的 1 移动到从 `start` 位置开始的连续 `length` 个位置。
  // 例如，如果 `allOnesMask` 是 `0b01111111n` (length=7) 且 `start` 是 4，
  // 那么 `0b01111111n << 4n` 得到 `0b011111110000n`。
  // 最终结果是一个 BigInt，其中从 `start` 位（第4位）到 `end` 位（第10位）都是 1，其余位是 0。
  return allOnesMask << BigInt(start) // 0b01111111n << 4n = 0b011111110000n
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

export { dayHour, getClockString, getIndexFromClockString, parseRangeToBitmask, formatBitmaskToRanges }
