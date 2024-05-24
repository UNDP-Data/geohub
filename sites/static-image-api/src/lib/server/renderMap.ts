import mbgl from '@maplibre/maplibre-gl-native';
import sharp from 'sharp';
import path from 'path';
import { type StyleSpecification } from 'maplibre-gl';
import { getSource } from './sources';

export type extensionFormat = 'jpeg' | 'png' | 'webp';

const EMPTY_BUFFER = Buffer.alloc(0);
const TRANSPARENT_BUFFER: Record<string, Buffer> = {
	png: Buffer.from(
		'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
		'base64'
	),
	webp: Buffer.from('UklGRiYAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==', 'base64'),
	jpeg: Buffer.from(
		'/9j/4AAQSkZJRgABAQEAYABgAAD/4QA6RXhpZgAATU0AKgAAAAgAA1IBAAABTAAKAAAABwAAAABkAQMAAAABAAAA+gEBAAMAAAABAAEAAKACAAQAAAABAAABPKADAAQAAAABAAAA+AAAAABIAAAAAQAAAEgAAAABAAOgAQADAAAAAQABAACgAgAEAAAAAQAAAGmHBAABAAAAAQAAAGgAAAAAAElFQyBvU3BhLjEgNjIgTWFjaW50b3NoKFBsdWdpbnMgTWFj...'
	)
};

const handleFileExt = (uri: string) => {
	// extract extension only, take into account query string or hash
	const basename = path.basename(uri).split(/[?#]/)[0];
	const ext = basename.split('.').pop();
	if (ext === undefined) return null;
	const l = ext.toLowerCase();
	if (l === 'jpg') return 'jpeg';
	return l;
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

	console.debug(
		`Image parameters=width: ${width}; height: ${height}; ratio: ${ratio}; format: ${format}`
	);
	console.debug(`mapOptions: ${JSON.stringify(mapOptions)}`);

	console.debug(`Rendered Map parameters=style.name:${style.name}; layers: ${style.layers.length}`);
	console.info(`Rendered Map sources: `);
	Object.keys(style.sources).forEach((key) => {
		const src = style.sources[key];
		if ('url' in src) {
			console.debug(`- ${src.url}`);
		}
		if ('tiles' in src && src.tiles) {
			console.debug(`- ${src.tiles[0]}`);
		}
	});

	const map = new mbgl.Map({
		request: (req, callback) => {
			let apiUrl = req.url;
			if (apiUrl.startsWith('/api')) {
				apiUrl = `${url.origin}${apiUrl}`;
			}
			const kind = req.kind;

			getSource(apiUrl, kind)
				.then((buf) => {
					if (buf) {
						callback(undefined, { data: buf });
					} else {
						const format = handleFileExt(req.url);
						createEmptyResponse(format, callback);
					}
				})
				.catch(() => {
					const format = handleFileExt(req.url);
					createEmptyResponse(format, callback);
				});
		},
		ratio: ratio
	});

	// icon-overlap property is likely not supported by native, thus remove it from style
	style.layers
		.filter((l) => l.type === 'symbol')
		.forEach((l) => {
			if (l.layout && 'icon-overlap' in l.layout) {
				delete l.layout['icon-overlap'];
			}
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
			map.release();
			if (err) reject(err);

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
 * Create an appropriate mlgl response for http errors.
 * @param {string} format The format (a sharp format or 'pbf').
 * @param {string} color The background color (or empty string for transparent).
 * @param {Function} callback The mlgl callback.
 */
function createEmptyResponse(
	format: string | null,
	callback: {
		(error?: Error | undefined, response?: mbgl.RequestResponse | undefined): void;
		(error?: Error | undefined, response?: mbgl.RequestResponse | undefined): void;
		(arg0: undefined, arg1: { data: Buffer }): void;
	}
) {
	if (format && TRANSPARENT_BUFFER[format]) {
		callback(undefined, { data: TRANSPARENT_BUFFER[format] });
	} else {
		callback(undefined, { data: EMPTY_BUFFER });
	}
}
