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
	if (Object.keys(productDetails).length === 0) {
		error(404, { message: 'Not found' });
	}
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
		text: `INSERT INTO geohub.stac_collection_product (stac_id, collection_id, product_id, assets) VALUES ($1, $2, $3, $4) ON CONFLICT (stac_id, collection_id, product_id) DO NOTHING;`,
		values: [stac_id, collection_id, product_id, assets]
	};

	try {
		await client.query(query);
		return new Response(JSON.stringify({ message: 'Product registered' }));
	} catch (err) {
		await dbm.transactionRollback();
		error(500, err);
	} finally {
		await dbm.transactionEnd();
	}
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
	const stacId = params.id;
	const collectionId = params.collection;
	const productId = params.product_id;
	const deleteResult = await deleteProduct(stacId, collectionId, productId);

	return new Response(JSON.stringify(deleteResult));
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
