import type { RequestHandler } from './$types';
import { fetchVectorTileInfo } from '$lib/server/helpers';

export const GET: RequestHandler = async ({ url }) => {
	if (
		url === undefined ||
		url.searchParams === undefined ||
		!url.searchParams.has('path') ||
		!url.searchParams.has('layer_name')
	) {
		return new Response(
			JSON.stringify({ message: 'Bad request. Please verify the URL and/or parameters.' }),
			{
				status: 400
			}
		);
	}

	const path = url.searchParams.get('path');
	const layer_name = url.searchParams.get('layer_name');

	// fetch vector tiles values
	const response = await fetchVectorTileInfo(path, layer_name);

	return new Response(JSON.stringify(response));
};
