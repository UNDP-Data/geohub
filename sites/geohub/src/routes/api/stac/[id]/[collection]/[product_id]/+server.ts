import { error, type RequestHandler } from '@sveltejs/kit';
import { isSuperuser, getProductDetails, deleteProduct } from '$lib/server/helpers';
import DatabaseManager from '$lib/server/DatabaseManager';

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

	const productDetails = await getProductDetails(params.id, params.collection, params.product_id);
	const expression = productDetails?.expression;
	const assets = productDetails?.assets;
	const asset_index_mapping = assets.map((asset: string, index: number) => {
		return {
			[`asset${index + 1}`]: asset
		};
	});

	productDetails.expression = replaceTextWithMapping(expression, asset_index_mapping);

	if (!productDetails) {
		error(404, { message: 'Not found' });
	}
	return new Response(JSON.stringify(productDetails));
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
	const stac_id = params.id;
	const collection_id = params.collection;
	const product_id = params.product_id;

	const dbm = new DatabaseManager();
	const client = await dbm.start();

	const query = {
		text: `INSERT INTO geohub.stac_collection_product (stac_id, collection_id, product_id, assets) VALUES ($1, $2, $3, $4)`,
		values: [stac_id, collection_id, product_id, assets]
	};

	await client
		.query(query)
		.then(() => {
			client.release();
		})
		.catch((e) => {
			client.release();
			error(500, { message: e.message });
		});

	return new Response(JSON.stringify({ message: 'Product registered' }));
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
	const product_id = `${params.id}-${params.collection}-${params.product_id}`;
	const deleted = await deleteProduct(product_id);
	if (!deleted) {
		error(404, { message: 'Could not delete missing product' });
	}
	return new Response(JSON.stringify({ message: 'Product deleted' }));
};

// Function to replace text based on mapping
const replaceTextWithMapping = (text: string, mapping: never[]) => {
	for (let i = 0; i < mapping.length; i++) {
		const key = Object.keys(mapping[i])[0];
		const value = mapping[i][key];
		const regex = new RegExp('\\{' + key + '\\}', 'g');
		text = text.replace(regex, value);
	}
	return text;
};
