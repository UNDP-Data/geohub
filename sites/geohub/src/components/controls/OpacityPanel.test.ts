import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { Map, type StyleSpecification } from 'maplibre-gl'
import { map } from '$stores'

describe('Opacity Panel', () => {
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
        id: 'testLayer',
        type: 'fill',
        source: 'carto',
        'source-layer': 'landcover',
        paint: {
          'fill-color': 'rgba(255,0,0,1)',
        },
      },
    ],
  }
  const mockGetLayerStyle = vi.fn()
  let mapContainer: HTMLDivElement
  let _map: Map

  beforeEach(() => {
    // create map instance to set to stores
    mapContainer = document.createElement('div')
    _map = new Map({
      container: mapContainer,
      style: style,
    })
    map.update(() => _map)

    const spy = vi.spyOn(_map, 'getPaintProperty')
    spy.mockImplementation(mockGetLayerStyle)
  })
  afterEach(() => {
    vi.clearAllMocks()
  })
  it('Should check the map exists', () => {
    expect(_map).toBeDefined()
  })
})
