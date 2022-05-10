import { describe, beforeEach, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, within, type RenderResult } from '@testing-library/svelte'

import IntervalsLegendColorMapRow from '$components/IntervalsLegendColorMapRow.svelte'
import type { IntervalLegendColorMapRow } from '$lib/types'

import layer from './_layer.json'

const colorMapRow: IntervalLegendColorMapRow = { index: 0, color: [68, 1, 84, 255], start: 100, end: 100.6 }

beforeEach(cleanup)

describe('Intervals Legend : Color Map', () => {
  let sut: RenderResult
  let cardContainer: HTMLElement

  beforeEach(() => {
    sut = render(IntervalsLegendColorMapRow, {
      colorMapRow,
      colorPickerVisibleIndex: -1,
      layer,
    })
    cardContainer = sut.getByTestId('intervals-legend-color-map-row-container')
  })

  it('should render the container', () => {
    expect(cardContainer).toBeDefined()
  })

  it('should display the start, end and color value', () => {
    expect(within(cardContainer).getByAltText('Start Value')).toHaveValue(100)
    expect(within(cardContainer).getByAltText('End Value')).toHaveValue(100.6)
    expect(within(cardContainer).getByTitle('Color Map Control')).toHaveStyle(
      'caret-color:rgb(68,1,84,255); background-color: rgb(68,1,84,255)',
    )
  })

  it('should called the dispatch event upon click of colour', async () => {
    const colorMapControl = sut.getByTitle('Color Map Control')
    expect(colorMapControl).toBeDefined()

    const mockcolorMapControlEvent = vi.fn()
    let dispatchContent = []

    sut.component.$on('clickColorPicker', function (event) {
      mockcolorMapControlEvent(event.detail)
      dispatchContent = event.detail
    })

    await fireEvent.click(colorMapControl)
    expect(mockcolorMapControlEvent).toHaveBeenCalled()
    expect(dispatchContent).toEqual({ index: 0 })
  })
})

describe('Intervals Legend : Color Map : Open/Close Color Picker', () => {
  let sut: RenderResult
  let cardContainer: HTMLElement

  beforeEach(() => {
    sut = render(IntervalsLegendColorMapRow, {
      colorMapRow,
      colorPickerVisibleIndex: 0,
      layer,
    })
    cardContainer = sut.getByTestId('intervals-legend-color-map-row-container')
  })

  it('should render the container', () => {
    expect(cardContainer).toBeDefined()
  })

  it('should display the color map picker', async () => {
    expect(within(cardContainer).getByTestId('raster-color-picker-container')).toBeVisible()
  })
})
