import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { isSuperuser } from '$lib/server/helpers';
import { signJWT, verifyJWT, type TokenPayload } from '$lib/server/token';

export const GET: RequestHandler = async ({ locals, url }) => {
	const session = await locals.getSession();
	if (!session) error(403, { message: 'Permission error' });

	const user = session.user;
	const user_email = user.email;
	let is_superuser = false;
	if (user_email) {
		is_superuser = await isSuperuser(user_email);
	}

	let duration = url.searchParams.get('duration');
	if (duration && !is_superuser) {
		error(403, { message: 'Only approved users can specify duration to expire.' });
	}

	if (!duration) {
		// default expiry is 1 hour
		duration = '1h';
	}

	const payload: { [key: string]: string } = {
		id: user.id,
		name: user.name,
		email: user_email
	};

	const token = await signJWT(payload, { exp: duration });

	const decoded: TokenPayload = await verifyJWT(token);
	const expiry = new Date(decoded.exp * 1000).toISOString();

	return new Response(
		JSON.stringify({
			token,
			expiry
		})
	);
};
