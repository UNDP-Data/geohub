import type { Map, RasterTileSource } from 'maplibre-gl';
/**
 * Get a value from Raster Tile URL which is specified
 * @param map Maplibre Map object
 * @param layerId Layer ID
 * @param paramName query param name
 * @returns
 * return string value for 'colormap_name' and 'expression'.
 * return number[] for 'rescale'
 * return number[][][]  or {[key: string]: number[]}  for 'colormap'
 */
export const getValueFromRasterTileUrl = (
	map: Map,
	layerId: string,
	paramName:
		| 'colormap_name'
		| 'rescale'
		| 'expression'
		| 'colormap'
		| 'url'
		| 'algorithm'
		| 'algorithm_params'
		| 'bidx'
		| 'nodata'
): string | number[] | number[][][] | { [key: string]: number[] } => {
	const mapLayer = map.getLayer(layerId);
	const source: RasterTileSource = map.getSource(mapLayer.source) as RasterTileSource;
	if (!['raster', 'raster-dem'].includes(source.type)) {
		throw new Error(`Invalid source type: ${source.type}`);
	}
	if (!(source && source.tiles && source.tiles.length > 0)) return;
	const tileUrl = new URL(source.tiles[0]);
	let value: string | number[] | number[][][] | { [key: string]: number[] } =
		tileUrl.searchParams.get(paramName);
	if (value && paramName === 'rescale') {
		const values = value.split(',');
		value = values.map((v) => Number(v));
	} else if (value && paramName === 'colormap') {
		if (Array.isArray(value)) {
			// interval
			value = JSON.parse(value) as number[][][];
		} else {
			// unique
			value = JSON.parse(value) as unknown as { [key: string]: number[] };
		}
	}
	return value;
};
