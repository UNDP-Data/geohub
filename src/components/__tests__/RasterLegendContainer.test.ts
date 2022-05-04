import { describe, beforeEach, expect, it, vi } from 'vitest'
import { cleanup, render, fireEvent, within, type RenderResult } from '@testing-library/svelte'
import { Map } from 'maplibre-gl'

import RasterLegendContainer from '$components/RasterLegendContainer.svelte'
import { DEFAULT_COLORMAP } from '$lib/constants'
import type { Layer } from '$lib/types'
import { map } from '$stores'

vi.mock('maplibre-gl/dist/maplibre-gl', () => ({
  Map: vi.fn(() => ({
    getSource: () => {
      return { tiles: ['https://google.com'] }
    },
    triggerRepaint: () => undefined,
  })),
}))

let container: HTMLDivElement
map.set(new Map({ container, style: '' }))

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
}

beforeEach(cleanup)

describe('Raster Legend Container', () => {
  let sut: RenderResult
  let viewContainer: HTMLElement

  beforeEach(() => {
    sut = render(RasterLegendContainer, { activeColorMapName: DEFAULT_COLORMAP, layer })
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
