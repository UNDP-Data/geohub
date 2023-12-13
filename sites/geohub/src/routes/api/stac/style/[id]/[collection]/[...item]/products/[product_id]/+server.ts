import type { RequestHandler } from '@sveltejs/kit';
import RasterDefaultStyle from '$lib/server/defaultStyle/RasterDefaultStyle';
import { createDatasetLinks } from '$lib/server/helpers';
import type { UserConfig } from '$lib/config/DefaultUserConfig';

export const GET: RequestHandler = async ({ url, fetch }) => {
	const colormap_name = url.searchParams.get('colormap_name');
	const datasetUrl = `${url.origin}${url.pathname.replace('/style', '')}`;
	const res = await fetch(datasetUrl);
	const dataset = await res.json();
	const response = await fetch('/api/settings');
	const config: UserConfig = await response.json();
	dataset.properties = createDatasetLinks(dataset, url.origin, 'https://titiler.xyz/stac');
	const bandIndex = 0;
	const rasterDefaultStyle = new RasterDefaultStyle(dataset, config, bandIndex);
	const data = await rasterDefaultStyle.create(colormap_name);
	return new Response(JSON.stringify(data));
};
