import { error, type RequestHandler } from '@sveltejs/kit';
import { isSuperuser } from '$lib/server/helpers';
import DatabaseManager from '$lib/server/DatabaseManager';
import { ProductManager } from '$lib/server/Product';

export const GET: RequestHandler = async ({ params, locals }) => {
	const id = params.id;
	const dbm = new DatabaseManager(locals.pool);
	const client = await dbm.start();

	const pm = new ProductManager(id);
	try {
		const product = await pm.get(client);
		if (!product) {
			error(404, { message: `does not exist in the database` });
		}
		return new Response(JSON.stringify(product));
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
		is_superuser = await isSuperuser(locals.pool, user_email);
	}
	if (!is_superuser) {
		error(403, { message: 'Permission error' });
	}
	const { description, expression, label } = await request.json();
	const id = params.id;
	const dbm = new DatabaseManager(locals.pool);
	const client = await dbm.transactionStart();
	const pm = new ProductManager(id, description, expression, label);
	try {
		let product = await pm.get(client);
		if (!product) {
			error(404, { message: `Does not exist in the database` });
		}
		product = await pm.update(client);

		return new Response(JSON.stringify(product));
	} catch (err) {
		await dbm.transactionRollback();
		throw err;
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
		is_superuser = await isSuperuser(locals.pool, user_email);
	}
	if (!is_superuser) {
		error(403, { message: 'Permission error' });
	}

	const id = params.id;
	const dbm = new DatabaseManager(locals.pool);
	const client = await dbm.transactionStart();

	const pm = new ProductManager(id);
	try {
		const product = await pm.get(client);
		if (!product) {
			error(404, { message: `Does not exist in the database` });
		}
		await pm.delete(client);

		return new Response(undefined, {
			status: 204
		});
	} catch (err) {
		dbm.transactionRollback();
		throw err;
	} finally {
		await dbm.transactionEnd();
	}
};
