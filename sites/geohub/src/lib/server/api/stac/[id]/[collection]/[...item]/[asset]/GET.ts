import { Endpoint, z, error as apiError, type RouteModifier } from 'sveltekit-api';
import { env } from '$env/dynamic/private';
import {
	createDatasetLinks,
	createMosaicDataSetFeature,
	createTitilerMosaicJsonEndpoint,
	getSTACs
} from '$lib/server/helpers';
import { error } from '@sveltejs/kit';
import { getStacInstance } from '$lib/stac/getStacInstance';
import type { StacTemplate } from '$lib/stac/StacTemplate';
import type { DatasetFeature } from '$lib/types';

export const Output = z.custom<DatasetFeature>().describe('STAC item dataset feature for GeoHub');

export const Param = z.object({
	id: z.enum(['microsoft-pc', 'earth-search']).describe(`STAC server ID`),
	collection: z.string().describe('STAC collection ID').openapi({ example: 'sentinel-2-l2a' }),
	item: z
		.string()
		.describe(
			'STAC item ID. To merge items as mosaic, you can put multiple item IDs by separating slash'
		)
		.openapi({ example: 'S2A_MSIL2A_20231010T203931_R028_T05LMC_20231010T233454' }),
	asset: z
		.string()
		.describe('STAC Asset name for the item you want to use')
		.openapi({ example: 'visual' })
});

export const Error = {
	404: apiError(404, 'Not found')
};

const description = `
This endpoint is to generate GeoJSON Feature object of user selected STAC items with all necessary information to be rendered in GeoHub.

For instance, the following example URL is to request the server to return the GeoJSON Feature object for only a single item COG (\`S2A_MSIL2A_20231010T203931_R028_T05LMC_20231010T233454\`) from \`sentinel-2-l2a\` in Miscrosoft Planetary Computer.

/api/stac/microsoft-pc/sentinel-2-l2a/S2A_MSIL2A_20231010T203931_R028_T05LMC_20231010T233454/visual

If user want to merge several items to a mosaic, you can simply list item IDs in \`...item\` section by using slash as follows.

/api/stac/microsoft-pc/sentinel-2-l2a/S2A_MSIL2A_20231010T203931_R028_T05LMC_20231010T233454/S2A_MSIL2A_20231010T203931_R028_T05LLC_20231010T233519/visual

This mean the server create mosaicjson for item ID \`S2A_MSIL2A_20231010T203931_R028_T05LMC_20231010T233454\` and \`S2A_MSIL2A_20231010T203931_R028_T05LLC_20231010T233519\` for the client.

For STAC datasets, the following tags will be included in the object.

- type=\`stac\`
- stacType=\`cog\` or \`mosaicjson\`
- stac=stac ID. either \`microsoft-pc\` or \`earth-search\`
- collection=collection ID
- item=Item ID. There might be multiple tags for item
- asset=asset name for item
- provider=data provider name. There might be multiple tags for this.
`;

export const Modifier: RouteModifier = (c) => {
	c.summary = 'get STAC item information for GeoHub';
	c.description = description;
	c.tags = ['stac'];
	return c;
};

export default new Endpoint({ Param, Output, Error, Modifier }).handle(async (param, { url }) => {
	const id = param.id;

	const stacs = await getSTACs();
	const stac = stacs.find((x) => x.id === id);
	if (!stac) {
		error(
			400,
			`Only supported the following stac: ${stacs
				.filter((s) => s.type === 'api')
				.map((x) => x.id)
				.join(', ')}`
		);
	}
	const collection = param.collection;
	const asset = param.asset;

	const stacInstance = getStacInstance(stac, collection);

	const items = param.item.split('/');
	if (items.length === 1) {
		// COG
		const item = items[0];
		const feature = await getDatasetFeature(stacInstance, item, asset, url);
		if (!feature) {
			error(400, { message: 'This asset item is not supported.' });
		}
		return feature;
	} else {
		// mosaicjson
		const features: DatasetFeature[] = [];

		const sortedItems = items.sort();

		for (const item of sortedItems) {
			const feature = await getDatasetFeature(stacInstance, item, asset, url);
			if (!feature) continue;
			features.push(feature);
		}
		const urls: string[] = features.map((f) => f.properties.url);
		const name = `${id}/${collection}/${sortedItems.join('/')}/mosaicjson.json`;
		const mosaicjson = await createTitilerMosaicJsonEndpoint(urls, name);
		const mosaicjsonFeature = await createMosaicDataSetFeature(features, mosaicjson);
		mosaicjsonFeature.properties = await createDatasetLinks(
			mosaicjsonFeature,
			url.origin,
			env.TITILER_ENDPOINT
		);
		return mosaicjsonFeature;
	}
});

const getDatasetFeature = async (instance: StacTemplate, item: string, asset: string, url: URL) => {
	const stacItem = await instance.getStacItem(item);
	await instance.getStacCollection();

	const feature = await instance.generateDataSetFeature(stacItem, asset);
	if (!feature) return;
	feature.properties = await createDatasetLinks(feature, url.origin, env.TITILER_ENDPOINT);

	const selfLink = feature.properties.links?.find((l) => l.rel === 'self');
	if (selfLink) {
		selfLink.href = url.href;
	}

	return feature;
};
