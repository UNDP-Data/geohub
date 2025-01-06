import type { DashboardMapStyle, VectorLayerSpecification } from '$lib/types';
import { createStyleLinks } from './createStyleLinks';
import { getDatasetById } from './getDatasetById';
import { env } from '$env/dynamic/private';
import MicrosoftPlanetaryStac from '$lib/stac/MicrosoftPlanetaryStac';
import type {
	BackgroundLayerSpecification,
	HillshadeLayerSpecification,
	RasterLayerSpecification,
	RasterSourceSpecification,
	SpriteSpecification,
	StyleSpecification,
	VectorSourceSpecification
} from 'maplibre-gl';
import { updateMosaicJsonBlob } from './updateMosaicJsonBlob';
import { createDatasetLinks } from './createDatasetLinks';
import {
	createAttributionFromTags,
	getBase64EncodedUrl,
	getDomainFromEmail,
	getFirstSymbolLayerId
} from '$lib/helper';
import { AccessLevel, Permission, type MapStyleType } from '$lib/config/AppConfig';
import { getSTAC, resolveSpriteUrl } from '.';
import voyagerStyle from '@undp-data/style/dist/style.json';
import darkStyle from '@undp-data/style/dist/dark.json';
import positronStyle from '@undp-data/style/dist/positron.json';
import aerialStyle from '@undp-data/style/dist/aerialstyle.json';
import blankStyle from '@undp-data/style/dist/blank.json';
import { DefaultUserConfig } from '$lib/config/DefaultUserConfig';
import { db } from '$lib/server/db';
import { sql } from 'drizzle-orm';
import { isEqual } from 'lodash-es';

/**
 * get saved style information by ID
 * @param id style ID
 * @param url URL object of endpoint
 * @param email signed user email address
 * @param is_superuser whether signed user is super user or not
 * @param basemap Optional. Switch basemap to user desired style
 * @returns DashboardMapStyle object
 */
