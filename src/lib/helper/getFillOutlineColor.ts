import { DEFAULT_FILL_OUTLINE_COLOR } from '$lib/constants'
import type { Map } from 'maplibre-gl'

export const getFillOutlineColor = (map: Map, layerId: string, defaultColor = DEFAULT_FILL_OUTLINE_COLOR): string => {
  let fillOutlineColor = map.getPaintProperty(layerId, 'fill-outline-color')
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  if (!fillOutlineColor || (fillOutlineColor && fillOutlineColor.type === 'interval')) {
    fillOutlineColor = defaultColor
  }
  return fillOutlineColor as string
}
