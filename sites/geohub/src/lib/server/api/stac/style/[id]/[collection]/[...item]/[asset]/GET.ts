import { Endpoint, z, type RouteModifier } from 'sveltekit-api';
import { env } from '$env/dynamic/private';
import { createDatasetLinks } from '$lib/server/helpers';
import type { DatasetDefaultLayerStyle } from '$lib/types';
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
		.openapi({ example: 'S2A_MSIL2A_20231010T203931_R028_T05LMC_20231010T233454' }),
	asset: z
		.string()
		.describe('STAC Asset name for the item you want to use')
		.openapi({ example: 'visual' })
});

export const Query = z.object({
	colormap_name: z.string().describe('colormap name')
});

const description = `
This endpoint is to generate default layer style of user selected STAC items with all necessary information to be rendered in GeoHub.

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
	c.summary = 'get default layer style information for GeoHub';
	c.description = description;
	c.tags = ['stac'];
	return c;
};

export default new Endpoint({ Param, Query, Output, Modifier }).handle(
	async (param, { url, fetch }) => {
		const colormap_name = param.colormap_name;
		const datasetUrl = `${url.origin}${url.pathname.replace('/style', '')}`;
		const res = await fetch(datasetUrl);
		const dataset = await res.json();

		const response = await fetch('/api/settings');
		const config: UserConfig = await response.json();

		dataset.properties = await createDatasetLinks(dataset, url.origin, env.TITILER_ENDPOINT);

		const bandIndex = 0;
		const rasterDefaultStyle = new RasterDefaultStyle(dataset, config, bandIndex);
		const data = await rasterDefaultStyle.create(colormap_name as string);

		return data;
	}
);
