import type { Map } from 'maplibre-gl'

export const getIconColor = (map: Map, layerId: string, defaultColor = '#000000'): string => {
  let iconColor = map.getPaintProperty(layerId, 'icon-color')
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  if (!iconColor || (iconColor && iconColor.type === 'interval')) {
    iconColor = defaultColor
  }
  return iconColor as string
}
