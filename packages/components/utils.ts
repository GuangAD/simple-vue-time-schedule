// oxlint-disable no-console
// 定义一天的半小时时间点数组 (0-47，共 48 个半小时)
const dayHalfHour = [
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31,
  32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47
]
// 定义一小时时间点数组 (0-23)
const dayHour = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23]
/**
 * 辅助函数：将一个有序的数字数组转换为连续的子数组范围
 * 例如: [1, 2, 3, 5, 6, 8] => [[1, 3], [5, 6], [8]]
 * @param {Array} arr - 有序的数字数组
 * @returns {Array} - 连续的子数组范围
 */
function getContinuousChildArr(arr: number[]): number[][] {
  if (!(arr instanceof Array)) {
    console.error('ERROR: getContinuousChildArr() Input is not Array.')
    return []
  }

  const rangeArr: number[][] = []

  let rangeStartIndex = 0
  let rangeEndIndex = 0
  arr.forEach((item, curIndex, thisArr) => {
    const nextIndex = curIndex + 1
    const nextItem = thisArr[nextIndex]

    const itemIsContinuous = nextItem === item + 1 // 判断当前项和下一项是否连续

    if (!itemIsContinuous) {
      // 如果不连续，则当前连续范围结束
      if (rangeStartIndex !== rangeEndIndex) {
        // 如果范围有多个元素
        rangeArr.push([thisArr[rangeStartIndex], thisArr[rangeEndIndex]])
      } else {
        // 如果范围只有一个元素
        rangeArr.push([item])
      }

      rangeStartIndex = nextIndex
      rangeEndIndex = nextIndex
    } else {
      // 如果连续，则扩展当前连续范围的结束索引
      rangeEndIndex = nextIndex
    }
  })

  return rangeArr
}

/**
 * 辅助函数：根据半小时 ID (0-47) 和类型 ('start' 或 'end') 获取时钟字符串
 * 例如: ID=0, type='start' => '00:00'
 * 例如: ID=0, type='end' => '00:30'
 * 例如: ID=1, type='start' => '00:30'
 * 例如: ID=1, type='end' => '01:00'
 * @param {number} id - 半小时 ID (0-47)
 * @param {string} type - 类型 ('start' 或 'end')
 * @returns {string} - 时钟字符串
 */
function getClockString(id: number, type: 'start' | 'end'): string {
  if (!Number.isInteger(id)) {
    console.error('ERROR: getClockString() Input id is not integer.')
    return ''
  }
  if (type !== 'start' && type !== 'end') {
    console.error('ERROR: getClockString() Input type is not legal.')
    return ''
  }

  let clock = ''
  let h = Math.floor(id / 2) // 计算小时
  const min = id % 2 // 计算是小时的 0 分钟还是 30 分钟
  if (type === 'end' && min === 1) {
    // 如果是结束时间，且是 xx:30 这种半小时的结束，则小时加 1
    // 例如 ID=1 (00:30)，结束时间是 01:00
    h += 1
  }
  // 格式化小时，保证两位数
  if (h <= 9) {
    clock += '0' + h
  } else {
    clock += h
  }
  if (type === 'start') {
    if (min === 1) {
      clock += ':30'
    } else {
      clock += ':00'
    }
  } else {
    // type === 'end'
    if (min === 0) {
      // 例如 id=0, start=00:00, end=00:30 (下一个半小时)
      clock += ':30'
    } else {
      // 例如 id=1, start=00:30, end=01:00 (下一个小时)
      clock += ':00'
    }
  }
  return clock
}

/**
 * 辅助函数：根据时间点字符串和类型生成半小时 ID (0-47)
 * 例如: '00:00', type='start' => 0
 * 例如: '00:30', type='end' => 0
 * 例如: '00:30', type='start' => 1
 * 例如: '01:00', type='end' => 1
 * @param {string} timeStr - 时间点字符串 (格式: 'HH:MM')
 * @param {string} type - 类型 ('start' 或 'end')
 * @returns {number} - 半小时 ID (0-47)，如果输入不合法返回 -1
 */
