import '@testing-library/jest-dom'
import { vi } from 'vitest'
import { Map } from 'maplibre-gl'
import { map } from './src/stores'

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
