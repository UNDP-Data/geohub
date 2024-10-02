import type { RequestHandler } from './$types';
import { error } from '@sveltejs/kit';
import {
	StorymapPermissionManager,
	type StorymapPermission
} from '$lib/server/StorymapPermissionManager.ts';
import { db } from '$lib/server/db';
import { eq } from 'drizzle-orm';
import { storymapInGeohub } from '$lib/server/schema';

const storymapExists = async (id: string) => {
	const st = await db
		.select({ id: storymapInGeohub.id })
		.from(storymapInGeohub)
		.where(eq(storymapInGeohub.id, id));
	return st && st.length > 0;
};

export const GET: RequestHandler = async ({ params, locals }) => {
	const session = await locals.auth();
	if (!session) error(403, { message: 'Permission error' });

	const user_email = session?.user.email;

	const id = params.id;

	const exists = await storymapExists(id);
	if (!exists) {
		error(404, { message: `No storymap found.` });
	}

	const dpm = new StorymapPermissionManager(id, user_email);
	const permissions = await dpm.getAll();

	return new Response(JSON.stringify(permissions));
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

	const exists = await storymapExists(id);
	if (!exists) {
		error(404, { message: `No storymap found.` });
	}

	const dpm = new StorymapPermissionManager(id, user_email);
	await dpm.register(permission);
	const permissions = await dpm.getAll();

	return new Response(JSON.stringify(permissions));
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

	const exists = await storymapExists(id);
	if (!exists) {
		error(404, { message: `No storymap found.` });
	}

	const dpm = new StorymapPermissionManager(id, user_email);
	await dpm.update(permission);
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

	const exists = await storymapExists(id);
	if (!exists) {
		error(404, { message: `No storymap found.` });
	}

	const dpm = new StorymapPermissionManager(id, user_email);
	await dpm.delete(target_email);
	const permissions = await dpm.getAll();

	return new Response(JSON.stringify(permissions));
};
