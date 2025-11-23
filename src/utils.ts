// oxlint-disable no-console

// 定义一小时时间点数组 (0-23)
const dayHour = Array.from({ length: 24 }, (_, i) => i)

/**
 * 辅助函数：根据半小时 ID (0-47) 和类型 ('start' 或 'end') 获取时钟字符串
 * @param id - 半小时 ID (0-47)
 * @param type - 时间类型 ('start' 或 'end')
 * @returns 时钟字符串 (例如: '08:00', '08:30', '23:30', '24:00')
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
 * @param timeStr - 时间点字符串 (例如: '08:00', '08:30', '23:30', '24:00')
 * @param type - 时间类型 ('start' 或 'end')
 * @returns 半小时 ID (0-47) 或 -1 (无效输入)
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
 * @param rangeStr - 时间范围字符串 (例如: "00:00~01:00")
 * @returns 位图掩码 (例如: 3n) 或 0n (无效输入)
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
/**
 * 将位图掩码转换为时间范围字符串数组。
 *
 * 此函数接收一个 `bigint` 类型的位图掩码，其中每个位代表一个半小时的时间段（从00:00到23:59，共48个半小时）。
 * 如果某个位被设置为1，表示对应的半小时时间段是选中的；如果为0，则表示未选中。
 * 函数的目标是将这些连续的选中时间段合并成易读的时间范围字符串（例如 "09:00~10:30"）。
 *
 * @param mask 一个 `bigint` 类型的位图掩码，表示一天中48个半小时的选中状态。
 *             最低位（第0位）代表00:00-00:29，最高位（第47位）代表23:30-23:59。
 * @returns 一个字符串数组，每个字符串代表一个连续的选中时间范围，格式为 "HH:mm~HH:mm"。
 *
 * 算法步骤：
 * 1.  **初始化**:
 *     -   `ranges`: 一个空数组，用于存储最终生成的时间范围字符串。
 *     -   `start`: 一个整数变量，初始化为 -1。它用于标记当前正在构建的连续时间范围的起始半小时ID。
 *                 当 `start` 为 -1 时，表示当前没有正在进行的连续选中范围。
 *
 * 2.  **遍历所有半小时段**:
 *     -   函数通过一个 `for` 循环，从 `i = 0` 遍历到 `i = 47`，代表一天中的所有48个半小时段。
 *
 * 3.  **检查当前位是否设置**:
 *     -   `const isSet = (mask & (1n << BigInt(i))) !== 0n`: 这一行代码检查 `mask` 的第 `i` 位是否为1。
 *         -   `1n << BigInt(i)` 创建一个 `bigint`，其中只有第 `i` 位是1（例如，如果 `i` 是2，则为 `0b100n`）。
 *         -   `&` (按位与) 操作符将 `mask` 与这个只有一位为1的 `bigint` 进行比较。
 *         -   如果结果不为 `0n`，则表示 `mask` 的第 `i` 位也是1，即该半小时段被选中 (`isSet` 为 `true`)。
 *
 * 4.  **处理选中状态 (`isSet` 为 `true`)**:
 *     -   如果当前半小时段被选中 (`isSet` 为 `true`)：
 *         -   `if (start === -1)`: 如果 `start` 仍然是 -1，说明这是新发现的一个连续选中范围的开始。
 *             -   将 `start` 更新为当前的半小时ID `i`。
 *
 * 5.  **处理未选中状态 (`isSet` 为 `false`)**:
 *     -   如果当前半小时段未被选中 (`isSet` 为 `false`)：
 *         -   `if (start !== -1)`: 如果 `start` 不为 -1，说明之前有一个连续的选中范围正在进行中，但现在中断了。
 *             -   这意味着 `start` 到 `i - 1` 形成了一个完整的选中范围。
 *             -   `ranges.push(`${getClockString(start, 'start')}~${getClockString(i - 1, 'end')}`)`:
 *                 -   使用 `getClockString(start, 'start')` 获取范围的起始时间字符串（例如 "09:00"）。
 *                 -   使用 `getClockString(i - 1, 'end')` 获取范围的结束时间字符串。注意这里是 `i - 1`，因为当前 `i` 未选中，所以前一个半小时 `i - 1` 是选中范围的最后一个。
 *                 -   将这两个时间字符串用 "~" 连接，并添加到 `ranges` 数组中。
 *             -   `start = -1`: 将 `start` 重置为 -1，表示当前没有正在进行的连续选中范围。
 *
 * 6.  **处理循环结束后可能存在的最后一个范围**:
 *     -   `if (start !== -1)`: 循环结束后，如果 `start` 仍然不为 -1，这意味着最后一个或唯一的选中范围一直持续到了一天的结束（第47个半小时）。
 *         -   `ranges.push(`${getClockString(start, 'start')}~${getClockString(47, 'end')}`)`:
 *             -   将从 `start` 到第47个半小时（即23:30-23:59）的范围添加到 `ranges` 数组中。
 *
 * 7.  **返回结果**:
 *     -   返回包含所有时间范围字符串的 `ranges` 数组。
 *
 * 示例:
 * 假设 `mask` 为 `0b0000000000000000000000000000000000000000000001110n` (二进制表示，假设从右往左是低位)
 * 对应的半小时ID为 1, 2, 3 被选中。
 * - `i = 0`: `isSet` 为 `false`。`start` 仍为 -1。
 * - `i = 1`: `isSet` 为 `true`。`start` 变为 1。
 * - `i = 2`: `isSet` 为 `true`。`start` 仍为 1。
 * - `i = 3`: `isSet` 为 `true`。`start` 仍为 1。
 * - `i = 4`: `isSet` 为 `false`。`start` 不为 -1 (是1)。
 *   -   `ranges.push(getClockString(1, 'start')~getClockString(3, 'end'))` -> "00:30~02:00"
 *   -   `start` 重置为 -1。
 * - ... (继续遍历直到 i = 47)
 * - 循环结束，`start` 为 -1。
 * - 返回 `["00:30~02:00"]`。
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
