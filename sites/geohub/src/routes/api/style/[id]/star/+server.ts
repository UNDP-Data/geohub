import type { RequestHandler } from './$types';
import { getStyleStarCount } from '$lib/server/helpers';
import DatabaseManager from '$lib/server/DatabaseManager';
import { error } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ locals, params }) => {
	const session = await locals.getSession();
	if (!session) {
		error(403, { message: 'Permission error' });
	}

	const style_id = parseInt(params.id);
	const user_email = session.user.email;
	const now = new Date().toISOString();

	const dbm = new DatabaseManager();
	const client = await dbm.start();
	try {
		const query = {
			text: `
        INSERT INTO geohub.style_favourite (
            style_id, user_email, savedat
        ) values (
            $1,
            $2,
            $3::timestamptz
        )
        ON CONFLICT (style_id, user_email)
        DO
        UPDATE
        SET
        savedat=$3::timestamptz
        `,
			values: [style_id, user_email, now]
		};

		await client.query(query);

		const stars = await getStyleStarCount(client, style_id);

		const res = {
			style_id,
			user_email,
			savedat: now,
			no_stars: stars
		};

		return new Response(JSON.stringify(res));
	} catch (err) {
		error(400, err);
	} finally {
		dbm.end();
	}
};

export const DELETE: RequestHandler = async ({ locals, params }) => {
	const session = await locals.getSession();
	if (!session) {
		error(403, { message: 'Permission error' });
	}

	const style_id = parseInt(params.id);
	const user_email = session.user.email;

	const dbm = new DatabaseManager();
	const client = await dbm.start();
	try {
		const query = {
			text: `DELETE FROM geohub.style_favourite WHERE style_id=$1 and user_email=$2`,
			values: [style_id, user_email]
		};

		await client.query(query);

		const stars = await getStyleStarCount(client, style_id);

		const res = {
			style_id,
			no_stars: stars
		};

		return new Response(JSON.stringify(res));
	} catch (err) {
		error(400, err);
	} finally {
		dbm.end();
	}
};
