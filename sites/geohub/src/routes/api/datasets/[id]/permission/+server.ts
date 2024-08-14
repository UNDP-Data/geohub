import type { RequestHandler } from './$types';
import { getDatasetById, isSuperuser } from '$lib/server/helpers';
import DatabaseManager from '$lib/server/DatabaseManager';
import { error } from '@sveltejs/kit';
import {
	DatasetPermissionManager,
	type DatasetPermission
} from '$lib/server/DatasetPermissionManager';

export const GET: RequestHandler = async ({ params, locals }) => {
	const session = await locals.auth();
	if (!session) error(403, { message: 'Permission error' });

	const user_email = session?.user.email;
	let is_superuser = false;
	if (user_email) {
		is_superuser = await isSuperuser(locals.pool, user_email);
	}

	const id = params.id;

	const dbm = new DatabaseManager(locals.pool);
	const client = await dbm.start();
	try {
		const dataset = await getDatasetById(client, id, is_superuser, user_email);
		if (!dataset) {
			error(404, { message: `No dataset found.` });
		}

		const dpm = new DatasetPermissionManager(id, user_email);
		const permissions = await dpm.getAll(client);

		return new Response(JSON.stringify(permissions));
	} finally {
		dbm.end();
	}
};

export const POST: RequestHandler = async ({ params, locals, request }) => {
	const session = await locals.auth();
	if (!session) error(403, { message: 'Permission error' });

	const user_email = session?.user.email;
	let is_superuser = false;
	if (user_email) {
		is_superuser = await isSuperuser(user_email);
	}

	const id = params.id;

	const body = await request.json();
	if (!body.dataset_id) {
		error(400, { message: 'dataset_id property is required' });
	}
	if (id !== body.dataset_id) {
		error(400, { message: 'dataset_id property in body and pathparam is not the same' });
	}
	if (!body.user_email) {
		error(400, { message: 'user_email property is required' });
	}
	if (!body.permission) {
		error(400, { message: 'permission property is required' });
	}

	const dataset_permission: DatasetPermission = {
		dataset_id: body.dataset_id,
		user_email: body.user_email,
		permission: body.permission
	};

	const dbm = new DatabaseManager(locals.pool);
	const client = await dbm.transactionStart();
	try {
		const dataset = await getDatasetById(client, id, is_superuser, user_email);
		if (!dataset) {
			error(404, { message: `No dataset found.` });
		}

		const dpm = new DatasetPermissionManager(id, user_email);
		await dpm.register(client, dataset_permission);
		const permissions = await dpm.getAll(client);

		return new Response(JSON.stringify(permissions));
	} finally {
		dbm.transactionEnd();
	}
};

export const PUT: RequestHandler = async ({ params, locals, request }) => {
	const session = await locals.auth();
	if (!session) error(403, { message: 'Permission error' });

	const user_email = session?.user.email;
	let is_superuser = false;
	if (user_email) {
		is_superuser = await isSuperuser(user_email);
	}

	const id = params.id;

	const body = await request.json();
	if (!body.dataset_id) {
		error(400, { message: 'dataset_id property is required' });
	}
	if (id !== body.dataset_id) {
		error(400, { message: 'dataset_id property in body and pathparam is not the same' });
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

	const dataset_permission: DatasetPermission = {
		dataset_id: body.dataset_id,
		user_email: body.user_email,
		permission: body.permission,
		createdat: body.createdat
	};

	const dbm = new DatabaseManager(locals.pool);
	const client = await dbm.transactionStart();
	try {
		const dataset = await getDatasetById(client, id, is_superuser, user_email);
		if (!dataset) {
			error(404, { message: `No dataset found.` });
		}

		const dpm = new DatasetPermissionManager(id, user_email);
		await dpm.update(client, dataset_permission);
		const permissions = await dpm.getAll(client);

		return new Response(JSON.stringify(permissions));
	} finally {
		dbm.transactionEnd();
	}
};

export const DELETE: RequestHandler = async ({ params, locals, url }) => {
	const session = await locals.auth();
	if (!session) error(403, { message: 'Permission error' });

	const user_email = session?.user.email;
	let is_superuser = false;
	if (user_email) {
		is_superuser = await isSuperuser(user_email);
	}

	const id = params.id;
	const target_email = url.searchParams.get('user_email');
	if (!target_email) {
		error(400, { message: `query parameter of user_email is required.` });
	}

	const dbm = new DatabaseManager(locals.pool);
	const client = await dbm.transactionStart();
	try {
		const dataset = await getDatasetById(client, id, is_superuser, user_email);
		if (!dataset) {
			error(404, { message: `No dataset found.` });
		}

		const dpm = new DatasetPermissionManager(id, user_email);
		await dpm.delete(client, target_email);
		const permissions = await dpm.getAll(client);

		return new Response(JSON.stringify(permissions));
	} finally {
		dbm.transactionEnd();
	}
};
