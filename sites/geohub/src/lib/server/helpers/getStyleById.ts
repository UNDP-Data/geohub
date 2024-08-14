import DatabaseManager from '$lib/server/DatabaseManager';
import type { DashboardMapStyle, VectorLayerSpecification } from '$lib/types';
import { createStyleLinks } from './createStyleLinks';
import { getDatasetById } from './getDatasetById';
import { env } from '$env/dynamic/private';
import MicrosoftPlanetaryStac from '$lib/stac/MicrosoftPlanetaryStac';
import type {
	BackgroundLayerSpecification,
	HillshadeLayerSpecification,
	LayerSpecification,
	RasterLayerSpecification,
	RasterSourceSpecification,
	StyleSpecification,
	VectorSourceSpecification
} from 'maplibre-gl';
import { updateMosaicJsonBlob } from './updateMosaicJsonBlob';
import { createDatasetLinks } from './createDatasetLinks';
import { createAttributionFromTags, getBase64EncodedUrl, getFirstSymbolLayerId } from '$lib/helper';
import { Permission } from '$lib/config/AppConfig';
import { getSTAC, resolveSpriteUrl } from '.';

import voyagerStyle from '@undp-data/style/dist/style.json';
import darkStyle from '@undp-data/style/dist/dark.json';
import positronStyle from '@undp-data/style/dist/positron.json';
import aerialStyle from '@undp-data/style/dist/aerialstyle.json';
import { DefaultUserConfig } from '$lib/config/DefaultUserConfig';
import type { PoolClient } from 'pg';

export const getStyleById = async (
	pool: PoolClient,
	id: number,
	url: URL,
	email?: string,
	is_superuser = false
) => {
	const dbm = new DatabaseManager(pool);
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
				if (['bing', 'terrarium'].includes(srcId)) return; // don't replace to titiler url for these sources
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

			// delete admin layer
			const adminLayerName = 'cgaz';
			if (style.style.sources[adminLayerName]) {
				style.style.layers = style.style.layers.filter(
					(l) => 'source' in l && l.source !== adminLayerName
				);
				delete style.style.sources[adminLayerName];
			}

			// there might be some updated on base style between saved style and original one.
			// Here, it updates base style from the latest.

			// check which base style is used
			let baseStyle: StyleSpecification = voyagerStyle as unknown as StyleSpecification;
			if (style.style.sources['bing']) {
				// aerial
				baseStyle = aerialStyle as unknown as StyleSpecification;
			} else {
				// check color of background layer to identify base style
				const backgroudLayer: BackgroundLayerSpecification = style.style.layers.find(
					(l) => l.type === 'background'
				) as BackgroundLayerSpecification;
				if (backgroudLayer) {
					if (backgroudLayer.paint['background-color'] === '#0e0e0e') {
						// dark style: https://github.com/UNDP-Data/style/blob/main/assets/dark/background.yml
						baseStyle = darkStyle as unknown as StyleSpecification;
					} else if (backgroudLayer.paint['background-color'] === '#fafaf8') {
						// positron style: https://github.com/UNDP-Data/style/blob/main/assets/positron/background.yml
						baseStyle = positronStyle as unknown as StyleSpecification;
					}
				}
			}

			// update sprite and glyphs
			style.style.sprite = resolveSpriteUrl(baseStyle.sprite, url.origin);
			style.style.glyphs = baseStyle.glyphs;

			// add source from the latest style if does not exist
			Object.keys(baseStyle.sources).forEach((srcName) => {
				if (style.style.sources[srcName]) return;
				const newSource = baseStyle.sources[srcName];
				style.style.sources[srcName] = newSource;
			});

			// update base layer style
			const updatedLayers: LayerSpecification[] = JSON.parse(JSON.stringify(baseStyle.layers));
			// get the total layer length exclude geohub layer for saved style
			const totalBaseLayerLength = style.style.layers.filter(
				(l) => style.layers.map((_l) => _l.id).includes(l.id) === false
			).length;
			for (const savedLayer of style.style.layers) {
				// 	// skip if not geohub layer
				if (baseStyle.layers.find((l) => l.id === savedLayer.id)) continue;
				const currentIndex = style.style.layers.indexOf(savedLayer);

				if (currentIndex > totalBaseLayerLength) {
					// if it exists in the last part of layers
					updatedLayers.push(savedLayer);
				} else {
					// if it exists in the middle of layers (for raster mostly)
					const beforeOld = style.style.layers[currentIndex - 1];
					const beforeNew = updatedLayers[currentIndex - 1];
					if (beforeOld.id === beforeNew.id) {
						// if layer IDs before this layer are the same, insert it at the same index
						updatedLayers.splice(currentIndex, 0, savedLayer);
					} else {
						// otherwise insert layer before first symbol layer (style structure might have been changed at all)
						const firstSymbolLayerId = getFirstSymbolLayerId(updatedLayers);
						let idx = updatedLayers.length - 1;
						if (firstSymbolLayerId) {
							idx = updatedLayers.findIndex((l) => l.id === firstSymbolLayerId);
						}
						updatedLayers.splice(idx, 0, savedLayer);
					}
				}
			}
			style.style.layers = [...updatedLayers];
		}

		// if text-font is not set, use default font.
		style.style.layers.forEach((l) => {
			if (l.type === 'symbol') {
				if (l.layout['text-field'] && !l.layout['text-font']) {
					l.layout['text-font'] = [DefaultUserConfig.LabelTextFont];
				}
			}
		});

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
						const stacInfo = await getSTAC(pool, stac);
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
	} catch (err) {
		console.error(err);
	} finally {
		dbm.end();
	}
};
