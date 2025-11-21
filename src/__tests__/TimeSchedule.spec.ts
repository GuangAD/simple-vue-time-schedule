import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TimeSchedule from '../TimeSchedule.vue'

import { useTimeBitmask } from '../composables/useTimeBitmask'

describe('TimeSchedule', () => {
  it('renders properly', () => {
    const wrapper = mount(TimeSchedule)
    expect(wrapper.find('.schedule-grid').exists()).toBe(true)
  })

  it('renders with custom text config', () => {
    const textConfig = { am: 'Morning', pm: 'Afternoon' }
    const wrapper = mount(TimeSchedule, {
      props: {
        textConfig
      }
    })
    expect(wrapper.text()).toContain('Morning')
    expect(wrapper.text()).toContain('Afternoon')
  })

  it('applies theme styles', () => {
    const theme = { primaryColor: 'red' }
    const wrapper = mount(TimeSchedule, {
      props: {
        theme
      }
    })
    const style = wrapper.attributes('style')
    expect(style).toContain('--schedule-primary-color: red')
  })

  it('renders correct number of rows based on labels', () => {
    const labels = ['Mon', 'Tue', 'Wed']
    const wrapper = mount(TimeSchedule, {
      props: {
        labels
      }
    })
    // In grid layout, we check for label cells
    expect(wrapper.findAll('.schedule-label-cell').length).toBe(labels.length)
  })

  it('accepts modelValue in string array format', async () => {
    const modelValue = [['00:00~01:00'], [], [], [], [], [], []]
    const wrapper = mount(TimeSchedule, {
      props: {
        modelValue
      }
    })

    // Check if the first two cells of the first row are selected
    // We need to access internal state or check classes
    // Since we can't easily access internal state in tests without exposing it,
    // we check the DOM classes.
    // The first row (index 0) should have first two cells (index 0, 1) selected.

    // Note: In the grid, cells are flattened.
    // Row 0, Cell 0 -> index 0
    // Row 0, Cell 1 -> index 1
    const cells = wrapper.findAll('.schedule-cell')
    expect(cells[0].classes()).toContain('schedule-selected')
    expect(cells[1].classes()).toContain('schedule-selected')
    expect(cells[2].classes()).not.toContain('schedule-selected')
  })

  it('renders disabled cells correctly', () => {
    const disabled = [['00:00~01:00'], [], [], [], [], [], []]
    const wrapper = mount(TimeSchedule, {
      props: {
        disabled
      }
    })
    const cells = wrapper.findAll('.schedule-cell')
    expect(cells[0].classes()).toContain('schedule-disabled')
    expect(cells[1].classes()).toContain('schedule-disabled')
    expect(cells[2].classes()).not.toContain('schedule-disabled')
  })

  it('emits error when overlapping disabled area', async () => {
    const disabled = [['00:00~01:00'], [], [], [], [], [], []]
    const wrapper = mount(TimeSchedule, {
      props: {
        disabled,
        canOverlapDisabled: false
      }
    })

    // Simulate selection overlapping disabled area
    // We need to trigger the selection logic.
    // Since we can't easily trigger drag events in jsdom perfectly to match our composable,
    // we might need to mock the composable or just check the class logic if we could force state.
    // However, we can check if the class 'schedule-error' is applied if we force modelValue to overlap.

    await wrapper.setProps({
      modelValue: [['00:00~01:00'], [], [], [], [], [], []]
    })

    const cells = wrapper.findAll('.schedule-cell')
    expect(cells[0].classes()).toContain('schedule-error')
  })

  it('excludes disabled areas when canOverlapDisabled is true', async () => {
    const disabled = [['00:00~01:00'], [], [], [], [], [], []]
    const wrapper = mount(TimeSchedule, {
      props: {
        disabled,
        canOverlapDisabled: true
      }
    })

    // Simulate selection overlapping disabled area
    // We simulate this by manually updating the internal state via a prop update that triggers the watcher
    // or by mocking the interaction.
    // Since we added a watcher for canOverlapDisabled, we can test that too.

    // First set some selection that overlaps
    await wrapper.setProps({
      modelValue: [['00:00~02:00'], [], [], [], [], [], []],
      canOverlapDisabled: false // Initially false, so it overlaps
    })

    // Now switch canOverlapDisabled to true
    await wrapper.setProps({
      canOverlapDisabled: true
    })

    // The disabled part (00:00~01:00) should be removed from selection
    // So only 01:00~02:00 should be selected.
    // 00:00~01:00 is index 0, 1.
    // 01:00~02:00 is index 2, 3.

    const cells = wrapper.findAll('.schedule-cell')
    // Index 0, 1 should NOT be selected (masked out)
    expect(cells[0].classes()).not.toContain('schedule-selected')
    expect(cells[1].classes()).not.toContain('schedule-selected')
    // Index 2, 3 SHOULD be selected
    expect(cells[2].classes()).toContain('schedule-selected')
    expect(cells[3].classes()).toContain('schedule-selected')

    // Also check emitted value
    const emitted = wrapper.emitted('update:modelValue')
    const lastEmit = emitted![emitted!.length - 1][0] as string[][]
    // Should be [['01:00~02:00'], ...]
    expect(lastEmit[0]).toEqual(['01:00~02:00'])
  })

  it('correctly updates when selecting multiple ranges on the same day (logic test)', () => {
    const { weekState, fromStringArray, toStringArray, toggleRange } = useTimeBitmask(1)

    // 1. Initial state: empty
    fromStringArray([[]])

    // 2. User selects 00:00~01:00 (indices 0, 1)
    // Snapshot is empty (0n)
    let snapshot = [...weekState.value]

    // Drag operation: toggle 0-1, isAdd=true
    weekState.value = [...snapshot]
    toggleRange(0, 0, 1, true)

    // Mouse up: emit
    let output = toStringArray()
    expect(output[0]).toEqual(['00:00~01:00'])

    // Parent updates prop -> watcher calls fromStringArray
    fromStringArray(output)

    // 3. User selects 02:00~03:00 (indices 4, 5)
    // Snapshot is current state (bits 0, 1 set)
    snapshot = [...weekState.value]

    // Drag operation: toggle 4-5, isAdd=true
    weekState.value = [...snapshot]
    toggleRange(0, 4, 5, true)

    // Mouse up: emit
    output = toStringArray()
    // Should contain both ranges
    expect(output[0]).toEqual(['00:00~01:00', '02:00~03:00'])

    // Parent updates prop
    fromStringArray(output)

    // 4. User selects 04:00~05:00 (indices 8, 9)
    snapshot = [...weekState.value]
    weekState.value = [...snapshot]
    toggleRange(0, 8, 9, true)

    output = toStringArray()
    expect(output[0]).toEqual(['00:00~01:00', '02:00~03:00', '04:00~05:00'])

    // 5. User fills the gap 01:00~02:00 (indices 2, 3)
    snapshot = [...weekState.value]
    weekState.value = [...snapshot]
    toggleRange(0, 2, 3, true)

    output = toStringArray()
    // Should merge into one range 00:00~05:00
    // 00:00~03:00 covers 0-5. 04:00~05:00 covers 8-9.
    // Gap at 6-7 (03:00~04:00).
    expect(output[0]).toEqual(['00:00~03:00', '04:00~05:00'])

    // 6. User deselects middle 02:00~03:00 (indices 4, 5)
    fromStringArray(output)
    snapshot = [...weekState.value]
    weekState.value = [...snapshot]
    toggleRange(0, 4, 5, false)

    output = toStringArray()
    expect(output[0]).toEqual(['00:00~02:00', '04:00~05:00'])
  })
})
