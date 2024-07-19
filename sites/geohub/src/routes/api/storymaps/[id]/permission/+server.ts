import type { RequestHandler } from './$types';
import DatabaseManager from '$lib/server/DatabaseManager';
import { error } from '@sveltejs/kit';
import {
	StorymapPermissionManager,
	type StorymapPermission
} from '$lib/server/StorymapPermissionManager.ts';
import type { PoolClient } from 'pg';

const storymapExists = async (client: PoolClient, id: string) => {
	const query = {
		text: `SELECT id FROM geohub.storymap WHERE id= $1`,
		values: [id]
	};
	const res = await client.query(query);
	if (res.rowCount === 0) {
		return false;
	}
	return true;
};

export const GET: RequestHandler = async ({ params, locals }) => {
	const session = await locals.auth();
	if (!session) error(403, { message: 'Permission error' });

	const user_email = session?.user.email;

	const id = params.id;

	const dbm = new DatabaseManager();
	const client = await dbm.start();
	try {
		const exists = await storymapExists(client, id);
		if (!exists) {
			error(404, { message: `No storymap found.` });
		}

		const dpm = new StorymapPermissionManager(id, user_email);
		const permissions = await dpm.getAll(client);

		return new Response(JSON.stringify(permissions));
	} catch (err) {
		error(500, err);
	} finally {
		dbm.end();
	}
};

export const POST: RequestHandler = async ({ params, locals, request }) => {
	const session = await locals.auth();
	if (!session) error(403, { message: 'Permission error' });

	const user_email = session?.user.email;

	const id = params.id;

	const body = await request.json();
	if (!body.storymap_id) {
		error(400, { message: 'storymap_id property is required' });
	}
	if (id !== body.storymap_id) {
		error(400, { message: 'storymap_id property in body and pathparam is not the same' });
	}
	if (!body.user_email) {
		error(400, { message: 'user_email property is required' });
	}
	if (!body.permission) {
		error(400, { message: 'permission property is required' });
	}

	const permission: StorymapPermission = {
		storymap_id: body.storymap_id,
		user_email: body.user_email,
		permission: body.permission
	};

	const dbm = new DatabaseManager();
	const client = await dbm.transactionStart();

	try {
		const exists = await storymapExists(client, id);
		if (!exists) {
			error(404, { message: `No storymap found.` });
		}

		const dpm = new StorymapPermissionManager(id, user_email);
		await dpm.register(client, permission);
		const permissions = await dpm.getAll(client);

		return new Response(JSON.stringify(permissions));
	} catch (err) {
		error(500, err);
	} finally {
		dbm.transactionEnd();
	}
};

export const PUT: RequestHandler = async ({ params, locals, request }) => {
	const session = await locals.auth();
	if (!session) error(403, { message: 'Permission error' });

	const user_email = session?.user.email;

	const id = params.id;

	const body = await request.json();
	if (!body.storymap_id) {
		error(400, { message: 'storymap_id property is required' });
	}
	if (id !== body.storymap_id) {
		error(400, { message: 'storymap_id property in body and pathparam is not the same' });
	}
	if (!body.user_email) {
		error(400, { message: 'user_email property is required' });
	}
	if (!body.permission) {
		error(400, { message: 'permission property is required' });
	}
	if (!body.createdat) {
		error(400, { message: 'createdat property is required' });
	}

	const permission: StorymapPermission = {
		storymap_id: body.storymap_id,
		user_email: body.user_email,
		permission: body.permission,
		createdat: body.createdat
	};

	const dbm = new DatabaseManager();
	const client = await dbm.transactionStart();
	try {
		const exists = await storymapExists(client, id);
		if (!exists) {
			error(404, { message: `No storymap found.` });
		}

		const dpm = new StorymapPermissionManager(id, user_email);
		await dpm.update(client, permission);
		const permissions = await dpm.getAll(client);

		return new Response(JSON.stringify(permissions));
	} catch (err) {
		error(500, err);
	} finally {
		dbm.transactionEnd();
	}
};

export const DELETE: RequestHandler = async ({ params, locals, url }) => {
	const session = await locals.auth();
	if (!session) error(403, { message: 'Permission error' });

	const user_email = session?.user.email;

	const id = params.id;
	const target_email = url.searchParams.get('user_email');
	if (!target_email) {
		error(400, { message: `query parameter of user_email is required.` });
	}

	const dbm = new DatabaseManager();
	const client = await dbm.transactionStart();
	try {
		const exists = await storymapExists(client, id);
		if (!exists) {
			error(404, { message: `No storymap found.` });
		}

		const dpm = new StorymapPermissionManager(id, user_email);
		await dpm.delete(client, target_email);
		const permissions = await dpm.getAll(client);

		return new Response(JSON.stringify(permissions));
	} catch (err) {
		error(500, err);
	} finally {
		dbm.transactionEnd();
	}
};
