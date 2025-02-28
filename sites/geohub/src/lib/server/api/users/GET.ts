import { Endpoint, z, error as apiError, type RouteModifier } from 'sveltekit-api';
import { AddSecurictyModifier } from '$api/securityModifier';
import { error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { usersInGeohub } from '$lib/server/schema';
import { like } from 'drizzle-orm';

export const Output = z.array(
	z.object({
		id: z.string().describe('User ID'),
		user_email: z.string().describe('User email address')
	})
);

export const Query = z.object({
	query: z.string().describe('Email address to search'),
	limit: z.string().min(0).default('10').optional().describe('search limit. Default is 10')
});

export const Error = {
	403: apiError(403, 'Permission error')
};

export const Modifier: RouteModifier = (c) => {
	c.summary = 'Search registered users';
	c.description = 'Search registered users by email address';
	c.tags = ['users'];
	c = AddSecurictyModifier(c);
	return c;
};

export default new Endpoint({ Query, Output, Error, Modifier }).handle(
	async (param, { locals }) => {
		const session = await locals.auth();
		if (!session) error(403, { message: 'Permission error' });

		const query = param.query;
		if (!query) error(400, { message: `'query' param is required.` });

		const MINIMUM_QUERY_LENGTH = 3;
		if (query.length < MINIMUM_QUERY_LENGTH) {
			error(400, { message: `Search by at least ${MINIMUM_QUERY_LENGTH} characters` });
		}

		const limit = param.limit ?? '10';

		const users = await db
			.select({ id: usersInGeohub.id, user_email: usersInGeohub.userEmail })
			.from(usersInGeohub)
			.where(like(usersInGeohub.userEmail, `%${query}%`))
			.limit(parseInt(limit));

		return users;
	}
);
