import { error, type RequestHandler } from '@sveltejs/kit';
import { isSuperuser } from '$lib/server/helpers';
import DatabaseManager from '$lib/server/DatabaseManager';
import type { PoolClient, QueryResult } from 'pg';

/**
 * To register products in GeoHub using the /api/products endpoint
 * ALLOWED METHODS: GET, POST, PUT, DELETE
 */

class Product {
	private id: string;
	private description: string;
	private expression: string;
	private label: string;

	constructor(id: string, description: string, expression: string, label: string) {
		this.id = id;
		this.description = description;
		this.expression = expression;
		this.label = label;
	}

	public async registerProduct(client: PoolClient): Promise<QueryResult> {
		const query = `INSERT INTO geohub.product (id, description, expression, label) VALUES ($1, $2, $3, $4)`;
		const values = [this.id, this.description, this.expression, this.label];
		try {
			return await client.query(query, values);
		} catch (er) {
			error(500, er);
		}
	}

	public async upsertProduct(client: PoolClient): Promise<QueryResult> {
		const query = `UPDATE geohub.product SET description=$2, expression=$3, label=$4 WHERE id=$1`;
		const values = [this.id, this.description, this.expression, this.label];
		try {
			return await client.query(query, values);
		} catch (er) {
			error(500, er);
		}
	}
}

export const GET: RequestHandler = async ({ locals, url }) => {
	const session = await locals.auth();
	if (!session) {
		error(403, { message: 'Permission error' });
	}
	const params = url.searchParams;
	const id = params.get('id');
	const dbm = new DatabaseManager();
	const client = await dbm.start();

	try {
		const query = {
			text: `SELECT id, description, expression, label FROM geohub.product ${id ? 'WHERE id=$1' : ''}`,
			values: id ? [id] : []
		};
		const res = await client.query(query);

		const products = res.rows;
		return new Response(JSON.stringify(products));
	} catch (err) {
		await dbm.transactionRollback();
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
		is_superuser = await isSuperuser(user_email);
	}
	if (!is_superuser) {
		error(403, { message: 'Permission error' });
	}
	const { id, description, expression, label } = await request.json();
	const dbm = new DatabaseManager();
	const client = await dbm.transactionStart();

	const product = new Product(id, description, expression, label);

	try {
		// const query = `INSERT INTO geohub.product (id, description, expression, label) VALUES ($1, $2, $3, $4)`;
		// const values = [id, description, expression, label];
		// await client.query(query, values);
		await product.registerProduct(client);
		return new Response(
			JSON.stringify({
				id,
				description,
				expression,
				label
			})
		);
	} catch (err) {
		await dbm.transactionRollback();
		error(500, err);
	} finally {
		await dbm.transactionEnd();
	}
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
