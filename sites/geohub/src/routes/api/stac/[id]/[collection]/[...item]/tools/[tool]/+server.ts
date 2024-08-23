import type { RequestHandler } from '@sveltejs/kit';
import { createDatasetLinks } from '$lib/server/helpers';
import { env } from '$env/dynamic/private';

export const POST: RequestHandler = async ({ request, url }) => {
	const feature = await request.json();
	feature.properties = await createDatasetLinks(feature, url.origin, env.TITILER_ENDPOINT);
	return new Response(JSON.stringify(feature));
};
