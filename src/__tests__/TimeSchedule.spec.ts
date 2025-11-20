import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TimeSchedule from '../TimeSchedule.vue'

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
})
