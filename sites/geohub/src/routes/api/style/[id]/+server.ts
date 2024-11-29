import type { RequestHandler } from './$types';
import { getStyleById, isSuperuser } from '$lib/server/helpers';
import type { DashboardMapStyle } from '$lib/types';
import { getDomainFromEmail } from '$lib/helper';
import { AccessLevel, MapStyleIds, Permission, type MapStyleType } from '$lib/config/AppConfig';
import { error } from '@sveltejs/kit';
import { styleInGeohub } from '$lib/server/schema';
import { db } from '$lib/server/db';
import { eq } from 'drizzle-orm';

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

	const basemap = (url.searchParams.get('basemap') as MapStyleType) ?? '';
	if (basemap.length > 0 && !MapStyleIds.includes(basemap)) {
		error(400, {
			message: `Invalid basemap parameter. It must be one of ${MapStyleIds.join(', ')}.`
		});
	}

	const hillshade = url.searchParams.get('hillshade') ?? 'false';
	const isHillshade = hillshade.toLowerCase() === 'true';

	const terrain = url.searchParams.get('terrain') ?? 'false';
	const isTerrain = terrain.toLowerCase() === 'true';

	const style: DashboardMapStyle = (await getStyleById(
		styleId,
		url,
		user_email,
		is_superuser,
		basemap,
		isHillshade,
		isTerrain
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

	await db.delete(styleInGeohub).where(eq(styleInGeohub.id, styleId));

	return new Response(undefined, {
		status: 204
	});
};
