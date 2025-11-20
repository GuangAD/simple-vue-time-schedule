import { ref, onUnmounted } from 'vue'
import type { Ref } from 'vue'

export interface GridSelectionOptions {
  rows: number
  cols: number
  containerRef: Ref<HTMLElement | null>
  onSelect: (startDay: number, startTime: number, endDay: number, endTime: number, isAdd: boolean) => void
}

export function useGridSelection({ rows, cols, containerRef, onSelect }: GridSelectionOptions) {
  const isDragging = ref(false)
  const startCell = ref<{ day: number; time: number } | null>(null)
  const currentCell = ref<{ day: number; time: number } | null>(null)
  const isAdd = ref(true) // true for select, false for deselect

  // 获取坐标对应的格子
  const getCellFromCoords = (x: number, y: number) => {
    if (!containerRef.value) {
      return null
    }

    const rect = containerRef.value.getBoundingClientRect()
    const relativeX = x - rect.left
    const relativeY = y - rect.top

    // 边界检查
    if (relativeX < 0 || relativeX > rect.width || relativeY < 0 || relativeY > rect.height) {
      return null
    }

    const cellWidth = rect.width / cols
    const cellHeight = rect.height / rows

    const col = Math.floor(relativeX / cellWidth)
    const row = Math.floor(relativeY / cellHeight)

    return {
      day: Math.min(Math.max(row, 0), rows - 1),
      time: Math.min(Math.max(col, 0), cols - 1)
    }
  }

  const handleMouseDown = (e: MouseEvent, initialIsAdd: boolean) => {
    if (e.button !== 0) {
      return
    } // Only left click

    const cell = getCellFromCoords(e.clientX, e.clientY)
    if (cell) {
      isDragging.value = true
      startCell.value = cell
      currentCell.value = cell
      isAdd.value = initialIsAdd

      // 立即触发一次选择
      onSelect(cell.day, cell.time, cell.day, cell.time, isAdd.value)

      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging.value || !startCell.value) {
      return
    }

    // 使用 requestAnimationFrame 节流？或者直接计算
    // 这里为了简单直接计算，因为没有 DOM 操作，性能应该足够
    const cell = getCellFromCoords(e.clientX, e.clientY)

    // 如果移出区域，保持上一个有效位置，或者根据方向 clamp
    if (cell) {
      if (cell.day !== currentCell.value?.day || cell.time !== currentCell.value?.time) {
        currentCell.value = cell

        // 计算范围
        const minDay = Math.min(startCell.value.day, currentCell.value.day)
        const maxDay = Math.max(startCell.value.day, currentCell.value.day)
        const minTime = Math.min(startCell.value.time, currentCell.value.time)
        const maxTime = Math.max(startCell.value.time, currentCell.value.time)

        onSelect(minDay, minTime, maxDay, maxTime, isAdd.value)
      }
    }
  }

  const handleMouseUp = () => {
    isDragging.value = false
    startCell.value = null
    currentCell.value = null

    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
  }

  onUnmounted(() => {
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
  })

  return {
    isDragging,
    handleMouseDown
  }
}
