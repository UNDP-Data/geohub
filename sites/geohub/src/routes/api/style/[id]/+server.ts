import type { RequestHandler } from './$types';
import { getStyleById } from '$lib/server/helpers';
import DatabaseManager from '$lib/server/DatabaseManager';

export const GET: RequestHandler = async ({ params, locals, url }) => {
	const session = await locals.getSession();

	const styleId = Number(params.id);
	if (!styleId) {
		return new Response(JSON.stringify({ message: `id parameter is required.` }), {
			status: 400
		});
	}

	const style = await getStyleById(styleId, url, session?.user?.email);

	if (!style) {
		return new Response(undefined, {
			status: 404
		});
	}

	return new Response(JSON.stringify(style));
};

/**
 * Delete style.json which is stored in PostgreSQL database
 * DELETE: ./api/style/{id}
 */
export const DELETE: RequestHandler = async ({ params, url, locals }) => {
	const session = await locals.getSession();
	if (!session) {
		return new Response(JSON.stringify({ message: 'Permission error' }), {
			status: 403
		});
	}
	const dbm = new DatabaseManager();
	const client = await dbm.transactionStart();
	try {
		const styleId = Number(params.id);
		if (!styleId) {
			return new Response(JSON.stringify({ message: `id parameter is required.` }), {
				status: 400
			});
		}

		const style = await getStyleById(styleId, url, session?.user?.email);
		if (!style) {
			return new Response(undefined, {
				status: 404
			});
		}

		const email = session?.user?.email;
		// only allow to delete style created by login user it self.
		if (!(email && email === style.created_user)) {
			return new Response(JSON.stringify({ message: 'Permission error' }), {
				status: 403
			});
		}

		const query = {
			text: `DELETE FROM geohub.style WHERE id = $1`,
			values: [styleId]
		};

		const res = await client.query(query);
		if (res.rowCount === 0) {
			return new Response(
				JSON.stringify({ message: `${styleId} does not exist in the database` }),
				{
					status: 404
				}
			);
		}
		return new Response(undefined, {
			status: 204
		});
	} catch (err) {
		dbm.transactionRollback();
		throw err;
	} finally {
		dbm.transactionEnd();
	}
};
