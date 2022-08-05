import { describe, beforeEach, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, within } from '@testing-library/svelte'
import type { RenderResult } from '@testing-library/svelte'
import UniqueValuesLegendColorMapRow from '$components/UniqueValuesLegendColorMapRow.svelte'
import type { IntervalLegendColorMapRow } from '$lib/types'

import layer from './_layer.json'

const colorMapRow: IntervalLegendColorMapRow = { index: 0, color: [68, 1, 84, 255], start: 11, end: 'Rice Village' }

beforeEach(cleanup)

describe('Unique Values Legend : Color Map', () => {
  let sut: RenderResult
  let viewContainer: HTMLElement

  beforeEach(() => {
    sut = render(UniqueValuesLegendColorMapRow, {
      colorMapRow,
      colorPickerVisibleIndex: -1,
      layer,
    })
    viewContainer = sut.getByTestId('unique-legend-color-map-row-container')
  })

  it('should render the container', () => {
    expect(viewContainer).toBeDefined()
  })
})
//
//   it('should display the start, end and color value', () => {
//     expect(within(viewContainer).getByAltText('Start Value')).toHaveValue('11')
//     expect(within(viewContainer).getByAltText('End Value')).toHaveValue('Rice Village')
//   })
//
//   it('should called the dispatch event upon click of colour', async () => {
//     const colorMapControl = sut.getByTitle('Color Map Control')
//     expect(colorMapControl).toBeDefined()
//
//     const mockcolorMapControlEvent = vi.fn()
//     let dispatchContent = []
//
//     sut.component.$on('clickColorPicker', function (event) {
//       mockcolorMapControlEvent(event.detail)
//       dispatchContent = event.detail
//     })
//
//     await fireEvent.click(colorMapControl)
//     expect(mockcolorMapControlEvent).toHaveBeenCalled()
//     expect(dispatchContent).toEqual({ index: 0 })
//   })
// })
//
// describe('Intervals Legend : Color Map : Open/Close Color Picker', () => {
//   let sut: RenderResult
//   let viewContainer: HTMLElement
//
//   beforeEach(() => {
//     sut = render(UniqueValuesLegendColorMapRow, {
//       colorMapRow,
//       colorPickerVisibleIndex: 0,
//       layer,
//     })
//     viewContainer = sut.getByTestId('unique-legend-color-map-row-container')
//   })
//
//   it('should render the container', () => {
//     expect(viewContainer).toBeDefined()
//   })
//
//   it('should display the color map picker', async () => {
//     expect(within(viewContainer).getByTestId('default-color-picker-container')).toBeVisible()
//   })
// })
