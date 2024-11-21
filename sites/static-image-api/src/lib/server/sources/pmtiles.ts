import { PMTiles } from 'pmtiles';
import geojsonVt from 'geojson-vt';
import { VectorTile } from '@mapbox/vector-tile';
import Pbf from 'pbf';
import vtpbf from 'vt-pbf';

export const getPMTilesSource = async (sourceUrl: string) => {
	const tileJSON = {
		tilejson: '1.0.0',
		tiles: [`${sourceUrl}/{z}/{x}/{y}`]
	};
	const data = Buffer.from(JSON.stringify(tileJSON));
	return data;
};

export const getPMTilesTile = async (sourceUrl: string) => {
	const TILE_REGEXP = RegExp('(\\d+)/(\\d+)/(\\d+)');
	const matches = sourceUrl.match(TILE_REGEXP);
	if (!matches) return null;
	const [z, x, y] = matches.slice(matches.length - 3, matches.length);
	const pmtilesUrl = `${sourceUrl.replace('pmtiles://', '').replace(`/${z}/${x}/${y}`, '')}`;
	const p = new PMTiles(pmtilesUrl);

	const metadata = await p.getHeader();
	const maxzoom = metadata.maxZoom;

	let adjustedZ = Number(z);
	let adjustedX = Number(x);
	let adjustedY = Number(y);

	if (maxzoom && adjustedZ > maxzoom) {
		// fix for overzooming

		// get tile index at max zoom of source
		const zoomDiff = parseInt((adjustedZ - maxzoom).toFixed(0));
		adjustedZ = maxzoom;
		adjustedX = Math.floor(adjustedX / Math.pow(2, zoomDiff));
		adjustedY = Math.floor(adjustedY / Math.pow(2, zoomDiff));

		// get a tile from max zoom level
		const tile = await p.getZxy(adjustedZ, adjustedX, adjustedY);
		if (tile?.data) {
			const pbf = new Pbf(tile.data);
			const vectorTile = new VectorTile(pbf);

			const data: { [key: string]: geojsonVt.Tile } = {};

			// generate tiles from geojson each layer
			Object.keys(vectorTile.layers).forEach((layerName) => {
				const layer = vectorTile.layers[layerName];
				const fc = { type: 'FeatureCollection', features: [] };
				for (let i = 0; i < layer.length; i++) {
					const feature = layer.feature(i).toGeoJSON(adjustedX, adjustedY, adjustedZ);
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					// @ts-ignore
					fc.features.push(feature);
				}

				const tileIndex = geojsonVt(fc as geojsonVt.Data, {
					maxZoom: Number(z),
					indexMaxZoom: Number(z)
				});
				const requestedTile = tileIndex.getTile(Number(z), Number(x), Number(y));
				if (requestedTile) {
					data[layerName] = requestedTile;
				}
			});
			// create vector tiles from multiple layers
			const buffer = vtpbf.fromGeojsonVt(data as unknown as Record<string, vtpbf.GeoJSONVTData>);
			return buffer;
		} else {
			return null;
		}
	} else {
		// if requested tile zoom is less than maxzoom
		const tile = await p.getZxy(adjustedZ, adjustedX, adjustedY);
		if (tile?.data) {
			const buf = Buffer.from(tile.data);
			return buf;
		} else {
			return null;
		}
	}
};
