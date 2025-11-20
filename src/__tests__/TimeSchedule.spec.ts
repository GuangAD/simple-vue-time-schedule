import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TimeSchedule from '../TimeSchedule.vue'

describe('TimeSchedule', () => {
  it('renders properly', () => {
    const wrapper = mount(TimeSchedule)
    expect(wrapper.find('.schedule-calendar').exists()).toBe(true)
  })

  it('renders with custom text config', () => {
    const wrapper = mount(TimeSchedule, {
      props: {
        textConfig: {
          am: 'Morning',
          pm: 'Afternoon'
        }
      }
    })
    expect(wrapper.text()).toContain('Morning')
    expect(wrapper.text()).toContain('Afternoon')
  })

  it('applies theme styles', () => {
    const wrapper = mount(TimeSchedule, {
      props: {
        theme: {
          primaryColor: 'red'
        }
      }
    })
    const style = wrapper.attributes('style')
    expect(style).toContain('--schedule-primary-color: red')
  })

  it('renders correct number of rows based on dateList', () => {
    const dateList = ['Mon', 'Tue']
    const wrapper = mount(TimeSchedule, {
      props: {
        dateList
      }
    })
    // 1 header row + 1 time label row + 2 data rows + 1 footer row (default)
    // Header rows are in thead, data rows in tbody.
    // thead has 2 rows. tbody has dateList.length + 1 (footer)
    expect(wrapper.findAll('tbody tr').length).toBe(dateList.length + 1)
  })
})