export const getStyleById = async (
	id: number,
	url: URL,
	email?: string,
	is_superuser = false,
	basemap: MapStyleType | '' = '',
	hillshade = false,
	terrain = false
) => {
	const data = await db.execute(
		sql.raw(`
			with no_stars as (
				SELECT style_id, count(*) as no_stars FROM geohub.style_favourite WHERE style_id = ${id} GROUP BY style_id
			)
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
			CASE WHEN z.no_stars is not null THEN cast(z.no_stars as integer) ELSE 0 END as no_stars,
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
			LEFT JOIN no_stars z
          	ON x.id = z.style_id
			AND p.user_email = '${email}'
			where x.id = ${id}
			`)
	);

	if (data.length === 0) {
		return undefined;
	}

	const style: DashboardMapStyle = data[0] as unknown as DashboardMapStyle;

	// set URL origin if URL starts with /api
	// if origin is localhost, it set dev.undpgeohub.org for testing
	const origin = url.origin.indexOf('localhost') > -1 ? env.GEOHUB_API_ENDPOINT : url.origin;
	if (style.style && style.style.sources) {
		Object.keys(style.style.sources).forEach((key) => {
			const source = style.style?.sources[key];
			if (source) {
				if ('url' in source && source.url?.startsWith('/api')) {
					source.url = `${origin}${source.url}`;
				} else if ('tiles' in source) {
					source.tiles?.forEach((tile) => {
						if (tile.startsWith('/api')) {
							tile = `${origin}${tile}`;
						}
					});
				}
			}
		});
	}

	style.links = createStyleLinks(style, url);

	if (style.style && style.style.sources) {
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
				(l) => ('source' in l && l.source !== adminLayerName) || l.type === 'background'
			);
			delete style.style.sources[adminLayerName];
		}
		const fullGeomLayerName = 'full-geom';
		if (style.style.sources[fullGeomLayerName]) {
			style.style.layers = style.style.layers.filter(
				(l) => ('source' in l && l.source !== fullGeomLayerName) || l.type === 'background'
			);
			delete style.style.sources[fullGeomLayerName];
		}

		// there might be some updated on base style between saved style and original one.
		// Here, it updates base style from the latest.

		// check which base style is used
		let baseStyle: StyleSpecification = JSON.parse(
			JSON.stringify(voyagerStyle)
		) as unknown as StyleSpecification;
		if (basemap) {
			if (basemap === 'aerialstyle') {
				baseStyle = JSON.parse(JSON.stringify(aerialStyle));
			} else if (basemap === 'dark') {
				baseStyle = JSON.parse(JSON.stringify(darkStyle));
			} else if (basemap === 'positron') {
				baseStyle = JSON.parse(JSON.stringify(positronStyle));
			} else if (basemap === 'blank') {
				baseStyle = JSON.parse(JSON.stringify(blankStyle));
			} else {
				baseStyle = JSON.parse(JSON.stringify(voyagerStyle));
			}
		} else {
			if (style.style.sources['bing']) {
				// aerial
				baseStyle = JSON.parse(JSON.stringify(aerialStyle)) as unknown as StyleSpecification;
			} else {
				// check color of background layer to identify base style
				const backgroudLayer: BackgroundLayerSpecification = style.style.layers.find(
					(l) => l.type === 'background'
				) as BackgroundLayerSpecification;
				if (backgroudLayer) {
					if (backgroudLayer.id === 'background-blank') {
						// blank style: https://github.com/UNDP-Data/style/blob/main/assets/dark/background.yml
						baseStyle = JSON.parse(JSON.stringify(blankStyle)) as unknown as StyleSpecification;
					} else if (backgroudLayer.paint['background-color'] === '#0e0e0e') {
						// dark style: https://github.com/UNDP-Data/style/blob/main/assets/dark/background.yml
						baseStyle = JSON.parse(JSON.stringify(darkStyle)) as unknown as StyleSpecification;
					} else if (backgroudLayer.paint['background-color'] === '#fafaf8') {
						// positron style: https://github.com/UNDP-Data/style/blob/main/assets/positron/background.yml
						baseStyle = JSON.parse(JSON.stringify(positronStyle)) as unknown as StyleSpecification;
					}
				}
			}
		}

		// update sprite and glyphs
		style.style.sprite = resolveSpriteUrl(baseStyle.sprite as SpriteSpecification, url.origin);
		style.style.glyphs = baseStyle.glyphs;

		const geohubLayerIds = style.layers?.map((l) => l.id);
		const geohubSourceIds: string[] = [];
		style.layers?.forEach((l) => {
			const mapLayer = style.style?.layers.find((layer) => layer.id === l.id);
			if (mapLayer && 'source' in mapLayer) {
				if (!geohubSourceIds.includes(mapLayer.source)) {
					geohubSourceIds.push(mapLayer.source);
				}
			}
		});
		const layersExludesGeoHub = style.style.layers.filter((l) => {
			return !('source' in l && geohubSourceIds.includes(l.source));
		});
		// compare base style and saved style by layers excluding geohub.
		// they should be the same if no update from base style.
		// if layers on basemap are different, add geohub layers to base style
		// add source from the latest style if does not exist
		if (!isEqual(baseStyle.layers, layersExludesGeoHub)) {
			Object.keys(style.style.sources).forEach((srcName) => {
				if (baseStyle.sources[srcName]) return;
				const newSource = style.style?.sources[srcName];
				if (newSource) {
					baseStyle.sources[srcName] = newSource;
				}
			});
			for (const layer of style.style.layers.filter((l) => geohubLayerIds?.includes(l.id))) {
				if (!('source' in layer && geohubSourceIds.includes(layer.source))) continue;
				if (['raster', 'hillshade'].includes(layer.type)) {
					// if raster or hillshade, insert befpre first symbol layer
					const firstSymbolLayerId = getFirstSymbolLayerId(baseStyle.layers);
					let idx = baseStyle.layers.length - 1;
					if (firstSymbolLayerId) {
						idx = baseStyle.layers.findIndex((l) => l.id === firstSymbolLayerId);
					}
					if (idx === 0) {
						const backgroundIndex = baseStyle.layers.findIndex((l) => l.type === 'background');
						if (backgroundIndex !== -1) {
							idx = backgroundIndex + 1;
						}
					}
					baseStyle.layers.splice(idx, 0, layer);
				} else {
					// for vector, insert them to the last
					baseStyle.layers.push(layer);
				}
			}
			style.style.sources = JSON.parse(JSON.stringify(baseStyle.sources));
			style.style.layers = JSON.parse(JSON.stringify(baseStyle.layers));
		}
	}

	// if text-font is not set, use default font.
	style.style?.layers?.forEach((l) => {
		if (l.type === 'symbol') {
			if (l.layout['text-field'] && !l.layout['text-font']) {
				l.layout['text-font'] = [DefaultUserConfig.LabelTextFont];
			}
		}
	});

	if (style.style && style.layers) {
		const currentTime = new Date();
		const delLayerIds: string[] = [];
		const inaccesibleLayerIds: string[] = [];
		for (const l of style.layers) {
			const dataType = l.dataset?.properties.tags?.find((t) => t.key === 'type')?.value;
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
				if (l.dataset) {
					// regenerate geohub dataset object
					l.dataset = await getDatasetById(l.dataset.properties.id, is_superuser, email);
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
							const mapLayer = style.style.layers.find((layer) => layer.id === l.id);
							if (!(mapLayer && 'source' in mapLayer)) continue;
							let source = style.style.sources[mapLayer.source] as
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
									const newTile = `${href.origin}${decodeURIComponent(href.pathname)}${href.search}`;
									newTiles.push(newTile);
								}
								source.tiles = newTiles;
							}
							if (source.url && source.url.startsWith('pmtiles://')) {
								source.url = l.dataset.properties.url;
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
								if (l.dataset.properties.access_level === AccessLevel.PRIVATE) {
									if (
										!(
											l.dataset.properties.permission &&
											l.dataset.properties.permission >= Permission.READ
										)
									) {
										// delete layer from style if signed in user does not have enough permission to access
										inaccesibleLayerIds.push(l.id);
									}
								} else if (l.dataset.properties.access_level === AccessLevel.ORGANIZATION) {
									const domainUser = getDomainFromEmail(email);
									const domainCreatedUser = getDomainFromEmail(
										l.dataset.properties.created_user as string
									);
									if (
										!(
											(l.dataset.properties.permission &&
												l.dataset.properties.permission >= Permission.READ) ||
											domainUser === domainCreatedUser
										)
									) {
										// delete layer from style if signed in user does not have enough permission to access
										inaccesibleLayerIds.push(l.id);
									}
								}
							}
						}
					} else {
						// if dataset is deleted from the database, keep layer id in an array
						delLayerIds.push(l.id);
					}
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
			if (!style.style) return;
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

	if (style.style) {
		if (hillshade === true) {
			const hillshadeLayerIndex = style.style.layers.findIndex(
				(l) => l.type === 'hillshade' && l.source === 'terrarium'
			);
			if (hillshadeLayerIndex !== -1) {
				if (style.style.layers[hillshadeLayerIndex].layout) {
					style.style.layers[hillshadeLayerIndex].layout['visibility'] = 'visible';
				}
			}
		}
		if (terrain === true) {
			style.style.terrain = {
				source: 'terrarium',
				exaggeration: 1
			};
		}
	}

	return style;
};
