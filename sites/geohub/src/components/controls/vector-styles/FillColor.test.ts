import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/svelte'
import FillColor from './FillColor.svelte'
import type { Layer } from '$lib/types'
import { Map, type StyleSpecification } from 'maplibre-gl'
import { map } from '$stores'

const style: StyleSpecification = {
  version: 8,
  sources: {
    carto: {
      type: 'vector',
      url: 'https://tiles.basemaps.cartocdn.com/vector/carto.streets/v1/tiles.json',
    },
  },
  layers: [
    {
      id: 'landcover',
      type: 'fill',
      source: 'carto',
      'source-layer': 'landcover',
      paint: {
        'fill-color': 'rgba(255,0,0,1)',
      },
    },
  ],
}

describe('FillColor component', () => {
  let mapContainer: HTMLDivElement
  let _map: Map

  beforeEach(() => {
    // create mock of Map object for this test
    vi.mock('maplibre-gl', () => ({
      Map: vi.fn(() => ({
        getPaintProperty: vi.fn(
          (id: string, property: string) => style.layers.find((l) => l.id === id).paint[property],
        ),
      })),
    }))

    // create map instance to set to stores
    mapContainer = document.createElement('div')

    _map = new Map({
      container: mapContainer,
      style: style,
    })
    map.update(() => _map)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('Should render it from style.json', () => {
    const layer: Layer = {
      id: 'landcover',
      name: 'landcover',
    }

    render(FillColor, { props: { layer: layer, defaultColor: 'rgba(0,0,0,1)' } })
    expect(screen.getAllByTestId('color-palette')).toBeTruthy()

    const fillColor = _map.getPaintProperty(layer.id, 'fill-color')
    expect(fillColor).toBe('rgba(255,0,0,1)')
  })
})