function getIndexFromClockString(timeStr: string, type: 'start' | 'end'): number {
  if (typeof timeStr !== 'string') {
    console.error('ERROR: getIndexFromClockString() Input timeStr is not string.')
    return -1
  }
  if (type !== 'start' && type !== 'end') {
    console.error('ERROR: getIndexFromClockString() Input type is not legal.')
    return -1
  }

  // 验证时间格式 HH:MM
  const timeRegex = /^(([01]\d|2[0-3]):([0-5]\d))|(24:00)$/
  if (!timeRegex.test(timeStr)) {
    console.error('ERROR: getIndexFromClockString() Invalid time format. Expected HH:MM.')
    return -1
  }

  const [hours, minutes] = timeStr.split(':').map(Number)

  // 根据类型计算半小时ID
  let id: number
  if (type === 'start') {
    // 开始时间: 00:00=0, 00:30=1, 01:00=2, 01:30=3...
    id = hours * 2 + Math.floor(minutes / 30)
  } else {
    // 结束时间: 00:30=0, 01:00=1, 01:30=2, 02:00=3...
    if (minutes === 0 && hours === 0) {
      // 特殊情况: 00:00 作为结束时间是不合法的
      console.error('ERROR: getIndexFromClockString() 00:00 cannot be end time.')
      return -1
    }

    if (minutes === 0) {
      // 01:00 结束时间对应 00:30-01:00 区间，ID为1
      id = (hours - 1) * 2 + 1
    } else if (minutes === 30) {
      // 00:30 结束时间对应 00:00-00:30 区间，ID为0
      id = hours * 2
    } else {
      // 其他分钟值不合法
      console.error('ERROR: getIndexFromClockString() Minutes must be 00 or 30 for half-hour intervals.')
      return -1
    }
  }

  // 验证ID范围
  if (id < 0 || id > 47) {
    console.error('ERROR: getIndexFromClockString() Generated ID is out of range (0-47).')
    return -1
  }

  return id
}

/**
 * 辅助函数：根据时间范围字符串生成对应的半小时 ID 数组
 * 例如: "00:30~12:00" => [1, 2, 3, ..., 24]
 * 例如: "09:00~18:00" => [18, 19, 20, ..., 36]
 * @param {string} timeRange - 时间范围字符串 (格式: "HH:MM~HH:MM")
 * @returns {Array} - 半小时 ID 数组，如果输入不合法返回空数组
 */
function getDayHalfHourFromRange(timeRange: string): TimeRange | [] {
  if (typeof timeRange !== 'string') {
    throw new Error('ERROR: getDayHalfHourFromRange() Input timeRange is not string.')
  }

  if (!timeRange) {
    return []
  }

  // 验证时间范围格式
  const rangeRegex = /^([01]\d|2[0-3]):([0-5]\d)~(([01]\d|2[0-3]):([0-5]\d)|(24:00))$/
  if (!rangeRegex.test(timeRange)) {
    throw new Error('ERROR: getDayHalfHourFromRange() Invalid time range format. Expected HH:MM~HH:MM.')
  }

  const [startTime, endTime] = timeRange.split('~')

  // 获取开始和结束时间对应的半小时ID
  const startId = getIndexFromClockString(startTime, 'start')
  const endId = getIndexFromClockString(endTime, 'end')

  if (startId === -1 || endId === -1) {
    throw new Error('ERROR: getDayHalfHourFromRange() Invalid time format in range.')
  }

  if (startId > endId) {
    throw new Error('ERROR: getDayHalfHourFromRange() Start time must be before end time.')
  }
  const result = [startId, endId] as TimeRange

  return result
}

type TimeRange = [number, number?]

function isRangeOverlap(range1: TimeRange, range2: TimeRange): boolean {
  const [start1, end1] = getStartAndEnd(range1)
  const [start2, end2] = getStartAndEnd(range2)
  return start1 <= end2 && start2 <= end1
}

