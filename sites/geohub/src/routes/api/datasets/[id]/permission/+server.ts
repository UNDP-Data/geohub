import type { RequestHandler } from './$types';
import { error } from '@sveltejs/kit';
import {
	DatasetPermissionManager,
	type DatasetPermission
} from '$lib/server/DatasetPermissionManager';
import { db } from '$lib/server/db';
import { eq } from 'drizzle-orm';
import { datasetInGeohub } from '$lib/server/schema';

const datasetExists = async (id: string) => {
	const ds = await db
		.select({ id: datasetInGeohub.id })
		.from(datasetInGeohub)
		.where(eq(datasetInGeohub.id, id));
	return ds && ds.length > 0;
};

export const GET: RequestHandler = async ({ params, locals }) => {
	const session = await locals.auth();
	if (!session) error(403, { message: 'Permission error' });

	const user_email = session?.user.email;

	const id = params.id;

	const exists = await datasetExists(id);
	if (!exists) {
		error(404, { message: `No dataset found.` });
	}

	const dpm = new DatasetPermissionManager(id, user_email);
	const permissions = await dpm.getAll();

	return new Response(JSON.stringify(permissions));
};

export const POST: RequestHandler = async ({ params, locals, request }) => {
	const session = await locals.auth();
	if (!session) error(403, { message: 'Permission error' });

	const user_email = session?.user.email;

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

	const exists = await datasetExists(id);
	if (!exists) {
		error(404, { message: `No dataset found.` });
	}

	const dpm = new DatasetPermissionManager(id, user_email);
	await dpm.register(dataset_permission);
	const permissions = await dpm.getAll();

	return new Response(JSON.stringify(permissions));
};

export const PUT: RequestHandler = async ({ params, locals, request }) => {
	const session = await locals.auth();
	if (!session) error(403, { message: 'Permission error' });

	const user_email = session?.user.email;

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

	const exists = await datasetExists(id);
	if (!exists) {
		error(404, { message: `No dataset found.` });
	}

	const dpm = new DatasetPermissionManager(id, user_email);
	await dpm.update(dataset_permission);
	const permissions = await dpm.getAll();

	return new Response(JSON.stringify(permissions));
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

	const exists = await datasetExists(id);
	if (!exists) {
		error(404, { message: `No dataset found.` });
	}

	const dpm = new DatasetPermissionManager(id, user_email);
	await dpm.delete(target_email);
	const permissions = await dpm.getAll();

	return new Response(JSON.stringify(permissions));
};
