import { sleep } from './sleep'
import type { Map } from 'maplibre-gl'
export const loadMap = async (map: Map, ms = 100) => {
  if (map) {
    if (!map.loaded()) {
      while (!map.loaded()) {
        await sleep(ms)
      }
    }
    return true
  }
}
