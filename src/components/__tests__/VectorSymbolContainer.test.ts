import { describe, beforeEach, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, within, type RenderResult } from '@testing-library/svelte'

import VectorSymbolContainer from '$components/controls/VectorSymbolContainer.svelte'

import layer from './_layer.json'

beforeEach(cleanup)

describe('Vector Symbol Container', () => {
  let sut: RenderResult
  let viewContainer: HTMLElement

  beforeEach(() => {
    vi.resetAllMocks()
    sut = render(VectorSymbolContainer, { layer })
    viewContainer = sut.getByTestId('symbol-view-container')
  })

  it('should render the container', () => {
    expect(viewContainer).toBeDefined()
  })

  it('should display the icon label', () => {
    const iconLabel = sut.getByTitle('circle')
    expect(iconLabel).toBeDefined()
    expect(iconLabel).toHaveTextContent('Circle')
  })

  it('should display the icon size', () => {
    const numberLabel = sut.getByTitle('Number Label')
    expect(numberLabel).toBeDefined()
    expect(numberLabel).toHaveTextContent('1.00')
  })

  it('should display the icon color', () => {
    const colorLabel = sut.getByTitle('rgba(0,0,0,1)')
    expect(colorLabel).toBeDefined()
    expect(colorLabel).toHaveStyle('background: rgb(0, 0, 0);')
  })

  it('should display the overlap priority', () => {
    const slider = sut.getByRole('slider')
    expect(slider).toBeDefined()
    expect(slider.getAttribute('aria-valuetext')).toEqual('Never')
    expect(slider.getAttribute('aria-valuenow')).toEqual('0')
  })

  it('should display the advanced settings container upon click of toggle', async () => {
    const advancedSettingsToggle = sut.getByTitle('Advanced Settings Toggle')
    expect(advancedSettingsToggle).toBeDefined()

    let advancedSettingsContainer = sut.queryByTitle('Advanced Settings Container')
    expect(advancedSettingsContainer).toBeNull()

    await fireEvent.click(advancedSettingsToggle)
    advancedSettingsContainer = sut.getByTitle('Advanced Settings Container')
    expect(advancedSettingsContainer).toBeDefined()

    const horizontalLabel = within(sut.getByTitle('Horizontal Offset')).getByTitle('Number Label')
    expect(horizontalLabel).toBeDefined()
    expect(horizontalLabel).toHaveTextContent('0')

    const verticalLabel = within(sut.getByTitle('Vertical Offset')).getByTitle('Number Label')
    expect(verticalLabel).toBeDefined()
    expect(verticalLabel).toHaveTextContent('0')
  })

  it('should display show the simple/advanced panel upon click of toggle', async () => {
    const toggleIcon = sut.getByTestId('legend-toggle-container')
    expect(toggleIcon).toBeDefined()

    await fireEvent.click(toggleIcon)
    expect(sut.getByTestId('symbol-advanced-container')).toBeDefined()

    await fireEvent.click(toggleIcon)
    expect(sut.getByTestId('symbol-simple-container')).toBeDefined()
  })

  it('should display show the advanced panel and form options upon click of toggle', async () => {
    const toggleIcon = sut.getByTestId('legend-toggle-container')
    expect(toggleIcon).toBeDefined()

    await fireEvent.click(toggleIcon)
    expect(sut.getByTestId('symbol-advanced-container')).toBeDefined()

    const propertyOptions = sut.getByTitle('Property Options')
    expect(within(propertyOptions).getAllByTitle('Property Option').length).toEqual(3)

    const numberOfClasses = within(sut.getByTestId('symbol-advanced-container')).getByTitle('Number Label')
    expect(numberOfClasses).toBeDefined()
    expect(numberOfClasses).toHaveTextContent('5')

    const colorMapRows = sut.getAllByTestId('intervals-legend-color-map-row-container')
    expect(colorMapRows.length).toEqual(5)

    const applyToOptions = within(sut.getByTestId('symbol-advanced-container')).getAllByTitle('Apply To Option')
    expect(applyToOptions.length).toEqual(2)
    expect((applyToOptions[0] as HTMLInputElement).checked).toEqual(true)
    expect((applyToOptions[1] as HTMLInputElement).checked).toEqual(false)

    const classficiationMethods = within(sut.getByTestId('symbol-advanced-container')).getAllByTitle(
      'Classification Method',
    )
    expect(classficiationMethods.length).toEqual(3)
  })

  it('should display show the advanced panel and icon color/size rows upon click of apply to', async () => {
    const toggleIcon = sut.getByTestId('legend-toggle-container')
    await fireEvent.click(toggleIcon)

    const iconColorRows = sut.getAllByTestId('intervals-legend-color-map-row-container')
    expect(iconColorRows.length).toEqual(5)

    const applyToOptions = within(sut.getByTestId('symbol-advanced-container')).getAllByTitle('Apply To Option')
    await fireEvent.click(applyToOptions[1])

    const iconSizeRows = sut.getAllByTestId('icon-size-row-container')
    expect(iconSizeRows.length).toEqual(5)
  })
})