function getStartAndEnd(interval: TimeRange): [number, number] {
  const start = interval[0]
  const end = interval[1] ?? interval[0]
  return [start, end]
}

function isInTimeRange(point: number, range: TimeRange): boolean {
  const [start, end] = getStartAndEnd(range)
  return point >= start && point <= end
}

/**
 * 将新区间插入到区间列表中，并合并重叠的区间
 * @param intervals 二维数组，每个元素是一个包含两个数字的数组，表示一个区间 [start, end]
 * @param newInterval 一维数组，包含两个数字，表示要插入的新区间 [start, end]
 * @returns 合并后的区间列表
 * 这个函数的工作原理：

保持原数组不变：使用展开运算符 [...intervals[i]] 创建区间副本
三个阶段处理：

添加所有在新区间之前且无重叠的区间
合并所有与新区间重叠的区间
添加所有在新区间之后且无重叠的区间


重叠判断：两个区间 [A_start, A_end] 和 [B_start, B_end] 重叠当且仅当 A_start <= B_end 且 B_start <= A_end
合并逻辑：合并时取最小的起始位置和最大的结束位置

时间复杂度：O(n)，其中 n 是原区间列表的长度
空间复杂度：O(n)，用于存储结果数组
对于你的例子 ([[1, 4], [5, 7]], [4, 6])：

区间 [1, 4] 与新区间 [4, 6] 重叠（因为 4 = 4）
区间 [5, 7] 与新区间 [4, 6] 重叠（因为 5 ≤ 6）
最终合并为 [1, 7]

函数已经包含了多个测试用例来验证正确性。
 */

function insertInterval(intervals: TimeRange[], newInterval: TimeRange): TimeRange[] {
  // 创建副本以避免修改原数组
  const result: TimeRange[] = []
  const [newStart, newEnd] = getStartAndEnd(newInterval)

  console.log('🚀 ~ insertInterval ~ newStart:', newStart, newEnd)

  let i = 0

  // 1. 添加所有结束位置在新区间开始之前的区间（无重叠）
  while (i < intervals.length && getStartAndEnd(intervals[i])[1] < newStart - 1) {
    result.push([...intervals[i]])
    i++
  }

  // 2. 合并所有与新区间重叠的区间
  let mergedStart = newStart
  let mergedEnd = newEnd
  // intervals[i][1] >= newStart 条件可省略
  while (i < intervals.length && intervals[i][0] <= newEnd + 1 && getStartAndEnd(intervals[i])[1] >= newStart - 1) {
    mergedStart = Math.min(mergedStart, intervals[i][0])
    mergedEnd = Math.max(mergedEnd, getStartAndEnd(intervals[i])[1])
    i++
  }

  const mergedInterval: TimeRange = mergedStart === mergedEnd ? [mergedStart] : [mergedStart, mergedEnd]
  // 添加合并后的区间
  result.push(mergedInterval)

  // 3. 添加所有开始位置在新区间结束之后的区间（无重叠）
  while (i < intervals.length) {
    result.push([...intervals[i]])
    i++
  }

  return result
}

/**
 * 从有序区间列表中删除指定范围内的部分
 * @param intervals TimeRange数组，每个元素是一个区间 [start, end?]
 * @param removeInterval TimeRange，表示要删除的区间 [start, end?]
 * @returns 删除后的区间列表
 *
 * 这个函数的工作原理：
 * 1. 保持原数组不变：使用展开运算符创建副本
 * 2. 遍历所有区间，根据与删除区间的关系进行处理：
 *    - 无交集：完整保留
 *    - 有交集：保留非重叠部分，可能分割成两个区间
 * 3. 自动处理单点区间（只有一个元素的情况）
 *
 * 时间复杂度：O(n)，其中 n 是原区间列表的长度
 * 空间复杂度：O(k)，其中 k 是结果区间数量
 */
