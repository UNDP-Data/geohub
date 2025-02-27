import { Endpoint, z, error as apiError, type RouteModifier } from 'sveltekit-api';
import { AccessLevel } from '$lib/config/AppConfig';
import { env } from '$env/dynamic/private';
import {
	createDatasetLinks,
	createMosaicDataSetFeature,
	createTitilerMosaicJsonEndpoint,
	getSTACs
} from '$lib/server/helpers';
import { error } from '@sveltejs/kit';
import type { DatasetFeature, Stac, StacCollection, StacItemFeature, Tag } from '$lib/types';
import { generateHashKey, resolveRelativeUrl } from '$lib/helper';

export const Output = z
	.custom<DatasetFeature>()
	.describe('Dataset feature object of STAC catalog item for GeoHub');

export const Query = z.object({
	url: z.string().describe('URL for STAC item.').openapi({
		example:
			'https://maxar-opendata.s3.amazonaws.com/events/southafrica-flooding22/ard/36/213131032130/2022-04-20/105001002B445D00.json'
	}),
	asset: z.string().describe('Asset name selected').openapi({ example: 'visual' }),
	collection: z
		.string()
		.describe(
			'URL for top-level collection. STAC catalog has nested structure and may have multiple collections until reaching item level. To create more comprehensive information for GeoHub, it required a URL for top-level collection.'
		)
		.openapi({
			example:
				'https://maxar-opendata.s3.amazonaws.com/events/southafrica-flooding22/collection.json'
		})
});

export const Param = z.object({
	id: z.string().describe('STAC server ID').openapi({ example: 'maxar-opendata' })
});

export const Error = {
	403: apiError(403, 'Permission error')
};

const description = `
This endpoint is to create a feature JSON object for selected STAC item asset. This endpoint only can work for catalog type of STAC. STAC API item should use other endpoint of \`/stac/{type}/{collection}/{...item}/{asset}\`.

If multiple \`urls\` are specified, the endpoint will create a mosaicjson feature.
`;

export const Modifier: RouteModifier = (c) => {
	c.summary = 'Get STAC catalog information for GeoHub';
	c.description = description;
	c.tags = ['stac'];
	return c;
};

export default new Endpoint({ Query, Param, Output, Error, Modifier }).handle(
	async (param, { url }) => {
		const id = param.id;
		const stacs = await getSTACs();
		const stacCatalogs = stacs.filter((s) => s.type === 'catalog');
		const stac = stacCatalogs.find((x) => x.id === id);
		if (!stac) {
			error(400, `Only supported the following stac: ${stacCatalogs.map((x) => x.id).join(', ')}`);
		}

		const itemUrls = url.searchParams.getAll('url');
		const assetName = url.searchParams.get('asset');
		const collectionUrl = url.searchParams.get('collection');

		if (itemUrls.length === 0) {
			error(400, { message: `url query param for STAC item URL is missing.` });
		}
		if (!assetName) {
			error(400, { message: `asset query param is missing.` });
		}
		if (!collectionUrl) {
			error(400, {
				message: `collection query param is missing. put the URL for top level collection.`
			});
		}

		let feature: DatasetFeature;

		const res = await fetch(collectionUrl);
		const collection: StacCollection = await res.json();

		if (itemUrls.length === 1) {
			// single item
			const itemUrl = itemUrls[0];
			const res = await fetch(itemUrl);
			const itemFeature: StacItemFeature = await res.json();

			feature = await getDataSetFeature(stac, itemFeature, assetName, itemUrl, collection);
		} else {
			// mosaicjson
			const features: DatasetFeature[] = [];

			const sortedItems = itemUrls.sort();

			for (const itemUrl of sortedItems) {
				const res = await fetch(itemUrl);
				const itemFeature: StacItemFeature = await res.json();

				feature = await getDataSetFeature(stac, itemFeature, assetName, itemUrl, collection);
				features.push(feature);
			}
			const urls: string[] = features.map((f) => f.properties.url);
			const ids: string[] = features
				.map((f) => f.properties.id?.replace('/', '_'))
				.sort() as string[];
			const name = `${id}/${collection.id}/${ids.join('/')}/${assetName}/mosaicjson.json`;
			const mosaicjson = await createTitilerMosaicJsonEndpoint(urls, name);
			const mosaicjsonFeature = await createMosaicDataSetFeature(features, mosaicjson);
			mosaicjsonFeature.properties = await createDatasetLinks(
				mosaicjsonFeature,
				url.origin,
				env.TITILER_ENDPOINT
			);
			return mosaicjsonFeature;
		}

		feature.properties = await createDatasetLinks(feature, url.origin, env.TITILER_ENDPOINT);

		const selfLink = feature.properties.links?.find((l) => l.rel === 'self');
		if (selfLink) {
			selfLink.href = url.href;
		}

		return feature;
	}
);

const getDataSetFeature = async (
	stac: Stac,
	item: StacItemFeature,
	assetName: string,
	itemUrl: string,
	collection: StacCollection
) => {
	const assetItem = item.assets[assetName];
	const assetUrl = resolveRelativeUrl(assetItem.href, itemUrl);

	let providers: Tag[] = collection.providers?.map((p) => {
		return { key: 'provider', value: p.name };
	}) as Tag[];
	if (!providers) {
		providers = stac.providers?.map((p) => {
			return { key: 'provider', value: p };
		}) as Tag[];
	}

	const title = collection.title ?? collection.id;
	const description = collection.description ?? title;

	const feature: DatasetFeature = {
		type: 'Feature',
		geometry: {
			type: 'Polygon',
			coordinates: [
				[
					[item.bbox[0], item.bbox[1]],
					[item.bbox[0], item.bbox[3]],
					[item.bbox[2], item.bbox[1]],
					[item.bbox[2], item.bbox[3]],
					[item.bbox[0], item.bbox[1]]
				]
			]
		},
		properties: {
			id: generateHashKey(assetUrl),
			name: `${title} - ${item.id} - ${assetName}`,
			description: description,
			license: collection.license,
			url: `${assetUrl}`,
			is_raster: true,
			access_level: AccessLevel.PUBLIC,
			tags: [
				{ key: 'type', value: 'stac' },
				{ key: 'stacApiType', value: 'catalog' },
				{ key: 'stacType', value: 'cog' },
				{ key: 'stac', value: stac.id },
				{ key: 'collection', value: item.collection as string },
				{ key: 'item', value: item.id },
				{ key: 'asset', value: assetName }
			]
		}
	};
	if (providers?.length > 0) {
		feature.properties.tags?.push(...providers);
	}

	if (Object.keys(item.properties).length > 0) {
		feature.properties['stac_properties'] = item.properties;
	}

	feature.properties['assets'] = item.assets;

	return feature;
};
