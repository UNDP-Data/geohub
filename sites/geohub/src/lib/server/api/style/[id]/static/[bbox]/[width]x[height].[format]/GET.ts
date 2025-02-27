import { z, type RouteModifier, error as apiError } from 'sveltekit-api';
import { type RequestEvent } from '@sveltejs/kit';
import { error } from '@sveltejs/kit';
import { getStyleById, isSuperuser } from '$lib/server/helpers';
import type { DashboardMapStyle } from '$lib/types';
import { getDomainFromEmail } from '$lib/helper';
import { AccessLevel } from '$lib/config/AppConfig';
import { env } from '$env/dynamic/private';
import { Output as _Output, Query as _Query, CommonParam } from '../../shared';
import { AddSecurictyModifier } from '$api/securityModifier';

export const Output = _Output;
export const Query = _Query;
export const Param = CommonParam.merge(
	z.object({
		bbox: z
			.string()
			.describe('bbox (minx, miny, maxx, maxy)')
			.openapi({ example: '-4.04296875,-15.114552871944102,48.69140625,19.476950206488414' })
	})
);

export const Error = {
	400: apiError(400, `Invalid parameters`),
	403: apiError(403, 'Permission error'),
	404: apiError(404, 'Not found')
};

export const Modifier: RouteModifier = (c) => {
	c.summary = 'Static image by bbox';
	c.description = `get static image by BBOX`;
	c.tags = ['style'];
	c = AddSecurictyModifier(c);
	return c;
};

export default async function (
	param: z.infer<typeof Param & typeof Query>,
	{ fetch, url, locals }: RequestEvent
): Promise<Response> {
	const session = await locals.auth();

	const bbox = param.bbox;
	const width = Number(param.width);
	const height = Number(param.height);

	const ratio = param.ratio ? Number(param.ratio) : 1;
	if (!(ratio === 1 || ratio === 2)) {
		error(400, 'ratio should be either 1 or 2.');
	}

	const format = param.format;
	if (!['jpeg', 'png', 'webp'].includes(format)) {
		error(400, 'Unsupported format.');
	}

	const user_email = session?.user.email;

	let is_superuser = false;
	if (user_email) {
		is_superuser = await isSuperuser(user_email);
	}

	const id = param.id;
	const style = (await getStyleById(
		parseInt(id),
		url,
		user_email,
		is_superuser
	)) as DashboardMapStyle;

	if (!is_superuser) {
		const email = session?.user?.email;
		let domain: string;
		if (email) {
			domain = getDomainFromEmail(email);
		}

		const accessLevel: AccessLevel = style.access_level;
		if (accessLevel === AccessLevel.PRIVATE) {
			if (!(email && email === style.created_user)) {
				error(403, { message: 'Permission error' });
			}
		} else if (accessLevel === AccessLevel.ORGANIZATION) {
			if (!(domain && style.created_user?.indexOf(domain) > -1)) {
				error(403, { message: 'Permission error' });
			}
		}
	}

	const apiUrl = `${env.GEOHUB_STATIC_IMAGE_API}/style/static/${bbox}/${width}x${height}.${format}?ratio=${ratio}`;
	const res = await fetch(apiUrl, {
		method: 'POST',
		body: JSON.stringify(style.style)
	});
	if (!res.ok) {
		error(res.status, { message: res.statusText });
	}
	const image = await res.blob();

	return new Response(image, {
		headers: {
			'Content-type': `image/${format}`
		}
	});
}
