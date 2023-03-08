import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/svelte'
import FillColor from './FillColor.svelte'
import type { Layer } from '$lib/types'
import { Map } from 'maplibre-gl'
import { map } from '$stores'

describe('FillColor component', () => {
  let mapContainer: HTMLDivElement
  let _map: Map

  beforeEach(() => {
    vi.mock('maplibre-gl', () => ({
      Map: vi.fn(() => ({
        on: vi.fn(),
        getPaintProperty: vi.fn(() => {
          return 'rgba(255,0,0,1)'
        }),
      })),
    }))

    mapContainer = document.createElement('div')

    _map = new Map({
      container: mapContainer,
      style: {
        version: 8,
        name: 'Voyager',
        sources: {
          carto: {
            type: 'vector',
            url: 'https://tiles.basemaps.cartocdn.com/vector/carto.streets/v1/tiles.json',
          },
        },
        sprite: 'https://undp-data.github.io/style/sprite/sprite',
        glyphs: 'https://tiles.basemaps.cartocdn.com/fonts/{fontstack}/{range}.pbf',
        layers: [
          {
            id: 'landcover',
            type: 'fill',
            source: 'carto',
            'source-layer': 'landcover',
            paint: {
              'fill-color': 'rgba(255,0,0,1)',
              'fill-opacity': 1,
            },
          },
        ],
      },
    })
    map.update(() => _map)
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('Should render it from style.json', () => {
    const layer: Layer = {
      id: 'landcover',
      name: 'landcover',
    }

    render(FillColor, { props: { layer: layer, defaultColor: 'rgba(0,0,0,1)' } })
    expect(screen.getAllByTestId('color-palette')).toBeTruthy()

    const fillColor = _map.getPaintProperty(layer.id, 'fill-color')
    console.log(fillColor)
    expect(fillColor).toBe('rgba(255,0,0,1)')
  })
})