function removeInterval(intervals: TimeRange[], removeInterval: TimeRange): TimeRange[] {
  // 创建副本以避免修改原数组
  const result: TimeRange[] = []
  const [removeStart, removeEnd] = getStartAndEnd(removeInterval)

  for (const interval of intervals) {
    const [currentStart, currentEnd] = getStartAndEnd(interval)

    // 情况1：当前区间完全在删除区间之前，无交集
    if (currentEnd < removeStart) {
      result.push([...interval])
    }
    // 情况2：当前区间完全在删除区间之后，无交集
    else if (currentStart > removeEnd) {
      result.push([...interval])
    }
    // 情况3：当前区间与删除区间有交集
    else {
      // 情况3.1：当前区间的左半部分在删除区间之前
      if (currentStart < removeStart) {
        const leftEnd = removeStart - 1
        const leftInterval: TimeRange = currentStart === leftEnd ? [currentStart] : [currentStart, leftEnd]
        result.push(leftInterval)
      }

      // 情况3.2：当前区间的右半部分在删除区间之后
      if (currentEnd > removeEnd) {
        const rightStart = removeEnd + 1
        const rightInterval: TimeRange = rightStart === currentEnd ? [currentEnd] : [rightStart, currentEnd]
        result.push(rightInterval)
      }

      // 情况3.3：当前区间完全被删除区间包含，不需要添加任何部分
    }
  }

  return result
}

/**
 * 辅助函数：判断一个值是否为普通对象
 * @param {*} obj - 要判断的值
 * @returns {boolean} - 如果是普通对象则返回 true，否则返回 false
 */
function isPlainObject(obj: unknown): boolean {
  return Object.prototype.toString.call(obj) === '[object Object]'
}
export {
  dayHalfHour,
  dayHour,
  getContinuousChildArr,
  getClockString,
  getIndexFromClockString,
  getDayHalfHourFromRange,
  isPlainObject,
  insertInterval,
  removeInterval,
  isInTimeRange,
  isRangeOverlap
}

export type { TimeRange }

// 测试用例
// console.log('测试用例 1:');
// const intervals1 = [[1, 4], [5, 7]];
// const newInterval1 = [4, 6];
// console.log('输入:', intervals1, newInterval1);
// console.log('输出:', insertInterval(intervals1, newInterval1));
// console.log('期望: [[1, 7]]');

// console.log('\n测试用例 2:');
// const intervals2 = [[1, 3], [6, 9]];
// const newInterval2 = [2, 5];
// console.log('输入:', intervals2, newInterval2);
// console.log('输出:', insertInterval(intervals2, newInterval2));
// console.log('期望: [[1, 5], [6, 9]]');

// console.log('\n测试用例 3:');
// const intervals3 = [[1, 2], [3, 5], [6, 7], [8, 10], [12, 16]];
// const newInterval3 = [4, 8];
// console.log('输入:', intervals3, newInterval3);
// console.log('输出:', insertInterval(intervals3, newInterval3));
// console.log('期望: [[1, 2], [3, 10], [12, 16]]');

// console.log('\n测试用例 4（空数组）:');
// const intervals4: number[][] = [];
// const newInterval4 = [5, 7];
// console.log('输入:', intervals4, newInterval4);
// console.log('输出:', insertInterval(intervals4, newInterval4));
// console.log('期望: [[5, 7]]');

// console.log('\n测试用例 5（无重叠，插入到末尾）:');
// const intervals5 = [[1, 2], [3, 5]];
// const newInterval5 = [6, 8];
// console.log('输入:', intervals5, newInterval5);
// console.log('输出:', insertInterval(intervals5, newInterval5));
// console.log('期望: [[1, 2], [3, 5], [6, 8]]');

// // 验证原数组未被修改
// console.log('\n验证原数组未被修改:');
// console.log('原数组 intervals1:', intervals1);
// console.log('原数组 newInterval1:', newInterval1);
