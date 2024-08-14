import { error, type RequestHandler } from '@sveltejs/kit';
import { isSuperuser } from '$lib/server/helpers';
import DatabaseManager from '$lib/server/DatabaseManager';
import { ProductManager } from '$lib/server/Product';

export const GET: RequestHandler = async ({ locals }) => {
	const dbm = new DatabaseManager(locals.pool);
	const client = await dbm.start();

	try {
		const query = {
			text: `SELECT id, description, expression, label FROM geohub.product`
		};
		const res = await client.query(query);

		const products = res.rows;
		return new Response(JSON.stringify(products));
	} catch (err) {
		error(500, err);
	} finally {
		await dbm.end();
	}
};

export const POST: RequestHandler = async ({ locals, request }) => {
	const session = await locals.auth();
	if (!session) {
		error(403, { message: 'Permission error' });
	}
	const user_email = session?.user.email;

	let is_superuser = false;
	if (user_email) {
		is_superuser = await isSuperuser(locals.pool, user_email);
	}
	if (!is_superuser) {
		error(403, { message: 'Permission error' });
	}
	const { id, description, expression, label } = await request.json();
	const dbm = new DatabaseManager(locals.pool);
	const client = await dbm.transactionStart();

	const pm = new ProductManager(id, description, expression, label);

	try {
		const product = await pm.insert(client);
		return new Response(JSON.stringify(product));
	} catch (err) {
		await dbm.transactionRollback();
		throw err;
	} finally {
		await dbm.transactionEnd();
	}
};
