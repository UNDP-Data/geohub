import type { RequestHandler } from '@sveltejs/kit';
import { createDatasetLinks } from '$lib/server/helpers';
import { env } from '$env/dynamic/private';

export const POST: RequestHandler = async ({ request, url, params }) => {
	const feature = await request.json();

	const tool = params.tool;

	feature.properties = await createDatasetLinks(feature, url.origin, env.TITILER_ENDPOINT, tool);

	console.log(feature);
	return new Response(JSON.stringify(feature));
};
