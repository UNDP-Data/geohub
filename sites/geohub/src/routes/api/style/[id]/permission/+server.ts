import type { RequestHandler } from './$types';
import { getStyleById, isSuperuser } from '$lib/server/helpers';
import DatabaseManager from '$lib/server/DatabaseManager';
import { error } from '@sveltejs/kit';
import {
	StylePermissionManager,
	type StylePermission
} from '$lib/server/StylePermissionManager.ts';

export const GET: RequestHandler = async ({ params, locals, url }) => {
	const session = await locals.auth();
	if (!session) error(403, { message: 'Permission error' });

	const user_email = session?.user.email;
	let is_superuser = false;
	if (user_email) {
		is_superuser = await isSuperuser(user_email);
	}

	const id = parseInt(params.id);

	const style = await getStyleById(id, url, user_email, is_superuser);
	if (!style) {
		error(404, { message: `No style found.` });
	}

	const dbm = new DatabaseManager();
	const client = await dbm.start();
	try {
		const dpm = new StylePermissionManager(id, user_email);
		const permissions = await dpm.getAll(client);

		return new Response(JSON.stringify(permissions));
	} finally {
		dbm.end();
	}
};

export const POST: RequestHandler = async ({ params, locals, request, url }) => {
	const session = await locals.auth();
	if (!session) error(403, { message: 'Permission error' });

	const user_email = session?.user.email;
	let is_superuser = false;
	if (user_email) {
		is_superuser = await isSuperuser(user_email);
	}

	const id = parseInt(params.id);

	const body = await request.json();
	if (!body.style_id) {
		error(400, { message: 'style_id property is required' });
	}
	if (id !== body.style_id) {
		error(400, { message: 'style_id property in body and pathparam is not the same' });
	}
	if (!body.user_email) {
		error(400, { message: 'user_email property is required' });
	}
	if (!body.permission) {
		error(400, { message: 'permission property is required' });
	}

	const permission: StylePermission = {
		style_id: body.style_id,
		user_email: body.user_email,
		permission: body.permission
	};

	const style = await getStyleById(id, url, user_email, is_superuser);
	if (!style) {
		error(404, { message: `No style found.` });
	}

	const dbm = new DatabaseManager();
	const client = await dbm.transactionStart();
	try {
		const dpm = new StylePermissionManager(id, user_email);
		await dpm.register(client, permission);
		const permissions = await dpm.getAll(client);

		return new Response(JSON.stringify(permissions));
	} finally {
		dbm.transactionEnd();
	}
};

export const PUT: RequestHandler = async ({ params, locals, request, url }) => {
	const session = await locals.auth();
	if (!session) error(403, { message: 'Permission error' });

	const user_email = session?.user.email;
	let is_superuser = false;
	if (user_email) {
		is_superuser = await isSuperuser(user_email);
	}

	const id = parseInt(params.id);

	const body = await request.json();
	if (!body.style_id) {
		error(400, { message: 'style_id property is required' });
	}
	if (id !== body.style_id) {
		error(400, { message: 'style_id property in body and pathparam is not the same' });
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

	const permission: StylePermission = {
		style_id: body.style_id,
		user_email: body.user_email,
		permission: body.permission,
		createdat: body.createdat
	};

	const style = await getStyleById(id, url, user_email, is_superuser);
	if (!style) {
		error(404, { message: `No style found.` });
	}

	const dbm = new DatabaseManager();
	const client = await dbm.transactionStart();
	try {
		const dpm = new StylePermissionManager(id, user_email);
		await dpm.update(client, permission);
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

	const id = parseInt(params.id);
	const target_email = url.searchParams.get('user_email');
	if (!target_email) {
		error(400, { message: `query parameter of user_email is required.` });
	}

	const style = await getStyleById(id, url, user_email, is_superuser);
	if (!style) {
		error(404, { message: `No style found.` });
	}

	const dbm = new DatabaseManager();
	const client = await dbm.transactionStart();
	try {
		const dpm = new StylePermissionManager(id, user_email);
		await dpm.delete(client, target_email);
		const permissions = await dpm.getAll(client);

		return new Response(JSON.stringify(permissions));
	} finally {
		dbm.transactionEnd();
	}
};
