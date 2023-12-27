import type { RequestHandler } from './$types';
import { getStyleById, isSuperuser } from '$lib/server/helpers';
import DatabaseManager from '$lib/server/DatabaseManager';
import type { DashboardMapStyle } from '$lib/types';
import { getDomainFromEmail } from '$lib/helper';
import { AccessLevel } from '$lib/config/AppConfig';
import { error } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ params, locals, url }) => {
	const session = await locals.getSession();
	const email = session?.user?.email;

	const styleId = Number(params.id);
	if (!styleId) {
		return new Response(JSON.stringify({ message: `id parameter is required.` }), {
			status: 400
		});
	}

	const user_email = session?.user.email;

	let is_superuser = false;
	if (user_email) {
		is_superuser = await isSuperuser(user_email);
	}

	const style: DashboardMapStyle = (await getStyleById(
		styleId,
		url,
		user_email,
		is_superuser
	)) as DashboardMapStyle;

	if (!style) {
		throw error(404, { message: 'Not found' });
	}

	let domain: string;
	if (email) {
		domain = getDomainFromEmail(email);
	}

	if (!is_superuser) {
		const accessLevel: AccessLevel = style.access_level;
		if (accessLevel === AccessLevel.PRIVATE) {
			if (!(email && email === style.created_user)) {
				throw error(403, { message: 'Permission error' });
			}
		} else if (accessLevel === AccessLevel.ORGANIZATION) {
			if (!(domain && style.created_user?.indexOf(domain) > -1)) {
				throw error(403, { message: 'Permission error' });
			}
		}
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
		throw error(403, { message: 'Permission error' });
	}
	const dbm = new DatabaseManager();
	const client = await dbm.transactionStart();
	try {
		const styleId = Number(params.id);
		if (!styleId) {
			throw error(400, { message: 'id parameter is required.' });
		}

		const user_email = session?.user.email;

		let is_superuser = false;
		if (user_email) {
			is_superuser = await isSuperuser(user_email);
		}
		const style = (await getStyleById(styleId, url, user_email, is_superuser)) as DashboardMapStyle;
		if (!style) {
			throw error(404, { message: 'Not found' });
		}

		if (!is_superuser) {
			const email = session?.user?.email;
			// only allow to delete style created by login user it self.
			if (!(email && email === style.created_user)) {
				throw error(403, { message: 'Permission error' });
			}

			let domain: string;
			if (email) {
				domain = getDomainFromEmail(email);
			}

			const accessLevel: AccessLevel = style.access_level;
			if (accessLevel === AccessLevel.PRIVATE) {
				if (!(email && email === style.created_user)) {
					throw error(403, { message: 'Permission error' });
				}
			} else if (accessLevel === AccessLevel.ORGANIZATION) {
				if (!(domain && style.created_user?.indexOf(domain) > -1)) {
					throw error(403, { message: 'Permission error' });
				}
			}
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
