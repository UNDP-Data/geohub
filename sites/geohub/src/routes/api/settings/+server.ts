import type { RequestHandler } from '@sveltejs/kit';
import DatabaseManager from '$lib/server/DatabaseManager';
import { DefaultUserConfig, type UserConfig } from '$lib/config/DefaultUserConfig';

export const POST: RequestHandler = async ({ request, locals }) => {
	const session = await locals.auth();
	if (!session) {
		return new Response(JSON.stringify({ message: 'Permission error' }), {
			status: 403
		});
	}
	// Create a new DatabaseManager instance and create a new client
	const dbm = new DatabaseManager();
	const client = await dbm.start();

	try {
		const body = await request.json();
		const query = {
			text: `INSERT INTO geohub.user_settings (user_email, settings) VALUES ($1, $2) ON CONFLICT (user_email) DO UPDATE SET settings = $2`,
			values: [session.user.email, body]
		};
		await client.query(query);
		return new Response(JSON.stringify({ message: 'Settings saved' }), {});
	} catch (err) {
		return new Response(JSON.stringify({ message: err.message }), {
			status: 400
		});
	} finally {
		await dbm.end();
	}
};

export const GET: RequestHandler = async ({ locals }) => {
	const session = await locals.auth();
	if (!session) {
		return new Response(JSON.stringify(DefaultUserConfig), {});
	}
	const user_email = session.user.email;
	const dbm = new DatabaseManager();
	const client = await dbm.start();
	try {
		const query = {
			text: `SELECT settings FROM geohub.user_settings WHERE user_email = '${user_email}'`
		};
		const res = await client.query(query);
		if (res.rowCount === 0) {
			// no settings found for this user in the database
			return new Response(JSON.stringify(DefaultUserConfig), {});
		}
		const data: UserConfig = Object.assign(DefaultUserConfig, res.rows[0].settings as UserConfig);

		if (typeof data.DataPageIngestingJoinVectorTiles === 'string') {
			data.DataPageIngestingJoinVectorTiles =
				data.DataPageIngestingJoinVectorTiles === 'true' ? true : false;
		}

		return new Response(JSON.stringify(data), {});
	} catch (err) {
		return new Response(
			JSON.stringify({
				message: err.message
			}),
			{
				status: 400
			}
		);
	} finally {
		await dbm.end();
	}
};
