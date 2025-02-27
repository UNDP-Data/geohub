import { Endpoint, z, type RouteModifier } from 'sveltekit-api';
import { env } from '$env/dynamic/private';
import { createDatasetLinks } from '$lib/server/helpers';
import type { DatasetDefaultLayerStyle, StacProduct } from '$lib/types';
import type { UserConfig } from '$lib/config/DefaultUserConfig';
import RasterDefaultStyle from '$lib/server/defaultStyle/RasterDefaultStyle';

export const Output = z
	.custom<DatasetDefaultLayerStyle>()
	.describe('The default layer style object');

export const Param = z.object({
	id: z.enum(['microsoft-pc', 'earth-search']).describe(`STAC server ID`),
	collection: z.string().describe('STAC collection ID').openapi({ example: 'sentinel-2-l2a' }),
	item: z
		.string()
		.describe(
			'STAC item ID. To merge items as mosaic, you can put multiple item IDs by separating slash'
		)
		.openapi({ example: 'S2A_MSIL2A_20231010T203931_R028_T05LMC_20231010T233454' })
});

export const Query = z.object({
	colormap_name: z.string().optional().describe('colormap name')
});

export const Input = z.custom<StacProduct>().openapi({
	example: {
		stac_id: 'string',
		collection_id: 'string',
		product_id: 'string',
		assets: ['string'],
		label: 'string',
		expression: 'string',
		description: 'string'
	}
});

export const Modifier: RouteModifier = (c) => {
	c.summary = 'get default layer style of stac product for GeoHub';
	c.description = 'get default layer style of stac product for GeoHub';
	c.tags = ['stac', 'products'];
	return c;
};

export default new Endpoint({ Param, Query, Output, Input, Modifier }).handle(
	async (param, { url, fetch, request }) => {
		const colormap_name = param.colormap_name;
		const requestBody: StacProduct = await request.json();
		const datasetUrl = `${url.origin}${url.pathname.replace('/style', '')}`;
		const res = await fetch(datasetUrl, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(requestBody)
		});

		const dataset = await res.json();
		const response = await fetch('/api/settings');
		const config: UserConfig = await response.json();
		dataset.properties = await createDatasetLinks(
			dataset,
			url.origin,
			env.TITILER_ENDPOINT.replace('cog', 'stac')
		);
		const bandIndex = 0;
		const rasterDefaultStyle = new RasterDefaultStyle(dataset, config, bandIndex);
		const data = await rasterDefaultStyle.create(colormap_name);
		return data;
	}
);
