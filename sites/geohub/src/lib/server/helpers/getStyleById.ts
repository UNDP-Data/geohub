import DatabaseManager from '$lib/server/DatabaseManager';
import type { DashboardMapStyle } from '$lib/types';
import { createStyleLinks } from './createStyleLinks';
import { getDatasetById } from './getDatasetById';
import { env } from '$env/dynamic/private';
import MicrosoftPlanetaryStac from '$lib/stac/MicrosoftPlanetaryStac';
import type { RasterSourceSpecification, VectorSourceSpecification } from 'maplibre-gl';
import { updateMosaicJsonBlob } from './updateMosaicJsonBlob';
import { createDatasetLinks } from './createDatasetLinks';
import { getBase64EncodedUrl } from '$lib/helper';

export const getStyleById = async (id: number, url: URL, email?: string, is_superuser = false) => {
	const dbm = new DatabaseManager();
	const client = await dbm.start();
	try {
		const query = {
			text: `
			SELECT 
			id, 
			name, 
			style, 
			layers, 
			access_level, 
			createdat, 
			created_user, 
			updatedat, 
			updated_user,
			${
				email
					? `
					CASE
						WHEN (
						SELECT count(style_id) as count FROM geohub.style_favourite 
						WHERE style_id=id and user_email='${email}'
						) > 0 THEN true
						ELSE false
					END as is_star
					`
					: 'false as is_star'
			}
			FROM geohub.style 
			where id = $1`,
			values: [id]
		};

		const res = await client.query(query);

		if (res.rowCount === 0) {
			return undefined;
		}

		const style: DashboardMapStyle = res.rows[0];

		// set URL origin if URL starts with /api
		// if origin is localhost, it set dev.undpgeohub.org for testing
		const origin = url.origin.indexOf('localhost') > -1 ? env.GEOHUB_API_ENDPOINT : url.origin;
		Object.keys(style.style.sources).forEach((key) => {
			const source = style.style.sources[key];
			if ('url' in source && source.url.startsWith('/api')) {
				source.url = `${origin}${source.url}`;
			} else if ('tiles' in source) {
				source.tiles.forEach((tile) => {
					if (tile.startsWith('/api')) {
						tile = `${origin}${tile}`;
					}
				});
			}
		});

		style.links = createStyleLinks(style, url);

		if (style.layers) {
			const currentTime = new Date();
			for (const l of style.layers) {
				const dataType = l.dataset.properties.tags?.find((t) => t.key === 'type')?.value;
				if (dataType?.toLowerCase() === 'stac') {
					const stac = l.dataset.properties.tags?.find((t) => t.key === 'stac')?.value;
					if (stac === 'microsoft-pc') {
						// check the token expiry datatime and update if it is expired
						const collection = l.dataset.properties.tags?.find((t) => t.key === 'collection');
						const microsoft = new MicrosoftPlanetaryStac(collection.value, undefined);
						const source = style.style.sources[l.id] as RasterSourceSpecification;
						const data = await microsoft.updateSasToken(
							l.dataset,
							source,
							currentTime,
							updateMosaicJsonBlob
						);
						l.dataset = data.dataset;
						style.style.sources[l.id] = data.source;
					}
				} else {
					// regenerate geohub dataset object
					l.dataset = await getDatasetById(client, l.dataset.properties.id, is_superuser, email);
					if (l.dataset) {
						l.dataset.properties = createDatasetLinks(l.dataset, origin, env.DEV_TITILER_ENDPOINT);

						if (dataType?.toLowerCase() === 'azure') {
							// update accesstoken for GeoHub datasets
							// update style.sources.[layer id].tiles/url (vector and raster)
							const is_raster = l.dataset.properties.is_raster;
							const blobUrl = l.dataset.properties.url;
							let source = style.style.sources[l.id] as
								| RasterSourceSpecification
								| VectorSourceSpecification;
							let tileUrl = blobUrl;
							if (is_raster) {
								tileUrl = getBase64EncodedUrl(blobUrl);
							} else {
								if (!source) {
									const datasetUrl = blobUrl.split('?')[0];
									Object.keys(style.style.sources).forEach((key) => {
										const src = style.style.sources[key] as VectorSourceSpecification;
										if (src.type !== 'vector') return;
										if (
											src?.tiles?.find((t) => t.indexOf(datasetUrl)) ||
											src?.url.indexOf(datasetUrl) !== -1
										) {
											source = src;
										}
									});
								}
							}

							if (source.tiles) {
								const newTiles = [];
								for (const tile of source.tiles) {
									const href = new URL(tile);
									href.searchParams.set('url', tileUrl);
									const newTile = `${href.origin}${decodeURIComponent(href.pathname)}${
										href.search
									}`;
									newTiles.push(newTile);
								}
								source.tiles = newTiles;
							}
						}
					}
				}
			}
		}

		return style;
	} finally {
		dbm.end();
	}
};
