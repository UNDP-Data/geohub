import DatabaseManager from '$lib/server/DatabaseManager';
import type { DashboardMapStyle, VectorLayerSpecification } from '$lib/types';
import { createStyleLinks } from './createStyleLinks';
import { getDatasetById } from './getDatasetById';
import { env } from '$env/dynamic/private';
import MicrosoftPlanetaryStac from '$lib/stac/MicrosoftPlanetaryStac';
import type {
	HillshadeLayerSpecification,
	RasterLayerSpecification,
	RasterSourceSpecification,
	VectorSourceSpecification
} from 'maplibre-gl';
import { updateMosaicJsonBlob } from './updateMosaicJsonBlob';
import { createDatasetLinks } from './createDatasetLinks';
import { createAttributionFromTags, getBase64EncodedUrl } from '$lib/helper';
import { Permission } from '$lib/config/AppConfig';
import { getSTAC } from '.';

export const getStyleById = async (id: number, url: URL, email?: string, is_superuser = false) => {
	const dbm = new DatabaseManager();
	const client = await dbm.start();
	try {
		const query = {
			text: `
			SELECT 
			x.id, 
			x.name, 
			x.style, 
			x.layers, 
			x.access_level, 
			x.createdat, 
			x.created_user, 
			x.updatedat, 
			x.updated_user,
			${
				email
					? `
					CASE
						WHEN (
						SELECT count(style_id) as count FROM geohub.style_favourite 
						WHERE style_id=x.id and user_email='${email}'
						) > 0 THEN true
						ELSE false
					END as is_star,
					`
					: 'false as is_star,'
			}
			${
				!is_superuser && email
					? `CASE WHEN p.permission is not null THEN p.permission ELSE null END`
					: `${
							is_superuser
								? Permission.OWNER
								: 'CASE WHEN p.permission is not null THEN p.permission ELSE null END'
						}`
			} as permission
			FROM geohub.style x
			LEFT JOIN geohub.style_permission p
			ON x.id = p.style_id
			AND p.user_email = $2
			where id = $1
			`,
			values: [id, email]
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

		if (style.style) {
			Object.keys(style.style.sources).forEach((srcId) => {
				const source = style.style.sources[srcId];
				if (source.type !== 'raster') return;
				// if titiler URL saved in database is different from actual server settings, replace URL origin to env varaible one.
				const rasterSource = source as RasterSourceSpecification;
				const tiles = rasterSource.tiles;
				const titilerUrl = new URL(env.TITILER_ENDPOINT);
				for (let i = 0; i < tiles.length; i++) {
					const url = new URL(tiles[i]);
					if (url.origin !== titilerUrl.origin) {
						tiles[i] = tiles[i].replace(url.origin, titilerUrl.origin);
					}
				}
			});
		}

		if (style.layers) {
			const currentTime = new Date();
			const delLayerIds: string[] = [];
			const inaccesibleLayerIds: string[] = [];
			for (const l of style.layers) {
				const dataType = l.dataset.properties.tags?.find((t) => t.key === 'type')?.value;
				if (dataType?.toLowerCase() === 'stac') {
					const stac = l.dataset.properties.tags?.find((t) => t.key === 'stac')?.value;
					if (stac === 'microsoft-pc') {
						// check the token expiry datatime and update if it is expired
						const collection = l.dataset.properties.tags?.find((t) => t.key === 'collection');
						const stacInfo = await getSTAC(stac);
						const microsoft = new MicrosoftPlanetaryStac(collection.value, stacInfo);
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
						l.dataset.properties = await createDatasetLinks(
							l.dataset,
							origin,
							env.TITILER_ENDPOINT
						);

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

							// force update attribution from the latest dataset properties
							const attribution = createAttributionFromTags(l.dataset.properties.tags);
							source.attribution = attribution;
						}

						// if dataset's access level is lower than style's access level and signed in user is not super user
						if (!is_superuser && l.dataset.properties.access_level < style.access_level) {
							if (!email) {
								// delete layer from style if unsigned in user access to organization/private dataset
								inaccesibleLayerIds.push(l.id);
							} else {
								if (
									!(
										l.dataset.properties.permission &&
										l.dataset.properties.permission >= Permission.READ
									)
								) {
									// delete layer from style if signed in user does not have enough permission to access
									inaccesibleLayerIds.push(l.id);
								}
							}
						}
					} else {
						// if dataset is deleted from the database, keep layer id in an array
						delLayerIds.push(l.id);
					}
				}
			}

			// delete all layers and sources if some of them are already unregistered from the database.
			delLayerIds.forEach((id) => {
				style.layers = [...style.layers.filter((l) => l.id !== id)];

				const mapLayer = style.style.layers.find((l) => l.id === id) as
					| RasterLayerSpecification
					| VectorLayerSpecification
					| HillshadeLayerSpecification;
				if (mapLayer) {
					const sourceId = mapLayer.source;
					style.style.layers = [...style.style.layers.filter((l) => l.id !== id)];
					if (style.style.sources[sourceId]) {
						delete style.style.sources[sourceId];
					}
				}
			});
			// delete layers only from style.json if user does not have permission to access
			inaccesibleLayerIds.forEach((id) => {
				const mapLayer = style.style.layers.find((l) => l.id === id) as
					| RasterLayerSpecification
					| VectorLayerSpecification
					| HillshadeLayerSpecification;
				if (mapLayer) {
					const sourceId = mapLayer.source;
					style.style.layers = [...style.style.layers.filter((l) => l.id !== id)];
					if (style.style.sources[sourceId]) {
						delete style.style.sources[sourceId];
					}
				}
			});
		}

		return style;
	} finally {
		dbm.end();
	}
};
