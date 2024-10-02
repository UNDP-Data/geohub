import { error, type RequestHandler } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { sql } from 'drizzle-orm';
import { stacCollectionProductInGeohub } from '$lib/server/schema';

export const GET: RequestHandler = async ({ locals, params }) => {
	const session = await locals.auth();
	if (!session) {
		error(403, { message: 'Permission error' });
	}

	const products = await db
		.select({
			stac_id: stacCollectionProductInGeohub.stacId,
			collection_id: stacCollectionProductInGeohub.collectionId,
			product_id: stacCollectionProductInGeohub.productId,
			assets: stacCollectionProductInGeohub.assets,
			description: stacCollectionProductInGeohub.description
		})
		.from(stacCollectionProductInGeohub).where(sql`
		${stacCollectionProductInGeohub.stacId} = ${params.id} 
		AND
		${stacCollectionProductInGeohub.collectionId} = ${params.collection}
	`);
	return new Response(JSON.stringify(products));
};
