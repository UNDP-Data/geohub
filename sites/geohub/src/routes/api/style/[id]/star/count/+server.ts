import type { RequestHandler } from './$types';
import { getStyleStarCount } from '$lib/server/helpers';

export const GET: RequestHandler = async ({ params }) => {
	const style_id = parseInt(params.id);

	const stars = await getStyleStarCount(style_id);

	const res = {
		style_id,
		no_stars: stars
	};

	return new Response(JSON.stringify(res));
};
