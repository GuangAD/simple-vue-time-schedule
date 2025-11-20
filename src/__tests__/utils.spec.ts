import { describe, it, expect } from 'vitest'
import { getClockString, getIndexFromClockString, parseRangeToBitmask, formatBitmaskToRanges } from '../utils'

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

    it('should return -1 for invalid time string', () => {
      expect(getIndexFromClockString('invalid', 'start')).toBe(-1)
      expect(getIndexFromClockString('25:00', 'start')).toBe(-1)
    })
  })

  describe('parseRangeToBitmask', () => {
    it('should convert range string to bitmask', () => {
      // 00:00~01:00 -> index 0, 1 -> 11 (binary) -> 3n
      expect(parseRangeToBitmask('00:00~01:00')).toBe(3n)

      // 00:30~01:00 -> index 1 -> 10 (binary) -> 2n
      expect(parseRangeToBitmask('00:30~01:00')).toBe(2n)
    })

    it('should return 0n for invalid range', () => {
      expect(parseRangeToBitmask('')).toBe(0n)
      expect(parseRangeToBitmask('invalid')).toBe(0n)
    })
  })

  describe('formatBitmaskToRanges', () => {
    it('should convert bitmask to range strings', () => {
      // 3n -> 11 -> 00:00~01:00
      expect(formatBitmaskToRanges(3n)).toEqual(['00:00~01:00'])

      // 5n -> 101 -> 00:00~00:30, 01:00~01:30
      expect(formatBitmaskToRanges(5n)).toEqual(['00:00~00:30', '01:00~01:30'])
    })

    it('should handle empty bitmask', () => {
      expect(formatBitmaskToRanges(0n)).toEqual([])
    })
  })
})
