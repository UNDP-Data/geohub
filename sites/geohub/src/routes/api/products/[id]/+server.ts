import { error, type RequestHandler } from '@sveltejs/kit';
import { isSuperuser } from '$lib/server/helpers';
import DatabaseManager from '$lib/server/DatabaseManager';
import Product from '$lib/server/Product';

export const GET: RequestHandler = async ({ params }) => {
	const id = params['id'];
	const dbm = new DatabaseManager();
	const client = await dbm.start();

	try {
		const query = {
			text: `SELECT id, label, expression, description FROM geohub.product WHERE id = $1`,
			values: [id]
		};
		const res = await client.query(query);
		const products = res.rows[0];
		return new Response(JSON.stringify(products));
	} catch (err) {
		error(500, err);
	} finally {
		await dbm.end();
	}
};

export const PUT: RequestHandler = async ({ locals, request, params }) => {
	const session = await locals.auth();
	if (!session) {
		error(403, { message: 'Permission error' });
	}
	let is_superuser = false;
	const user_email = session?.user.email;
	if (user_email) {
		is_superuser = await isSuperuser(user_email);
	}
	if (!is_superuser) {
		error(403, { message: 'Permission error' });
	}
	const { description, expression, label } = await request.json();
	const id = params.id;
	const dbm = new DatabaseManager();
	const client = await dbm.transactionStart();
	const product = new Product(id, description, expression, label);
	try {
		const res = await product.upsertProduct(client);
		if (res.rowCount === 0) {
			error(404, { message: `Does not exist in the database` });
		}
		return new Response(
			JSON.stringify({
				message: 'Product updated'
			})
		);
	} catch (err) {
		await dbm.transactionRollback();
		error(500, err);
	} finally {
		await dbm.transactionEnd();
	}
};

export const DELETE: RequestHandler = async ({ locals, params }) => {
	const session = await locals.auth();
	if (!session) {
		error(403, { message: 'Permission error' });
	}
	let is_superuser = false;
	const user_email = session?.user.email;
	if (user_email) {
		is_superuser = await isSuperuser(user_email);
	}
	if (!is_superuser) {
		error(403, { message: 'Permission error' });
	}

	const id = params.id;
	const query = `DELETE FROM geohub.product WHERE id=$1`;
	const dbm = new DatabaseManager();
	const client = await dbm.transactionStart();

	try {
		const res = await client.query(query, [id]);
		if (res.rowCount === 0) {
			error(404, { message: `does not exist in the database` });
		}
		return new Response(undefined, {
			status: 204
		});
	} catch (err) {
		dbm.transactionRollback();
		error(500, err);
	} finally {
		await dbm.transactionEnd();
	}
};
