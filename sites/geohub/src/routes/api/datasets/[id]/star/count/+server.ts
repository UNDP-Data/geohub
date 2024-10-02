import type { RequestHandler } from './$types';
import { getDatasetStarCount } from '$lib/server/helpers';

export const GET: RequestHandler = async ({ params }) => {
	const dataset_id = params.id;

	const stars = await getDatasetStarCount(dataset_id);
	const res = {
		dataset_id,
		no_stars: stars
	};

	return new Response(JSON.stringify(res));
};
