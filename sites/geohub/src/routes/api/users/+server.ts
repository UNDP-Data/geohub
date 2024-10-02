import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { like } from 'drizzle-orm';
import { usersInGeohub } from '$lib/server/schema';

export const GET: RequestHandler = async ({ locals, url }) => {
	const session = await locals.auth();
	if (!session) error(403, { message: 'Permission error' });

	const query = url.searchParams.get('query');
	if (!query) error(400, { message: `'query' param is required.` });

	const MINIMUM_QUERY_LENGTH = 3;

	if (query.length < MINIMUM_QUERY_LENGTH) {
		error(400, { message: `Search by at least ${MINIMUM_QUERY_LENGTH} characters` });
	}

	const limit = url.searchParams.get('limit') ?? '10';

	const users = await db
		.select({ id: usersInGeohub.id, user_email: usersInGeohub.userEmail })
		.from(usersInGeohub)
		.where(like(usersInGeohub.userEmail, `%${query}%`))
		.limit(parseInt(limit));

	return new Response(JSON.stringify(users));
};
