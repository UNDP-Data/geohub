import mbgl from '@maplibre/maplibre-gl-native';
import sharp from 'sharp';
import request from 'request';
import pmtiles from 'pmtiles';
import Color from 'color';
import url from 'url';
import path from 'path';
import type { StyleSpecification } from 'maplibre-gl';

export type extensionFormat = 'jpeg' | 'png' | 'webp';

/**
 * Lookup of sharp output formats by file extension.
 */
const extensionToFormat = {
	'.jpg': 'jpeg',
	'.jpeg': 'jpeg',
	'.png': 'png',
	'.webp': 'webp'
};

export const renderMap = async (
	url: URL,
	style: StyleSpecification,
	mapOptions: mbgl.RenderOptions,
	width: number,
	height: number,
	ratio: number,
	format: extensionFormat,
	images?: sharp.OverlayOptions[]
) => {
	console.info(`renderMap: start`);
	console.debug(`Map parameters=style.name:${style.name}; layers: ${style.layers.length}`);
	console.info(`Map sources: `);
	Object.keys(style.sources).forEach((key) => {
		const src = style.sources[key];
		if ('url' in src) {
			console.debug(`- ${src.url}`);
		}
		if ('tiles' in src && src.tiles) {
			console.debug(`- ${src.tiles[0]}`);
		}
	});
	console.debug(
		`Image parameters=width: ${width}; height: ${height}; ratio: ${ratio}; format: ${format}`
	);
	const map = new mbgl.Map({
		request: (req, callback) => {
			let apiUrl = req.url;
			if (apiUrl.startsWith('/api')) {
				apiUrl = `${url.origin}${apiUrl}`;
			}
			// console.log(apiUrl);
			const protocol = apiUrl.split(':')[0];
			const kind = req.kind;
			if (protocol === 'http' || protocol === 'https') {
				getRemoteSource(apiUrl, callback);
				return null;
			} else if (protocol === 'pmtiles') {
				// console.log(req.url);
				if (kind === 2) {
					// source
					getPMTilesSource(apiUrl, callback);
					return null;
				} else if (kind === 3) {
					// tile
					getPMTilesTile(apiUrl, callback);
					return null;
				}
				return null;
			} else {
				return null;
			}
		},
		ratio: ratio
	});
	map.load(style);
	console.info(`renderMap: loaded style`);

	const sharpOptions: sharp.CreateRaw = {
		width: width,
		height: height,
		channels: 4
	};

	const image = await render(map, mapOptions, sharpOptions, ratio, format, images);
	console.info(`renderMap: end`);
	return image;
};

const render = (
	map: mbgl.Map,
	mapOptions: mbgl.RenderOptions,
	sharpOptions: sharp.CreateRaw,
	ratio: number,
	format: extensionFormat,
	images?: sharp.OverlayOptions[]
) => {
	return new Promise<Buffer>((resolve, reject) => {
		map.render(mapOptions, (err, buffer) => {
			if (err) reject(err);
			map.release();

			const options = sharpOptions;
			if (ratio !== 1) {
				options.width = options.width * ratio;
				options.height = options.height * ratio;
			}

			if (!buffer) {
				const msg = 'Buffer is null. Invalid source.';
				console.error(msg);
				reject(msg);
			} else {
				if (images) {
					const image = sharp(buffer, {
						raw: options
					})
						.composite(images)
						.toFormat(format)
						.toBuffer();
					resolve(image);
				} else {
					const image = sharp(buffer, {
						raw: options
					})
						.toFormat(format)
						.toBuffer();
					resolve(image);
				}
			}
		});
	});
};

/**
 * Cache of response data by sharp output format and color.  Entry for empty
 * string is for unknown or unsupported formats.
 */
const cachedEmptyResponses: { [key: string]: Buffer } = {
	'': Buffer.alloc(0)
};

/**
 * Create an appropriate mlgl response for http errors.
 * @param {string} format The format (a sharp format or 'pbf').
 * @param {string} color The background color (or empty string for transparent).
 * @param {Function} callback The mlgl callback.
 */
function createEmptyResponse(format: string, color: string, callback) {
	if (!format || format === 'pbf') {
		callback(null, { data: cachedEmptyResponses[''] });
		return;
	}

	if (format === 'jpg') {
		format = 'jpeg';
	}
	if (!color) {
		color = 'rgba(255,255,255,0)';
	}

	const cacheKey = `${format},${color}`;
	const data = cachedEmptyResponses[cacheKey];
	if (data) {
		callback(null, { data: data });
		return;
	}

	// create an "empty" response image
	const colorObj = new Color(color);
	const array = colorObj.array();
	const channels = array.length === 4 && format !== 'jpeg' ? 4 : 3;
	sharp(Buffer.from(array), {
		raw: {
			width: 1,
			height: 1,
			channels: channels
		}
	})
		.toFormat(format)
		.toBuffer((err, buffer) => {
			if (!err) {
				cachedEmptyResponses[cacheKey] = buffer;
			}
			callback(null, { data: buffer });
		});
}

const getRemoteSource = (sourceUrl: string, callback) => {
	request(
		{
			url: sourceUrl,
			encoding: null,
			gzip: true
		},
		(err, res, body) => {
			const parts = url.parse(sourceUrl);
			const extension = path.extname(parts.pathname).toLowerCase();
			const format = extensionToFormat[extension] || '';
			if (err || res.statusCode < 200 || res.statusCode >= 300) {
				createEmptyResponse(format, '', callback);
				return null;
			}

			const response: mbgl.RequestResponse = {
				data: body
			};

			if (res.headers.modified) {
				response.modified = new Date(res.headers.modified);
			}
			if (res.headers.expires) {
				response.expires = new Date(res.headers.expires);
			}
			if (res.headers.etag) {
				response.etag = res.headers.etag;
			}
			callback(null, response);
		}
	);
};

const getPMTilesSource = async (sourceUrl: string, callback) => {
	const pmtileUrl = sourceUrl.replace('pmtiles://', '');
	const p = new pmtiles.PMTiles(`${pmtileUrl}`);
	const header = await p.getHeader();
	const _url = new URL(pmtileUrl);
	const bounds: number[] = [header.minLon, header.minLat, header.maxLon, header.maxLat];
	const tileJSON = {
		tilejson: '1.0.0',
		tiles: [`pmtiles://${_url.origin}${_url.pathname}/{z}/{x}/{y}${_url.search}`],
		minzoom: header.minZoom,
		maxzoom: header.maxZoom,
		center: [header.centerLon, header.centerLat, header.centerZoom].join(','),
		bounds
	};
	callback(null, { data: Buffer.from(JSON.stringify(tileJSON)) });
};

const getPMTilesTile = async (sourceUrl: string, callback) => {
	const TILE_REGEXP = RegExp('(\\d+)/(\\d+)/(\\d+)');
	const matches = sourceUrl.match(TILE_REGEXP);
	const [z, x, y] = matches.slice(matches.length - 3, matches.length);
	const pmtilesUrl = `${sourceUrl.replace('pmtiles://', '').replace(`/${z}/${x}/${y}`, '')}`;
	const p = new pmtiles.PMTiles(pmtilesUrl);
	const data = await p.getZxy(Number(z), Number(x), Number(y));

	if (data?.data) {
		const response: mbgl.RequestResponse = {
			data: new Uint8Array(data.data),
			etag: data.etag,
			expires: new Date(data.expires)
		};
		callback(null, response);
	} else {
		// create empty response
		const response: mbgl.RequestResponse = {
			data: new Uint8Array()
		};
		callback(null, response);
	}
};
