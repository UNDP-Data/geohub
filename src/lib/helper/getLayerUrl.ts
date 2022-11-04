import type { Map, RasterTileSource, VectorTileSource } from 'maplibre-gl'

export const getLayerUrl = (map: Map, layerId: string) => {
  const source: RasterTileSource | VectorTileSource = map.getSource(map.getLayer(layerId).source) as
    | RasterTileSource
    | VectorTileSource
  if (source.type === 'vector') {
    // vecctor tile
    if (source.tiles) {
      // pbf
      return source.tiles[0]
    } else {
      // tilejson
      return source.url
    }
  } else {
    // raster tile
    const tileUrl = new URL(source.tiles[0])
    // return cog or mosaicjson URL
    return tileUrl.searchParams.get('url')
  }
}
