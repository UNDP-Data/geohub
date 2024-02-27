import type { Map, RasterTileSource, VectorTileSource } from 'maplibre-gl';

// export const getLayerUrl = (map: Map, layerId: string) => {
//   const source: RasterTileSource | VectorTileSource = map.getSource(map.getLayer(layerId).source) as
//     | RasterTileSource
//     | VectorTileSource
//   if (source.type === 'vector') {
//     // vecctor tile
//     if (source.tiles) {
//       // pbf
//       return source.tiles[0]
//     } else {
//       // tilejson
//       return source.url
//     }
//   } else {
//     // raster tile
//     const tileUrl = new URL(source.tiles[0])
//     // return cog or mosaicjson URL
//     return tileUrl.searchParams.get('url')
//   }
// }

/*
*  retrieves the url fo the layer source property for a caster or vector layer
*  @params {maplibre-gl.Map} map object
#  @params {string} layerId, the id of the layer
*  @return {string}
*/

export const getLayerSourceUrl = (map: Map, layerId: string) => {
	const source: RasterTileSource | VectorTileSource = map.getSource(
		map.getLayer(layerId)?.source
	) as RasterTileSource | VectorTileSource;
	if (source?.tiles) {
		// pbf
		return source.tiles[0];
	} else {
		// tilejson
		return source?.url;
	}
};
