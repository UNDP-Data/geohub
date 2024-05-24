import { getRemoteSource } from './http';
import { getPMTilesSource, getPMTilesTile } from './pmtiles';

/**
 * retrieve sources from the uri
 * @param uri
 * @param kind 2: source, 3: tile, 4: glyph, 5: sprite image, 6: sprite json, 7: image source
 * @returns
 */
export const getSource = async (uri: string, kind: number): Promise<Buffer | null> => {
	let data: Buffer | null = null;

	const protocol = uri.split(':')[0];
	console.log(kind, protocol, uri);

	if (['http', 'https'].includes(protocol)) {
		data = await getRemoteSource(uri);
	} else if (protocol === 'pmtiles') {
		if (kind === 2) {
			// source
			data = await getPMTilesSource(uri);
		} else if (kind === 3) {
			// tile
			data = await getPMTilesTile(uri);
		}
	}

	return data;
};
