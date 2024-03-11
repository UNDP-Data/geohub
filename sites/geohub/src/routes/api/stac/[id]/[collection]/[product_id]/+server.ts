import { error, type RequestHandler } from '@sveltejs/kit';
import {
	isSuperuser,
	registerProduct,
	getProductDetails,
	deleteProduct
} from '$lib/server/helpers';
import type { Product } from '$lib/types/Product';

export const GET: RequestHandler = async ({ locals, params }) => {
	// get product details
	/**
	 * get product details
	 * Needs to be logged in to get product details
	 */
	const session = await locals.getSession();
	if (!session) {
		error(403, { message: 'Permission error' });
	}
	const product_id = `${params.id}-${params.collection}-${params.product_id}`;
	const details = await getProductDetails(product_id);
	if (!details) {
		error(404, { message: 'Not found' });
	}
	return new Response(JSON.stringify(details));
};

export const POST: RequestHandler = async ({ locals, params, request }) => {
	/**
	 * register a new product to available stac collection
	 * Needs to be superuser to register product
	 */
	// register a new product to available stac collection
	const session = await locals.getSession();

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
	const stac_id = params.id;
	const collection = params.collection;
	const product_id = params.product_id;
	const expression = requestBody.expression;
	const description = requestBody.description;
	const assets = requestBody.assets;

	const product: Product = {
		id: `${stac_id}-${collection}-${product_id}`,
		stac_id: stac_id,
		collection: collection,
		label: product_id,
		expression: expression,
		assets: assets,
		description: description
	};
	const productRegistered = await registerProduct(product);
	if (!productRegistered) {
		error(400, { message: 'Bad request' });
	}
	// return new Response(JSON.stringify(product))
	return new Response(JSON.stringify({ message: 'Product registered', product: product }));
};

export const DELETE: RequestHandler = async ({ locals, params }) => {
	/**
	 * delete a product
	 * Needs to be superuser to delete product
	 */
	// delete a product
	const session = await locals.getSession();
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
	const product_id = `${params.id}-${params.collection}-${params.product_id}`;
	const deleted = await deleteProduct(product_id);
	if (!deleted) {
		error(404, { message: 'Could not delete missing product' });
	}
	return new Response(JSON.stringify({ message: 'Product deleted' }));
};
