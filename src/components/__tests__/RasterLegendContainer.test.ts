import { describe, beforeEach, expect, it } from 'vitest'
import { cleanup, render, fireEvent, within, type RenderResult } from '@testing-library/svelte'

import RasterLegendContainer from '$components/RasterLegendContainer.svelte'
import { ClassificationMethodTypes, COLOR_CLASS_COUNT, DEFAULT_COLORMAP } from '$lib/constants'
import type { Layer } from '$lib/types'

const layer: Layer = {
  definition: {
    id: '',
    type: 'raster',
    source: '0',
  },
  info: {
    band_metadata: [
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore:next-line
      ['1', {}],
    ],
  },
  colorMapName: DEFAULT_COLORMAP,
  continuous: {
    minimum: 0,
    maximum: 100,
  },
  intervals: {
    classification: ClassificationMethodTypes.EQUIDISTANT,
    numberOfClasses: COLOR_CLASS_COUNT,
    colorMapRows: [],
  },
}

beforeEach(cleanup)

describe('Raster Legend Container', () => {
  let sut: RenderResult
  let viewContainer: HTMLElement

  beforeEach(() => {
    sut = render(RasterLegendContainer, { layer })
    viewContainer = sut.getByTestId('raster-legend-view-container')
  })

  it('should render the container', () => {
    expect(viewContainer).toBeDefined()
  })

  it('should render the default legend type: continuous', () => {
    expect(within(viewContainer).getByTestId('continous-view-container')).toBeDefined()
  })

  it('should toggle between continuous / intervals legend types upon click of toggle icon', async () => {
    const toggleIcon = within(viewContainer).getByTestId('legend-toggle-container')
    expect(toggleIcon).toBeDefined()

    // show intervals legend type
    await fireEvent.click(toggleIcon)
    expect(within(viewContainer).getByTestId('intervals-view-container')).toBeDefined()

    // show continuous legend type
    await fireEvent.click(toggleIcon)
    expect(within(viewContainer).getByTestId('continous-view-container')).toBeDefined()
  })
})
