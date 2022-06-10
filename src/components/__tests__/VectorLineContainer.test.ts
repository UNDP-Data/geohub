import { describe, beforeEach, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, within, type RenderResult } from '@testing-library/svelte'
import '@testing-library/jest-dom'

import VectorLineContainer from '$components/controls/VectorLineContainer.svelte'

import layer from './_layer.json'

beforeEach(cleanup)

describe('Vector line Container', () => {
  let sut: RenderResult
  let viewContainer: HTMLElement

  beforeEach(() => {
    vi.resetAllMocks()
    sut = render(VectorLineContainer, { layer })
    viewContainer = sut.getByTestId('line-view-container')
  })

  it('should render the container', () => {
    expect(viewContainer).toBeDefined()
  })

  it('should display the line color', () => {
    const lineColor = sut.getByTitle('rgba(53, 175, 109, 1)')
    expect(lineColor).toBeDefined()
    expect(lineColor).toHaveStyle('background: rgb(53, 175, 109);')
  })

  it('should display the line pattern options', () => {
    const lineOptions = sut.getAllByTitle('Line Option')
    expect(lineOptions).toHaveLength(4)
    expect((lineOptions[0] as HTMLInputElement).checked).toEqual(true)
  })

  it('should display show the advanced panel and form options upon click of toggle', async () => {
    const toggleIcon = sut.getByTestId('legend-toggle-container')
    expect(toggleIcon).toBeDefined()

    await fireEvent.click(toggleIcon)
    expect(sut.getByTestId('line-advanced-container')).toBeDefined()

    const propertyOptions = sut.getByTitle('Property Options')
    expect(within(propertyOptions).getAllByTitle('Property Option').length).toEqual(3)

    const applyToOptions = within(sut.getByTestId('line-advanced-container')).getAllByTitle('Apply To Option')
    expect(applyToOptions.length).toEqual(2)
    expect((applyToOptions[0] as HTMLInputElement).checked).toEqual(true)
    expect((applyToOptions[1] as HTMLInputElement).checked).toEqual(false)

    const colorMapRows = sut.getAllByTestId('intervals-legend-color-map-row-container')
    expect(colorMapRows.length).toEqual(5)

    const classficiationMethods = within(sut.getByTestId('line-advanced-container')).getAllByTitle(
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

  it('should display show the advanced panel and line color/width rows upon click of apply to', async () => {
    const toggleIcon = sut.getByTestId('legend-toggle-container')
    await fireEvent.click(toggleIcon)

    const iconColorRows = sut.getAllByTestId('intervals-legend-color-map-row-container')
    expect(iconColorRows.length).toEqual(5)

    const applyToOptions = within(sut.getByTestId('line-advanced-container')).getAllByTitle('Apply To Option')
    await fireEvent.click(applyToOptions[1])

    const iconSizeRows = sut.getAllByTestId('line-width-row-container')
    expect(iconSizeRows.length).toEqual(5)
  })
})
