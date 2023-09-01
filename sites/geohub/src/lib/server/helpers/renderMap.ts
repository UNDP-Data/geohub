import mbgl from '@maplibre/maplibre-gl-native';
import sharp from 'sharp';
import request from 'request';
import * as pmtiles from 'pmtiles';
import type { StyleSpecification } from 'maplibre-gl';

export const renderMap = async (
	url: URL,
	style: StyleSpecification,
	mapOptions: mbgl.RenderOptions,
	width: number,
	height: number,
	ratio: number
) => {
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

	const sharpOptions: sharp.CreateRaw = {
		width: width,
		height: height,
		channels: 4
	};

	const image = await render(map, mapOptions, sharpOptions);
	return image;
};

const render = (map: mbgl.Map, mapOptions: mbgl.RenderOptions, sharpOptions: sharp.CreateRaw) => {
	return new Promise<Buffer>((resolve, reject) => {
		map.render(mapOptions, (err, buffer) => {
			if (err) reject(err);
			map.release();
			const image = sharp(buffer, {
				raw: sharpOptions
			})
				.png()
				.toBuffer();
			resolve(image);
		});
	});
};

const getRemoteSource = (url: string, callback) => {
	request(
		{
			url: url,
			encoding: null,
			gzip: true
		},
		(err, res, body) => {
			if (err || res.statusCode < 200 || res.statusCode >= 300) {
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

const getPMTilesSource = async (url: string, callback) => {
	const pmtileUrl = url.replace('pmtiles://', '');
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

const getPMTilesTile = async (url: string, callback) => {
	const TILE_REGEXP = RegExp('(\\d+)/(\\d+)/(\\d+)');
	const matches = url.match(TILE_REGEXP);
	const [z, x, y] = matches.slice(matches.length - 3, matches.length);
	const pmtilesUrl = `${url.replace('pmtiles://', '').replace(`/${z}/${x}/${y}`, '')}`;
	const p = new pmtiles.PMTiles(pmtilesUrl);
	const data = await p.getZxy(Number(z), Number(x), Number(y));

	const response: mbgl.RequestResponse = {
		data: new Uint8Array(data.data),
		etag: data.etag,
		expires: new Date(data.expires)
	};
	callback(null, response);
};
