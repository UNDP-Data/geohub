import { error, type RequestHandler } from '@sveltejs/kit';
import { isSuperuser } from '$lib/server/helpers';
import { db } from '$lib/server/db';
import { productInGeohub, stacCollectionProductInGeohub } from '$lib/server/schema';
import { eq, sql } from 'drizzle-orm';

export const GET: RequestHandler = async ({ locals, params }) => {
	// get product details
	/**
	 * get product details
	 * Needs to be logged in to get product details
	 */
	const session = await locals.auth();
	if (!session) {
		error(403, { message: 'Permission error' });
	}

	const productDetails = await db
		.select({
			stac_id: stacCollectionProductInGeohub.stacId,
			collection_id: stacCollectionProductInGeohub.collectionId,
			product_id: stacCollectionProductInGeohub.productId,
			assets: stacCollectionProductInGeohub.assets,
			label: productInGeohub.label,
			expression: productInGeohub.expression,
			description: productInGeohub.description
		})
		.from(stacCollectionProductInGeohub)
		.innerJoin(productInGeohub, eq(stacCollectionProductInGeohub.productId, productInGeohub.id))
		.where(sql`
		${stacCollectionProductInGeohub.stacId}=${params.id} 
		AND ${stacCollectionProductInGeohub.collectionId}=${params.collection} 
		AND ${stacCollectionProductInGeohub.productId}=${params.product_id}
	`);

	if (productDetails.length === 0) {
		error(404, { message: 'Not found' });
	}

	const detail = productDetails[0];

	const expression = detail.expression;
	const assets = detail.assets;
	const asset_index_mapping = assets.map((asset: string, index: number) => {
		return {
			[`asset${index + 1}`]: asset
		};
	});

	detail.expression = replaceTextWithMapping(expression, asset_index_mapping);

	return new Response(JSON.stringify(detail));
};

export const POST: RequestHandler = async ({ locals, params, request }) => {
	/**
	 * register a new product for the available stac collection
	 * Needs to be superuser to register product
	 */
	// register a new product to available stac collection
	const session = await locals.auth();

	if (!session) {
		error(403, { message: 'Permission error' });
	}

	const user_email = session?.user.email;

	let is_superuser = false;
	if (user_email) {
		is_superuser = await isSuperuser(user_email);
	}
	if (!is_superuser) {
		error(403, { message: 'Permission error' });
	}
	const requestBody = await request.json();
	const assets = requestBody.assets;
	const description = requestBody.description;
	const stac_id = params.id as string;
	const collection_id = params.collection as string;
	const product_id = params.product_id as string;

	const result = await db
		.insert(stacCollectionProductInGeohub)
		.values({
			stacId: stac_id,
			collectionId: collection_id,
			productId: product_id,
			assets: assets,
			description: description
		})
		.onConflictDoNothing()
		.returning();

	return new Response(JSON.stringify(result));
};

export const DELETE: RequestHandler = async ({ locals, params }) => {
	/**
	 * delete a product
	 * Needs to be superuser to delete product
	 */
	// delete a product
	const session = await locals.auth();
	if (!session) {
		error(403, { message: 'Permission error' });
	}
	const user_email = session?.user.email;
	let is_superuser = false;
	if (user_email) {
		is_superuser = await isSuperuser(user_email);
	}
	if (!is_superuser) {
		error(403, { message: 'Permission error' });
	}

	const res = await db
		.delete(stacCollectionProductInGeohub)
		.where(
			sql`
		${stacCollectionProductInGeohub.stacId}=${params.id} 
		AND ${stacCollectionProductInGeohub.collectionId}=${params.collection} 
		AND ${stacCollectionProductInGeohub.productId}=${params.product_id}
	`
		)
		.returning();
	if (res.length === 0) {
		error(404, {
			message: `${[params.id, params.collection, params.product_id].join(', ')} does not exist in the database`
		});
	}
	return new Response(
		JSON.stringify({
			message: 'Product deleted'
		})
	);
};

// Function to replace text based on mapping
const replaceTextWithMapping = (
	text: string,
	mapping: {
		[x: string]: string;
	}[]
) => {
	for (let i = 0; i < mapping.length; i++) {
		const key = Object.keys(mapping[i])[0];
		const value = mapping[i][key];
		const regex = new RegExp('\\{' + key + '\\}', 'g');
		text = text.replace(regex, value);
	}
	return text;
};
