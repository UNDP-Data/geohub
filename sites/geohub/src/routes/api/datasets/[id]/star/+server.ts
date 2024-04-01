import type { RequestHandler } from './$types';
import { getDatasetStarCount } from '$lib/server/helpers';
import DatabaseManager from '$lib/server/DatabaseManager';

export const POST: RequestHandler = async ({ locals, params }) => {
	const session = await locals.auth();
	if (!session) {
		return new Response(JSON.stringify({ message: 'Permission error' }), {
			status: 403
		});
	}

	const dataset_id = params.id;
	const user_email = session.user.email;
	const now = new Date().toISOString();

	const dbm = new DatabaseManager();
	const client = await dbm.start();
	try {
		const query = {
			text: `
        INSERT INTO geohub.dataset_favourite (
            dataset_id, user_email, savedat
        ) values (
            $1,
            $2,
            $3::timestamptz
        )
        ON CONFLICT (dataset_id, user_email)
        DO
        UPDATE
        SET
        savedat=$3::timestamptz
        `,
			values: [dataset_id, user_email, now]
		};

		await client.query(query);

		const stars = await getDatasetStarCount(client, dataset_id);

		const res = {
			dataset_id,
			user_email,
			savedat: now,
			no_stars: stars
		};

		return new Response(JSON.stringify(res));
	} catch (err) {
		return new Response(JSON.stringify({ message: err.message }), {
			status: 400
		});
	} finally {
		dbm.end();
	}
};

export const DELETE: RequestHandler = async ({ locals, params }) => {
	const session = await locals.auth();
	if (!session) {
		return new Response(JSON.stringify({ message: 'Permission error' }), {
			status: 403
		});
	}

	const dataset_id = params.id;
	const user_email = session.user.email;

	const dbm = new DatabaseManager();
	const client = await dbm.start();
	try {
		const query = {
			text: `DELETE FROM geohub.dataset_favourite WHERE dataset_id=$1 and user_email=$2`,
			values: [dataset_id, user_email]
		};

		await client.query(query);

		const stars = await getDatasetStarCount(client, dataset_id);

		const res = {
			dataset_id,
			no_stars: stars
		};

		return new Response(JSON.stringify(res));
	} catch (err) {
		return new Response(JSON.stringify({ message: err.message }), {
			status: 400
		});
	} finally {
		dbm.end();
	}
};
