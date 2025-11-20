import { describe, it, expect } from 'vitest'
import {
  getClockString,
  getIndexFromClockString,
  getDayHalfHourFromRange,
  insertInterval,
  removeInterval,
  isInTimeRange
} from '../utils'

describe('utils', () => {
  describe('getClockString', () => {
    it('should return correct time string for start type', () => {
      expect(getClockString(0, 'start')).toBe('00:00')
      expect(getClockString(1, 'start')).toBe('00:30')
      expect(getClockString(47, 'start')).toBe('23:30')
    })

    it('should return correct time string for end type', () => {
      expect(getClockString(0, 'end')).toBe('00:30')
      expect(getClockString(1, 'end')).toBe('01:00')
      expect(getClockString(47, 'end')).toBe('24:00')
    })
  })

  describe('getIndexFromClockString', () => {
    it('should return correct index for start type', () => {
      expect(getIndexFromClockString('00:00', 'start')).toBe(0)
      expect(getIndexFromClockString('00:30', 'start')).toBe(1)
      expect(getIndexFromClockString('23:30', 'start')).toBe(47)
    })

    it('should return correct index for end type', () => {
      expect(getIndexFromClockString('00:30', 'end')).toBe(0)
      expect(getIndexFromClockString('01:00', 'end')).toBe(1)
      expect(getIndexFromClockString('24:00', 'end')).toBe(47)
    })
  })

  describe('getDayHalfHourFromRange', () => {
    it('should convert range string to index array', () => {
      expect(getDayHalfHourFromRange('00:00~01:00')).toEqual([0, 1])
      expect(getDayHalfHourFromRange('09:00~10:30')).toEqual([18, 20])
    })
  })

  describe('insertInterval', () => {
    it('should insert non-overlapping interval', () => {
      const intervals: [number, number][] = [[0, 2]]
      const newInterval: [number, number] = [5, 7]
      expect(insertInterval(intervals, newInterval)).toEqual([
        [0, 2],
        [5, 7]
      ])
    })

    it('should merge overlapping intervals', () => {
      const intervals: [number, number][] = [
        [0, 4],
        [6, 8]
      ]
      const newInterval: [number, number] = [3, 7]
      // [0,4] overlaps with [3,7] -> [0,7]
      // [0,7] overlaps with [6,8] -> [0,8]
      expect(insertInterval(intervals, newInterval)).toEqual([[0, 8]])
    })
  })

  describe('removeInterval', () => {
    it('should remove overlapping part', () => {
      const intervals: [number, number][] = [[0, 10]]
      const toRemove: [number, number] = [2, 5]
      // [0,10] - [2,5] -> [0,1], [6,10]
      expect(removeInterval(intervals, toRemove)).toEqual([
        [0, 1],
        [6, 10]
      ])
    })

    it('should remove entire interval if fully covered', () => {
      const intervals: [number, number][] = [[2, 5]]
      const toRemove: [number, number] = [0, 10]
      expect(removeInterval(intervals, toRemove)).toEqual([])
    })
  })

  describe('isInTimeRange', () => {
    it('should return true if point is in range', () => {
      expect(isInTimeRange(5, [0, 10])).toBe(true)
      expect(isInTimeRange(0, [0, 10])).toBe(true)
      expect(isInTimeRange(10, [0, 10])).toBe(true)
    })

    it('should return false if point is out of range', () => {
      expect(isInTimeRange(-1, [0, 10])).toBe(false)
      expect(isInTimeRange(11, [0, 10])).toBe(false)
    })
  })
})
