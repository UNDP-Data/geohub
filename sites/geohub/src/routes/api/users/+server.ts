import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { searchUsersByEmail } from '$lib/server/helpers';

export const GET: RequestHandler = async ({ locals, url }) => {
	const session = await locals.getSession();
	if (!session) error(403, { message: 'Permission error' });

	const query = url.searchParams.get('query');
	if (!query) error(400, { message: `'query' param is required.` });

	const MINIMUM_QUERY_LENGTH = 3;

	if (query.length < MINIMUM_QUERY_LENGTH) {
		error(400, { message: `Search by at least ${MINIMUM_QUERY_LENGTH} characters` });
	}

	const limit = url.searchParams.get('limit') ?? '10';

	const users = await searchUsersByEmail(query, parseInt(limit));

	return new Response(JSON.stringify(users));
};
