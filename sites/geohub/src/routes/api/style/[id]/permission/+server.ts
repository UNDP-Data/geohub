import type { RequestHandler } from './$types';
import { error } from '@sveltejs/kit';
import {
	StylePermissionManager,
	type StylePermission
} from '$lib/server/StylePermissionManager.ts';
import { db } from '$lib/server/db';
import { eq } from 'drizzle-orm';
import { styleInGeohub } from '$lib/server/schema';

const styleExists = async (id: number) => {
	const st = await db
		.select({ id: styleInGeohub.id })
		.from(styleInGeohub)
		.where(eq(styleInGeohub.id, id));
	return st && st.length > 0;
};

export const GET: RequestHandler = async ({ params, locals }) => {
	const session = await locals.auth();
	if (!session) error(403, { message: 'Permission error' });

	const user_email = session?.user.email;
	const id = parseInt(params.id);

	const style = await styleExists(id);
	if (!style) {
		error(404, { message: `No style found.` });
	}

	const dpm = new StylePermissionManager(id, user_email);
	const permissions = await dpm.getAll();

	return new Response(JSON.stringify(permissions));
};

export const POST: RequestHandler = async ({ params, locals, request }) => {
	const session = await locals.auth();
	if (!session) error(403, { message: 'Permission error' });

	const user_email = session?.user.email;
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

	const style = await styleExists(id);
	if (!style) {
		error(404, { message: `No style found.` });
	}

	const dpm = new StylePermissionManager(id, user_email);
	await dpm.register(permission);
	const permissions = await dpm.getAll();

	return new Response(JSON.stringify(permissions));
};

export const PUT: RequestHandler = async ({ params, locals, request }) => {
	const session = await locals.auth();
	if (!session) error(403, { message: 'Permission error' });

	const user_email = session?.user.email;
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

	const style = await styleExists(id);
	if (!style) {
		error(404, { message: `No style found.` });
	}

	const dpm = new StylePermissionManager(id, user_email);
	await dpm.update(permission);
	const permissions = await dpm.getAll();

	return new Response(JSON.stringify(permissions));
};

export const DELETE: RequestHandler = async ({ params, locals, url }) => {
	const session = await locals.auth();
	if (!session) error(403, { message: 'Permission error' });

	const user_email = session?.user.email;
	const id = parseInt(params.id);

	const target_email = url.searchParams.get('user_email');
	if (!target_email) {
		error(400, { message: `query parameter of user_email is required.` });
	}

	const style = await styleExists(id);
	if (!style) {
		error(404, { message: `No style found.` });
	}

	const dpm = new StylePermissionManager(id, user_email);
	await dpm.delete(target_email);
	const permissions = await dpm.getAll();

	return new Response(JSON.stringify(permissions));
};
