import { PMTiles } from 'pmtiles';

export const getPMTilesSource = async (sourceUrl: string) => {
	const tileJSON = {
		tilejson: '1.0.0',
		tiles: [`${sourceUrl}/{z}/{x}/{y}`]
	};
	// console.log(tileJSON);
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
	const tile = await p.getZxy(Number(z), Number(x), Number(y));
	// console.log(pmtilesUrl, x, y, z);
	if (tile?.data) {
		const buf = Buffer.from(tile.data);
		return buf;
	} else {
		return null;
	}
};
