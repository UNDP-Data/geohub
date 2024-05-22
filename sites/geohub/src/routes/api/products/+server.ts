import { error, type RequestHandler } from '@sveltejs/kit';
import { isSuperuser } from '$lib/server/helpers';
import DatabaseManager from '$lib/server/DatabaseManager';

export const GET: RequestHandler = async ({ locals, url }) => {
	const session = await locals.auth();
	if (!session) {
		error(403, { message: 'Permission error' });
	}
	const params = url.searchParams;
	const id = params.get('id');
	const dbm = new DatabaseManager();
	const client = await dbm.start();
	const query = {
		text: `SELECT id, description, expression, label FROM geohub.product ${id ? 'WHERE id=$1' : ''}`,
		values: id ? [id] : []
	};

	const res = await client.query(query).catch((e) => {
		client.release();
		error(500, { message: e.message });
	});
	const products = res.rows;
	client.release();
	return new Response(JSON.stringify(products));
};

export const POST: RequestHandler = async ({ locals, request }) => {
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
	const { id, description, expression, label } = await request.json();

	const query = `INSERT INTO geohub.product (id, description, expression, label) VALUES ($1, $2, $3, $4)`;
	const values = [id, description, expression, label];
	const dbm = new DatabaseManager();
	const client = await dbm.start();

	await client
		.query(query, values)
		.then(() => {
			client.release();
		})
		.catch((e) => {
			client.release();
			error(500, { message: e.message });
		});

	return new Response(
		JSON.stringify({
			id,
			description,
			expression,
			label
		})
	);
};

export const PUT: RequestHandler = async ({ locals, request }) => {
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
	const { id, description, expression, label } = await request.json();
	const query = `UPDATE geohub.product SET description=$2, expression=$3, label=$4 WHERE id=$1`;
	const values = [id, description, expression, label];
	const dbm = new DatabaseManager();
	const client = await dbm.start();
	await client
		.query(query, values)
		.then(() => {
			client.release();
		})
		.catch((e) => {
			client.release();
			error(500, { message: e.message });
		});
	return new Response(
		JSON.stringify({
			message: 'Product updated'
		})
	);
};

export const DELETE: RequestHandler = async ({ locals, url }) => {
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

	const id = url.searchParams.get('id');
	const query = `DELETE FROM geohub.product WHERE id=$1`;
	const dbm = new DatabaseManager();
	const client = await dbm.start();

	const res = await client.query(query, [id]);

	client.on('error', (err) => {
		client.release();
		error(500, { message: err.message });
	});

	if (res.rowCount === 0) {
		client.release();
		error(404, { message: 'Product not found' });
	}

	return new Response(
		JSON.stringify({
			message: 'Product deleted'
		})
	);
};
