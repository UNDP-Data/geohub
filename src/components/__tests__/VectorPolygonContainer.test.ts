import { describe, beforeEach, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, within, type RenderResult } from '@testing-library/svelte'

import VectorPolygonContainer from '$components/controls/VectorPolygonContainer.svelte'

import layer from './_layer.json'

beforeEach(cleanup)

describe('Vector Symbol Container', () => {
  let sut: RenderResult
  let viewContainer: HTMLElement

  beforeEach(() => {
    vi.resetAllMocks()
    sut = render(VectorPolygonContainer, { layer })
    viewContainer = sut.getByTestId('polygon-view-container')
  })

  it('should render the container', () => {
    expect(viewContainer).toBeDefined()
  })

  it('should display the fill color', () => {
    const fillColor = sut.getByTitle('rgba(53, 175, 109, 1)')
    expect(fillColor).toBeDefined()
    expect(fillColor).toHaveStyle('background: rgba(53, 175, 109, 1);')
  })

  it('should display the fill outline color', () => {
    const fillColor = sut.getByTitle('rgba(110, 110, 110, 1)')
    expect(fillColor).toBeDefined()
    expect(fillColor).toHaveStyle('background: rgba(110, 110, 110, 1);')
  })

  it('should display show the simple/advanced panel upon click of toggle', async () => {
    const toggleIcon = sut.getByTestId('legend-toggle-container')
    expect(toggleIcon).toBeDefined()

    await fireEvent.click(toggleIcon)
    expect(sut.getByTestId('polygon-advanced-container')).toBeDefined()

    await fireEvent.click(toggleIcon)
    expect(sut.getByTestId('polygon-simple-container')).toBeDefined()
  })

  it('should display show the advanced panel and form options upon click of toggle', async () => {
    const toggleIcon = sut.getByTestId('legend-toggle-container')
    expect(toggleIcon).toBeDefined()

    await fireEvent.click(toggleIcon)
    expect(sut.getByTestId('polygon-advanced-container')).toBeDefined()

    const propertyOptions = sut.getByTitle('Property Options')
    expect(within(propertyOptions).getAllByTitle('Property Option').length).toEqual(3)

    const numberOfClasses = within(sut.getByTestId('polygon-advanced-container')).getByTitle('Number Label')
    expect(numberOfClasses).toBeDefined()
    expect(numberOfClasses).toHaveTextContent('5')

    const colorMapRows = sut.getAllByTestId('intervals-legend-color-map-row-container')
    expect(colorMapRows.length).toEqual(5)

    const classficiationMethods = within(sut.getByTestId('polygon-advanced-container')).getAllByTitle(
      'Classification Method',
    )
    expect(classficiationMethods.length).toEqual(3)
  })

  it('should display show display the color picker upon click of the color map picker button', async () => {
    const colorMapPickerButton = sut.getByTestId('colormap-toggle-container')
    expect(colorMapPickerButton).toBeDefined()

    await fireEvent.click(colorMapPickerButton)
    const colorMapPicker = sut.getByTestId('color-map-picker')
    expect(colorMapPicker).toBeDefined()
  })
})
