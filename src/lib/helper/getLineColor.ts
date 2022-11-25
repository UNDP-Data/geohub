import chroma from 'chroma-js'
import type { Map } from 'maplibre-gl'

export const getLineColor = (map: Map, layerId: string, defaultColor = chroma.random().hex()): string => {
  let lineColor = map.getPaintProperty(layerId, 'line-color')
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  if (!lineColor || (lineColor && lineColor.type === 'interval')) {
    lineColor = defaultColor
  }
  return lineColor as string
}
