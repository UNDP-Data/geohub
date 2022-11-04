import { describe, beforeEach, expect, it } from 'vitest'
import { cleanup, render, within, type RenderResult } from '@testing-library/svelte'

import ColorMapPickerCard from '$components/controls/ColorMapPickerCard.svelte'
import { DEFAULT_COLORMAP, ColorMapTypes } from '$lib/constants'

beforeEach(cleanup)

describe('Color Map Picker Card : Card Style', () => {
  let sut: RenderResult
  let cardContainer: HTMLElement

  beforeEach(() => {
    sut = render(ColorMapPickerCard, {
      colorMapName: DEFAULT_COLORMAP,
      colorMapType: ColorMapTypes.SEQUENTIAL,
      isSelected: false,
      layerMin: 100,
      layerMax: 103,
      numberOfClasses: 5,
      isCardStyle: true,
    })
    cardContainer = sut.getByTestId('color-map-picker-card-container')
  })

  it('should render the container', () => {
    expect(cardContainer).toBeDefined()
  })

  it('should render the default color type name', () => {
    expect(within(cardContainer).getByText(DEFAULT_COLORMAP)).toBeDefined()
  })

  it('should render the color map style', () => {
    const colorMapFigure = within(cardContainer).getByTestId('color-map-figure')
    expect(colorMapFigure).toHaveStyle({
      height: 'calc(1px * 30)',
      width: 'calc(2px * 30)',
    })
  })

  it('should not render the check mark', () => {
    const colorMapFigure = within(cardContainer).queryByTitle('Colormap Selected')
    expect(colorMapFigure).toBeNull()
  })
})

describe('Color Map Picker Card : Card Style : Selected', () => {
  let sut: RenderResult
  let cardContainer: HTMLElement

  beforeEach(() => {
    sut = render(ColorMapPickerCard, {
      colorMapName: DEFAULT_COLORMAP,
      colorMapType: ColorMapTypes.SEQUENTIAL,
      isSelected: true,
      layerMin: 100,
      layerMax: 103,
      numberOfClasses: 5,
      isCardStyle: true,
    })
    cardContainer = sut.getByTestId('color-map-picker-card-container')
  })

  it('should render the check mark', () => {
    const colorMapFigure = within(cardContainer).queryByTitle('Colormap Selected')
    expect(colorMapFigure).not.toBeNull()
  })
})

describe('Color Map Picker Card : List Style', () => {
  let sut: RenderResult
  let cardContainer: HTMLElement

  beforeEach(() => {
    sut = render(ColorMapPickerCard, {
      colorMapName: DEFAULT_COLORMAP,
      colorMapType: ColorMapTypes.SEQUENTIAL,
      isSelected: false,
      layerMin: 100,
      layerMax: 103,
      numberOfClasses: 5,
      isCardStyle: false,
    })
    cardContainer = sut.getByTestId('color-map-picker-card-container')
  })

  it('should render the color map style', () => {
    const colorMapFigure = within(cardContainer).getByTestId('color-map-figure')
    expect(colorMapFigure).toHaveStyle({
      height: '15px',
      width: '250px',
    })
  })
})
