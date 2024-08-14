import type { RequestHandler } from './$types';
import { error } from '@sveltejs/kit';
import { deleteSTAC, getSTAC, isSuperuser, upsertSTAC } from '$lib/server/helpers';
import type { Stac } from '$lib/types';

export const GET: RequestHandler = async ({ params, locals }) => {
	const id = params.id;

	const stac = await getSTAC(locals.pool, id);
	if (!stac) {
		error(404, { message: 'Not found' });
	}

	return new Response(JSON.stringify(stac));
};

export const PUT: RequestHandler = async ({ locals, params, request }) => {
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

	const id = params.id;

	const stac = await getSTAC(locals.pool, id);
	if (!stac) {
		error(404, { message: 'Not found' });
	}

	const body: Stac = (await request.json()) as unknown as Stac;
	const updatedStac = await upsertSTAC(locals.pool, body, user_email);

	return new Response(JSON.stringify(updatedStac));
};

export const DELETE: RequestHandler = async ({ locals, params }) => {
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

	const id = params.id;

	await deleteSTAC(locals.pool, id);

	return new Response(undefined, {
		status: 200,
		statusText: `${id} was deleted successfully`
	});
};
