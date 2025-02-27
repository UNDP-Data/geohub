import { z, type RouteModifier, error as appError, Endpoint } from 'sveltekit-api';
import { AddSecurictyModifier } from '$api/securityModifier';
import {
	getDatasetById,
	getDefaultLayerStyle,
	isSuperuser,
	createDatasetLinks
} from '$lib/server/helpers';
import {
	VectorLayerTypeValues,
	type DatasetDefaultLayerStyle,
	type Tag,
	type VectorLayerTypes
} from '$lib/types';
import type { RasterSourceSpecification, VectorSourceSpecification } from 'maplibre-gl';
import RasterDefaultStyle from '$lib/server/defaultStyle/RasterDefaultStyle';
import type { UserConfig } from '$lib/config/DefaultUserConfig';
import { env } from '$env/dynamic/private';
import VectorDefaultStyle from '$lib/server/defaultStyle/VectorDefaultStyle';
import { error } from '@sveltejs/kit';
import { createAttributionFromTags, getBase64EncodedUrl } from '$lib/helper';

export const Output = z.custom<DatasetDefaultLayerStyle>().describe('default layer style');

export const Param = z.object({
	id: z.string().describe('Dataset ID').openapi({ example: '8c4810867c50ee006b11abf19876a750' }),
	layer: z
		.string()
		.describe('Band name if it is raster, layer ID if it is vector.')
		.openapi({ example: 'drr.dynamic_subnational_hhr' }),
	type: z
		.enum(['raster', 'fill', 'symbol', 'line', 'circle', 'heatmap'])
		.describe('Maplibre layer type (fill, line, symbol, circle, heatmap, raster)')
		.openapi({ example: 'fill' })
});

export const Query = z.object({
	colormap_name: z
		.string()
		.optional()
		.describe('Option. If specified, use this colormap to create layer style')
});

const description = `
This endpoint is to return the default layer style for specified dataset if the style infomation is registered in the database.

This endpoint's response contains two variables which are \`style.id={layer_id}\` and \`style.source={source_id}\`. When you use this default style in maplibre, please generate unique layer ID and soruce ID, then replace them before adding layer to maplibre.

If the style is not registered in the database yet, the endpoint will create style randomly.

**This endpoint might be restricted by the access level of the dataset**
`;

export const Modifier: RouteModifier = (c) => {
	c.summary = 'Get default layer style for a dataset';
	c.description = description;
	c.tags = ['datasets'];
	c = AddSecurictyModifier(c);
	return c;
};

export const Error = {
	404: appError(404, `No dataset found.`),
	403: appError(403, 'Permission error'),
	400: appError(400, 'Invalid parameter')
};

export default new Endpoint({ Param, Query, Output, Modifier, Error }).handle(
	async (param, { locals, url, fetch }) => {
		const session = await locals.auth();
		const user_email = session?.user.email;
		const id = param.id;
		const layer_id = param.layer;
		const layer_type: VectorLayerTypes | 'raster' = param.type as VectorLayerTypes | 'raster';
		const colormap_name = url.searchParams.get('colormap_name') as string;

		if (![...VectorLayerTypeValues, 'raster'].includes(layer_type)) {
			error(404, {
				message: `Invalid parameter of type. It must be one of ${[
					...VectorLayerTypeValues,
					'raster'
				].join(', ')}`
			});
		}

		let is_superuser = false;
		if (user_email) {
			is_superuser = await isSuperuser(user_email);
		}

		const dataset = await getDatasetById(id, is_superuser, user_email);
		if (!dataset) {
			error(404, { message: `No dataset found.` });
		}
		dataset.properties = await createDatasetLinks(dataset, url.origin, env.TITILER_ENDPOINT);

		const response = await fetch('/api/settings');
		const config: UserConfig = await response.json();

		let data = (await getDefaultLayerStyle(
			dataset.properties.id as string,
			layer_id,
			layer_type
		)) as DatasetDefaultLayerStyle;
		if (!data) {
			if (layer_type === 'raster') {
				const bandIndex = parseInt(layer_id) - 1;
				const rasterDefaultStyle = new RasterDefaultStyle(dataset, config, bandIndex);
				data = (await rasterDefaultStyle.create(colormap_name)) as DatasetDefaultLayerStyle;
			} else {
				const vectorDefaultStyle = new VectorDefaultStyle(dataset, config, layer_id, layer_type);
				data = (await vectorDefaultStyle.create(colormap_name)) as DatasetDefaultLayerStyle;
			}
		} else {
			const attribution = createAttributionFromTags(dataset.properties.tags as Tag[]);
			const src = data.source as VectorSourceSpecification | RasterSourceSpecification;
			src.attribution = attribution;
		}

		if (layer_type === 'raster') {
			// if titiler URL saved in database is different from actual server settings, replace URL origin to env varaible one.
			const rasterSource = data.source as RasterSourceSpecification;
			const tiles = rasterSource.tiles as string[];
			const titilerUrl = new URL(env.TITILER_ENDPOINT);
			for (let i = 0; i < tiles.length; i++) {
				const url = new URL(tiles[i]);
				if (url.origin !== titilerUrl.origin) {
					tiles[i] = tiles[i].replace(url.origin, titilerUrl.origin);
				}
				// renew sas token from dataset.properties.url
				const tileUrlObj = new URL(tiles[i]);
				tileUrlObj.searchParams.set(
					'url',
					encodeURIComponent(getBase64EncodedUrl(dataset.properties.url))
				);
				tiles[i] = decodeURI(tileUrlObj.href);
			}
		} else {
			const vectorSource = data.source as VectorSourceSpecification;
			const tileUrl = vectorSource.url;
			// renew sas token from dataset.properties.url
			if (tileUrl && tileUrl.startsWith('pmtiles://')) {
				vectorSource.url = dataset.properties.url;
			}
		}

		if (!data.metadata) {
			if (layer_type === 'raster') {
				const bandIndex = parseInt(layer_id) - 1;
				const rasterDefaultStyle = new RasterDefaultStyle(dataset, config, bandIndex);
				data.metadata = await rasterDefaultStyle.getMetadata();
			} else {
				const vectorDefaultStyle = new VectorDefaultStyle(dataset, config, layer_id, layer_type);
				data.metadata = await vectorDefaultStyle.getMetadata();
			}
		}

		const isPgTileServ =
			dataset.properties.tags?.find((t) => t.key === 'type')?.value === 'pgtileserv';
		if (isPgTileServ) {
			const type = data.source.type;
			if (type === 'vector') {
				const vectorSource = data.source as VectorSourceSpecification;
				if (vectorSource.url) {
					const originalUrl = new URL(vectorSource.url);
					if (originalUrl.origin !== url.origin) {
						const originalUrl = new URL(vectorSource.url);
						vectorSource.url = `${url.origin}${originalUrl.pathname}${originalUrl.search}`;
					}
				}
			}
		}

		return data;
	}
);
