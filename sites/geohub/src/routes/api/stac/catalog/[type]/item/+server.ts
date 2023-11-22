import { AccessLevel, StacCatalogs } from '$lib/config/AppConfig';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';
import { createDatasetLinks } from '$lib/server/helpers';
import { error } from '@sveltejs/kit';
import type { DatasetFeature, StacItemFeature } from '$lib/types';
import { generateHashKey, resolveRelativeUrl } from '$lib/helper';

export const GET: RequestHandler = async ({ params, url }) => {
	const type = params.type;
	const catalog = StacCatalogs.find((x) => x.id === type);
	if (!catalog) {
		throw error(
			400,
			`Only supported the following stac: ${StacCatalogs.map((x) => x.id).join(', ')}`
		);
	}

	const itemUrl = url.searchParams.get('url');
	const assetName = url.searchParams.get('asset');

	if (!itemUrl) {
		throw error(400, { message: `url query param for STAC item URL is missing.` });
	}
	if (!assetName) {
		throw error(400, { message: `asset query param is missing.` });
	}

	const res = await fetch(itemUrl);
	const itemFeature: StacItemFeature = await res.json();

	const feature = await generateDataSetFeature(type, itemFeature, assetName, itemUrl);
	feature.properties = createDatasetLinks(feature, url.origin, env.TITILER_ENDPOINT);
	return new Response(JSON.stringify(feature));
};

const generateDataSetFeature = async (
	stacId: string,
	item: StacItemFeature,
	assetName: string,
	itemUrl: string
) => {
	const assetItem = item.assets[assetName];
	const assetUrl = resolveRelativeUrl(assetItem.href, itemUrl);

	// const providers: Tag[] = this.stacCollection.providers?.map((p) => {
	// 	return { key: 'provider', value: p.name };
	// });

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
			name: `${item.id} - ${assetName}`,
			description: item.id,
			// license: this.stacCollection.license,
			url: `${assetUrl}`,
			is_raster: true,
			access_level: AccessLevel.PUBLIC,
			tags: [
				{ key: 'type', value: 'stac' },
				{ key: 'stacType', value: 'cog' },
				{ key: 'stac', value: stacId },
				{ key: 'collection', value: item.collection },
				{ key: 'item', value: item.id },
				{ key: 'asset', value: assetName }
				// ...providers
			]
		}
	};

	// const classmap = this.getStacClassmap(assetName);
	// if (Object.keys(classmap).length > 0) {
	// 	feature.properties.tags.push({
	// 		key: 'classmap',
	// 		value: JSON.stringify(classmap)
	// 	});
	// }

	return feature;
};
