import type { Map, RasterTileSource } from 'maplibre-gl'

/**
 * Get a value from Raster Tile URL which is specified
 * @param map Maplibre Map object
 * @param layerId Layer ID
 * @param paramName query param name
 * @returns return string value for 'colormap_name' and 'expression'. return number[] for 'rescale'
 */
export const getValueFromRasterTileUrl = (
  map: Map,
  layerId: string,
  paramName: 'colormap_name' | 'rescale' | 'expression',
): string | number[] => {
  const source: RasterTileSource = map.getSource(map.getLayer(layerId).source) as RasterTileSource
  if (source.type !== 'raster') {
    throw new Error(`Invalid source type: ${source.type}`)
  }
  const tileUrl = new URL(source.tiles[0])
  let value: string | number[] = tileUrl.searchParams.get(paramName)
  if (value && paramName === 'rescale') {
    const values = value.split(',')
    value = values.map((v) => Number(v))
  }
  return value
}
