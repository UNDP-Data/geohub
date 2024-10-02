import type { RequestHandler } from './$types';
import { getStoryStarCount } from '$lib/server/helpers';

export const GET: RequestHandler = async ({ params }) => {
	const storymap_id = params.id;

	const stars = await getStoryStarCount(storymap_id);

	const res = {
		storymap_id,
		no_stars: stars
	};

	return new Response(JSON.stringify(res));
};
