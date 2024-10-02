import type { RequestHandler } from './$types';
import { getStyleById, isSuperuser } from '$lib/server/helpers';
import DatabaseManager from '$lib/server/DatabaseManager';
import type { DashboardMapStyle } from '$lib/types';
import { getDomainFromEmail } from '$lib/helper';
import { AccessLevel, Permission } from '$lib/config/AppConfig';
import { error } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ params, locals, url }) => {
	const session = await locals.auth();
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
		error(404, { message: 'Not found' });
	}

	let domain: string;
	if (email) {
		domain = getDomainFromEmail(email);
	}

	if (!is_superuser) {
		if (!(style.permission && style.permission >= Permission.READ)) {
			const accessLevel: AccessLevel = style.access_level;
			if (accessLevel === AccessLevel.PRIVATE) {
				error(403, { message: 'Permission error' });
			} else if (accessLevel === AccessLevel.ORGANIZATION) {
				if (!(domain && style.created_user?.indexOf(domain) > -1)) {
					error(403, { message: 'Permission error' });
				}
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
	const session = await locals.auth();
	if (!session) {
		error(403, { message: 'Permission error' });
	}

	const styleId = Number(params.id);
	if (!styleId) {
		error(400, { message: 'id parameter is required.' });
	}

	const user_email = session?.user.email;

	let is_superuser = false;
	if (user_email) {
		is_superuser = await isSuperuser(user_email);
	}
	const style = (await getStyleById(styleId, url, user_email, is_superuser)) as DashboardMapStyle;
	if (!style) {
		error(404, { message: 'Not found' });
	}

	if (!is_superuser) {
		// check if signed in user has owner permission
		if (!(style.permission && style.permission === Permission.OWNER)) {
			error(403, { message: 'Permission error. Needs OWNER permission to delete' });
		}
	}

	const dbm = new DatabaseManager();
	const client = await dbm.transactionStart();
	try {
		const query = {
			text: `DELETE FROM geohub.style WHERE id = $1`,
			values: [styleId]
		};

		const res = await client.query(query);
		if (res.rowCount === 0) {
			error(404, { message: `${styleId} does not exist in the database` });
		}
		return new Response(undefined, {
			status: 204
		});
	} catch (err) {
		dbm.transactionRollback();
		error(500, err);
	} finally {
		dbm.transactionEnd();
	}
};
