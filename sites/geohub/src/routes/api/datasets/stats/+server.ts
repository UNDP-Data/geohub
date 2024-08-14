import type { RequestHandler } from './$types';
import { getDatasetStats } from '$lib/server/helpers';

export const GET: RequestHandler = async ({ locals }) => {
	const cards = await getDatasetStats(locals.pool);
	return new Response(JSON.stringify(cards));
};
