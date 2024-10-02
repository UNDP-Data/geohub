import type { RequestHandler } from './$types';
import { error } from '@sveltejs/kit';
import { getSTAC, getSTACs, isSuperuser, upsertSTAC } from '$lib/server/helpers';
import type { Stac } from '$lib/types';

export const GET: RequestHandler = async ({ locals, url }) => {
	const session = await locals.auth();

	const user_email = session?.user.email;

	let is_superuser = false;
	if (user_email) {
		is_superuser = await isSuperuser(user_email);
	}
	if (!is_superuser) {
		error(403, { message: 'Permission error' });
	}

	const type = url.searchParams.get('type');
	const stacs = await getSTACs(type);

	return new Response(JSON.stringify(stacs));
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

	const body: Stac = (await request.json()) as unknown as Stac;

	const exists = await getSTAC(body.id);
	if (exists) {
		error(400, {
			message: `${body.id} is already registered at the database, please use PUT if you want to update this.`
		});
	}

	const updatedStac = await upsertSTAC(body, user_email);

	return new Response(JSON.stringify(updatedStac));
};
