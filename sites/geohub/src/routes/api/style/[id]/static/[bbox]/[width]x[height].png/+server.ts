import type { RequestHandler } from './$types';
import { error } from '@sveltejs/kit';
import { getStyleById } from '$lib/server/helpers';
import type { DashboardMapStyle } from '$lib/types';
import { getDomainFromEmail } from '$lib/helper';
import { AccessLevel } from '$lib/config/AppConfig';
import { env } from '$env/dynamic/private';

export const GET: RequestHandler = async ({ locals, params, url }) => {
	const session = await locals.getSession();

	const bbox = params.bbox;
	const width = Number(params.width);
	const height = Number(params.height);

	const id = params.id;
	const style = (await getStyleById(
		parseInt(id),
		url,
		session?.user?.email,
		session?.user?.is_superuser
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

	const apiUrl = `${env.GEOHUB_STATIC_IMAGE_API}/style/static/${bbox}/${width}x${height}.png`;
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
			'Content-type': 'image/png'
		}
	});
};
