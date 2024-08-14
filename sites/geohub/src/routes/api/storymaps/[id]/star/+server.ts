import type { RequestHandler } from './$types';
import { getStoryStarCount } from '$lib/server/helpers';
import DatabaseManager from '$lib/server/DatabaseManager';
import { error } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ locals, params }) => {
	const session = await locals.auth();
	if (!session) {
		error(403, { message: 'Permission error' });
	}

	const storymap_id = params.id;
	const user_email = session.user.email;
	const now = new Date().toISOString();

	const dbm = new DatabaseManager(locals.pool);
	const client = await dbm.start();
	try {
		const query = {
			text: `
        INSERT INTO geohub.storymap_favourite (
            storymap_id, user_email, savedat
        ) values (
            $1,
            $2,
            $3::timestamptz
        )
        ON CONFLICT (storymap_id, user_email)
        DO
        UPDATE
        SET
        savedat=$3::timestamptz
        `,
			values: [storymap_id, user_email, now]
		};

		await client.query(query);

		const stars = await getStoryStarCount(client, storymap_id);

		const res = {
			storymap_id,
			user_email,
			savedat: now,
			no_stars: stars
		};

		return new Response(JSON.stringify(res));
	} catch (err) {
		error(500, err);
	} finally {
		dbm.end();
	}
};

export const DELETE: RequestHandler = async ({ locals, params }) => {
	const session = await locals.auth();
	if (!session) {
		error(403, { message: 'Permission error' });
	}

	const storymap_id = params.id;
	const user_email = session.user.email;

	const dbm = new DatabaseManager(locals.pool);
	const client = await dbm.start();
	try {
		const query = {
			text: `DELETE FROM geohub.storymap_favourite WHERE storymap_id=$1 and user_email=$2`,
			values: [storymap_id, user_email]
		};

		await client.query(query);

		const stars = await getStoryStarCount(client, storymap_id);

		const res = {
			storymap_id,
			no_stars: stars
		};

		return new Response(JSON.stringify(res));
	} catch (err) {
		error(400, err);
	} finally {
		dbm.end();
	}
};
