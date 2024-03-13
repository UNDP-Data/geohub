import { error, type RequestHandler } from '@sveltejs/kit';
import { getStacCollectionProducts } from '$lib/server/helpers';

export const GET: RequestHandler = async ({ locals, url }) => {
	const session = await locals.getSession();
	if (!session) {
		error(403, { message: 'Permission error' });
	}
	const params = url.searchParams;
	const stac_id = params.get('id');
	const collection_id = params.get('collection');
	const products = await getStacCollectionProducts(stac_id, collection_id);
	return new Response(JSON.stringify(products));
};
