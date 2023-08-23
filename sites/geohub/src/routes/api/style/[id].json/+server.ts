import type { RequestHandler } from './$types';
import { getStyleById } from '$lib/server/helpers';

/**
 * Get style.json which is stored in PostgreSQL database
 * GET: ./api/style/{id}.json
 */
export const GET: RequestHandler = async ({ params, url, locals }) => {
	const session = await locals.getSession();

	try {
		const styleId = Number(params.id);
		if (!styleId) {
			return new Response(JSON.stringify({ message: `id parameter is required.` }), {
				status: 400
			});
		}
		const style = await getStyleById(styleId, url, session?.user?.email);

		if (!style) {
			return new Response(undefined, {
				status: 404
			});
		}

		return new Response(JSON.stringify(style.style));
	} catch (err) {
		return new Response(JSON.stringify({ message: err.message }), {
			status: 400
		});
	}
};
