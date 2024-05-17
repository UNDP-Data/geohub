import type { RequestHandler } from '@sveltejs/kit';
import RasterDefaultStyle from '$lib/server/defaultStyle/RasterDefaultStyle';
import { createDatasetLinks } from '$lib/server/helpers';
import type { UserConfig } from '$lib/config/DefaultUserConfig';
import { env } from '$env/dynamic/private';

export const GET: RequestHandler = async ({ url, fetch }) => {
	const colormap_name = url.searchParams.get('colormap_name');
	const datasetUrl = `${url.origin}${url.pathname.replace('/style', '')}`;
	const res = await fetch(datasetUrl);
	const dataset = await res.json();
	const response = await fetch('/api/settings');
	const config: UserConfig = await response.json();
	dataset.properties = createDatasetLinks(
		dataset,
		url.origin,
		env.TITILER_ENDPOINT.replace('cog', 'stac')
	);

	const bandIndex = 0;
	const rasterDefaultStyle = new RasterDefaultStyle(dataset, config, bandIndex);
	const data = await rasterDefaultStyle.create(colormap_name);
	return new Response(JSON.stringify(data));
};

export const POST: RequestHandler = async ({ params, url, fetch, request }) => {
	const colormap_name = params.product_id;
	const requestBody = await request.json();
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
	return new Response(JSON.stringify(data));
};
