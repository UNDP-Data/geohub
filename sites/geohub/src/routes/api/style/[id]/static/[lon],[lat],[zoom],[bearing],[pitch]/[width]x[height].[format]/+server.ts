import type { RequestHandler } from './$types';
import { error } from '@sveltejs/kit';
import { getStyleById, isSuperuser } from '$lib/server/helpers';
import type { DashboardMapStyle } from '$lib/types';
import { getDomainFromEmail } from '$lib/helper';
import { AccessLevel } from '$lib/config/AppConfig';
import { env } from '$env/dynamic/private';

export const GET: RequestHandler = async ({ locals, params, url }) => {
	const session = await locals.getSession();

	const lon = Number(params.lon);
	const lat = Number(params.lat);
	const zoom = Number(params.zoom);
	const bearing = Number(params.bearing);
	const pitch = Number(params.pitch);
	const width = Number(params.width);
	const height = Number(params.height);

	const ratio = url.searchParams.get('ratio') ? Number(url.searchParams.get('ratio')) : 1;
	if (!(ratio === 1 || ratio === 2)) {
		throw error(400, 'ratio should be either 1 or 2.');
	}

	const format = params.format;
	if (!['jpeg', 'png', 'webp'].includes(format)) {
		throw error(400, 'Unsupported format.');
	}

	const user_email = session?.user.email;

	let is_superuser = false;
	if (user_email) {
		is_superuser = await isSuperuser(user_email);
	}

	const id = params.id;
	const style = (await getStyleById(
		parseInt(id),
		url,
		user_email,
		is_superuser
	)) as DashboardMapStyle;

	const email = session?.user?.email;
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

	const apiUrl = `${env.GEOHUB_STATIC_IMAGE_API}/style/static/${lon},${lat},${zoom},${bearing},${pitch}/${width}x${height}.${format}?ratio=${ratio}`;
	const res = await fetch(apiUrl, {
		method: 'POST',
		body: JSON.stringify(style.style)
	});
	if (!res.ok) {
		throw error(res.status, { message: res.statusText });
	}
	const image = await res.blob();

	return new Response(image, {
		headers: {
			'Content-type': `image/${format}`
		}
	});
};
