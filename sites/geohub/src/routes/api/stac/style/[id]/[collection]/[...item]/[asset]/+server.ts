import { createDatasetLinks } from '$lib/server/helpers';
import type { RequestHandler } from './$types';
import RasterDefaultStyle from '$lib/server/defaultStyle/RasterDefaultStyle';
import type { UserConfig } from '$lib/config/DefaultUserConfig';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import { env } from '$env/dynamic/private';

export const GET: RequestHandler = async ({ url, fetch }) => {
	const colormap_name = url.searchParams.get('colormap_name');
	const datasetUrl = `${url.origin}${url.pathname.replace('/style', '')}`;
	const res = await fetch(datasetUrl);
	const dataset = await res.json();

	const response = await fetch('/api/settings');
	const config: UserConfig = await response.json();

	dataset.properties = await createDatasetLinks(dataset, url.origin, env.TITILER_ENDPOINT);

	const bandIndex = 0;
	const rasterDefaultStyle = new RasterDefaultStyle(dataset, config, bandIndex);
	const data = await rasterDefaultStyle.create(colormap_name);

	return new Response(JSON.stringify(data));
};
