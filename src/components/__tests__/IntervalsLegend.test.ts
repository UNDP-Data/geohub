import { describe, beforeEach, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, within, type RenderResult } from '@testing-library/svelte'

import IntervalsLegend from '$components/IntervalsLegend.svelte'

import layer from './_layer.json'

beforeEach(cleanup)

describe('Intervals Legend', () => {
  let sut: RenderResult
  let viewContainer: HTMLElement

  beforeEach(() => {
    vi.resetAllMocks()
    sut = render(IntervalsLegend, {
      layerConfig: layer,
      numberOfClasses: 5,
      colorPickerVisibleIndex: -1,
    })
    viewContainer = sut.getByTestId('intervals-view-container')
  })

  it('should render the container', () => {
    expect(viewContainer).toBeDefined()
  })

  it('should display the number of classes', () => {
    const numberOfClasses = sut.getByTitle('Number Label')
    expect(numberOfClasses).toBeDefined()
    expect(numberOfClasses).toHaveTextContent('5')

    const colorMapRows = sut.getAllByTestId('intervals-legend-color-map-row-container')
    expect(colorMapRows.length).toEqual(5)
  })

  it('should decrease the number of classes upon click of decrease button', async () => {
    const decreaseClassesButton = sut.getByTitle('Decrease number')
    expect(decreaseClassesButton).toBeDefined()
    let colorMapRows = sut.getAllByTestId('intervals-legend-color-map-row-container')
    expect(colorMapRows.length).toEqual(5)

    await fireEvent.click(decreaseClassesButton)
    colorMapRows = sut.getAllByTestId('intervals-legend-color-map-row-container')
    expect(colorMapRows.length).toEqual(4)

    await fireEvent.click(decreaseClassesButton)
    colorMapRows = sut.getAllByTestId('intervals-legend-color-map-row-container')
    expect(colorMapRows.length).toEqual(3)

    expect(within(colorMapRows[0]).getByTitle('Start Value')).toHaveValue(100)
    expect(within(colorMapRows[0]).getByTitle('End Value')).toHaveValue(101)
    expect(within(colorMapRows[1]).getByTitle('Start Value')).toHaveValue(101)
    expect(within(colorMapRows[1]).getByTitle('End Value')).toHaveValue(102)
    expect(within(colorMapRows[2]).getByTitle('Start Value')).toHaveValue(102)
    expect(within(colorMapRows[2]).getByTitle('End Value')).toHaveValue(103)
  })

  it('should increase the number of classes upon click of increase button', async () => {
    vi.useRealTimers()
    const increaseClassesButton = sut.getByTitle('Increase number')
    expect(increaseClassesButton).toBeDefined()

    // number of classes updated
    let colorMapRows = sut.getAllByTestId('intervals-legend-color-map-row-container')
    expect(colorMapRows.length).toEqual(5)

    await fireEvent.click(increaseClassesButton)
    colorMapRows = sut.getAllByTestId('intervals-legend-color-map-row-container')
    expect(colorMapRows.length).toEqual(6)

    await fireEvent.click(increaseClassesButton)
    colorMapRows = sut.getAllByTestId('intervals-legend-color-map-row-container')
    expect(colorMapRows.length).toEqual(7)

    // input values updated
    expect(within(colorMapRows[0]).getByTitle('Start Value')).toHaveValue(100)
    expect(within(colorMapRows[0]).getByTitle('End Value')).toHaveValue(100.43)
    expect(within(colorMapRows[6]).getByTitle('Start Value')).toHaveValue(102.57)
    expect(within(colorMapRows[6]).getByTitle('End Value')).toHaveValue(103)
  })

  it('should change the start/end values upon change of classification methods', async () => {
    const classificationMethods = sut.getByTitle('Classification Methods')
    expect(classificationMethods).toBeDefined()
    expect(within(classificationMethods).getAllByRole('option').length).toEqual(3)
    await fireEvent.change(classificationMethods, { target: { value: 'l' } })

    const colorMapRows = sut.getAllByTestId('intervals-legend-color-map-row-container')
    expect(within(colorMapRows[0]).getByTitle('Start Value')).toHaveValue(100)
    expect(within(colorMapRows[0]).getByTitle('End Value')).toHaveValue(100.59)
    expect(within(colorMapRows[4]).getByTitle('Start Value')).toHaveValue(102.39)
    expect(within(colorMapRows[4]).getByTitle('End Value')).toHaveValue(103)
  })

  it('should change the start/end value upon change of start/end value', async () => {
    const colorMapRows = sut.getAllByTestId('intervals-legend-color-map-row-container')

    // end value: should set next start value
    const endValue = within(colorMapRows[0]).getByTitle('End Value')
    await fireEvent.input(endValue, { target: { value: 100 } })
    expect(within(colorMapRows[0]).getByTitle('End Value')).toHaveValue(100)
    expect(within(colorMapRows[1]).getByTitle('Start Value')).toHaveValue(100)

    // start value: should set previous end value
    const startValue = within(colorMapRows[4]).getByTitle('Start Value')
    await fireEvent.input(startValue, { target: { value: 200 } })
    expect(within(colorMapRows[4]).getByTitle('Start Value')).toHaveValue(200)
    expect(within(colorMapRows[3]).getByTitle('End Value')).toHaveValue(200)
  })
})
