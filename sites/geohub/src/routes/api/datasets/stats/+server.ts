import type { RequestHandler } from './$types';
import { getDatasetStats } from '$lib/server/helpers';

export const GET: RequestHandler = async () => {
	const cards = await getDatasetStats();
	return new Response(JSON.stringify(cards));
};
