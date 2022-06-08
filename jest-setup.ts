import '@testing-library/jest-dom'
import { vi } from 'vitest'
import { Map } from 'maplibre-gl'
import { map } from './src/stores'
import 'vi-fetch/setup'

vi.mock('maplibre-gl/dist/maplibre-gl', () => ({
  Map: vi.fn(() => ({
    getSource: () => {
      return { tiles: ['https://google.com'] }
    },
    triggerRepaint: () => undefined,
    getStyle: () => {
      return {
        sources: undefined,
        layers: []
      }
    },
    getLayoutProperty: () => undefined,
    setLayoutProperty: () => undefined,
    setPaintProperty: () => undefined,
    getZoom: () => undefined,
    on: () => undefined,
  })),
}))

vi.mock('@watergis/legend-symbol', () => ({
  LegendSymbol: () => undefined}
))

let container: HTMLDivElement
map.set(new Map({ container, style: '' }))
