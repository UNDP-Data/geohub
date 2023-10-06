import { AccessLevel } from '$lib/config/AppConfig';
import { generateHashKey } from '$lib/helper';
import type { DatasetFeature, StacCollection, StacItemFeature, Tag } from '$lib/types';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';
import { createDatasetLinks, getStacClassmap } from '$lib/server/helpers';

const MSPC_ROOT_API = 'https://planetarycomputer.microsoft.com/api';

export const GET: RequestHandler = async ({ params, url }) => {
	const collection = params.collection;
	const itemId = params.item;
	const asset = params.asset;

	const stacItem = await getStacItem(collection, itemId);

	const collectionUrl = stacItem.links.find((l) => l.rel === 'collection').href;
	const res = await fetch(collectionUrl);
	const stacCollection: StacCollection = await res.json();

	const assetItem = stacItem.assets[asset];
	const assetUrl = assetItem.href;

	const sasToken = await getMsStacToken(collection);

	const providers: Tag[] = stacCollection.providers?.map((p) => {
		return { key: 'provider', value: p.name };
	});

	const feature: DatasetFeature = {
		type: 'Feature',
		geometry: {
			type: 'Polygon',
			coordinates: [
				[stacItem.bbox[0], stacItem.bbox[1]],
				[stacItem.bbox[0], stacItem.bbox[3]],
				[stacItem.bbox[2], stacItem.bbox[1]],
				[stacItem.bbox[2], stacItem.bbox[3]],
				[stacItem.bbox[0], stacItem.bbox[1]]
			]
		},
		properties: {
			id: generateHashKey(assetUrl),
			name: `${collection} - ${asset}`,
			description: stacCollection.description,
			license: stacCollection.license,
			url: `${assetUrl}?${sasToken}`,
			is_raster: true,
			access_level: AccessLevel.PUBLIC,
			tags: [
				{ key: 'stacType', value: 'cog' },
				{ key: 'stac', value: 'microsoft-pc' },
				...providers
			]
		}
	};

	const rootUrl = stacItem.links.find((l) => l.rel === 'root').href;
	const classmap = await getStacClassmap(`${rootUrl}/collections`, collection, asset);
	if (Object.keys(classmap).length > 0) {
		feature.properties.tags.push({
			key: 'classmap',
			value: JSON.stringify(classmap)
		});
	}

	feature.properties = createDatasetLinks(feature, url.origin, env.TITILER_ENDPOINT);

	return new Response(JSON.stringify(feature));
};

const getStacItem = async (collection: string, itemId: string) => {
	const url = `${MSPC_ROOT_API}/stac/v1/collections/${collection}/items/${itemId}`;
	const res = await fetch(url);
	const json = await res.json();
	return json as StacItemFeature;
};

const getMsStacToken = async (collection: string) => {
	const url = `${MSPC_ROOT_API}/sas/v1/token/${collection}`;
	const res = await fetch(url);
	const json = await res.json();
	const token = json.token;
	return token;
};
