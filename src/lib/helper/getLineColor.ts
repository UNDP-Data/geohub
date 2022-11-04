import { DEFAULT_LINE_COLOR } from '$lib/constants'
import type { Map } from 'maplibre-gl'

export const getLineColor = (map: Map, layerId: string, defaultColor = DEFAULT_LINE_COLOR): string => {
  let lineColor = map.getPaintProperty(layerId, 'line-color')
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  if (!lineColor || (lineColor && lineColor.type === 'interval')) {
    lineColor = defaultColor
  }
  return lineColor as string
}
