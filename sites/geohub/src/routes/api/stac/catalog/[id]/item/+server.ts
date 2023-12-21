import { AccessLevel } from '$lib/config/AppConfig';
import type { RequestHandler } from './$types';
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

export const GET: RequestHandler = async ({ params, url }) => {
	const id = params.id;
	const stacCatalogs = await getSTACs('catalog');
	const stac = stacCatalogs.find((x) => x.id === id);
	if (!stac) {
		throw error(
			400,
			`Only supported the following stac: ${stacCatalogs.map((x) => x.id).join(', ')}`
		);
	}

	const itemUrls = url.searchParams.getAll('url');
	const assetName = url.searchParams.get('asset');
	const collectionUrl = url.searchParams.get('collection');

	if (itemUrls.length === 0) {
		throw error(400, { message: `url query param for STAC item URL is missing.` });
	}
	if (!assetName) {
		throw error(400, { message: `asset query param is missing.` });
	}
	if (!collectionUrl) {
		throw error(400, {
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
		const ids: string[] = features.map((f) => f.properties.id.replace('/', '_')).sort();
		const name = `${id}/${collection.id}/${ids.join('/')}/${assetName}/mosaicjson.json`;
		const mosaicjson = await createTitilerMosaicJsonEndpoint(urls, name);
		const mosaicjsonFeature = await createMosaicDataSetFeature(features, mosaicjson);
		mosaicjsonFeature.properties = createDatasetLinks(
			mosaicjsonFeature,
			url.origin,
			env.DEV_TITILER_ENDPOINT
		);
		return new Response(JSON.stringify(mosaicjsonFeature));
	}

	feature.properties = createDatasetLinks(feature, url.origin, env.DEV_TITILER_ENDPOINT);

	const selfLink = feature.properties.links.find((l) => l.rel === 'self');
	selfLink.href = url.href;

	return new Response(JSON.stringify(feature));
};

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
	});
	if (!providers) {
		providers = stac.providers?.map((p) => {
			return { key: 'provider', value: p };
		});
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
				{ key: 'collection', value: item.collection },
				{ key: 'item', value: item.id },
				{ key: 'asset', value: assetName }
			]
		}
	};
	if (providers?.length > 0) {
		feature.properties.tags.push(...providers);
	}

	if (Object.keys(item.properties).length > 0) {
		feature.properties['stac_properties'] = item.properties;
	}

	feature.properties['assets'] = item.assets;

	return feature;
};
