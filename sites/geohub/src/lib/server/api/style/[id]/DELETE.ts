import { z, type RouteModifier, error as apiError } from 'sveltekit-api';
import { AddSecurictyModifier } from '$api/securityModifier';
import { error, type RequestEvent } from '@sveltejs/kit';
import { isSuperuser } from '$lib/server/helpers/isSuperuser';
import { Permission } from '$lib/config/AppConfig';
import { getStyleById } from '$lib/server/helpers/getStyleById';
import type { DashboardMapStyle } from '$lib/types';
import { db } from '$lib/server/db';
import { styleInGeohub } from '$lib/server/schema';
import { eq } from 'drizzle-orm';

export const Output = z.custom<DashboardMapStyle>().describe('Style object to return');

export const Param = z.object({
	id: z.string().describe('Style ID')
});

export const Error = {
	400: apiError(400, `Invalid parameters`),
	403: apiError(403, 'Permission error'),
	404: apiError(404, 'Not found')
};

export const Modifier: RouteModifier = (c) => {
	c.summary = 'Delete style by ID';
	c.description = 'Delete style by ID';
	c.tags = ['style'];
	c = AddSecurictyModifier(c);
	return c;
};

export default async function (
	param: z.infer<typeof Param>,
	{ url, locals }: RequestEvent
): Promise<Response> {
	const session = await locals.auth();
	if (!session) {
		error(403, { message: 'Permission error' });
	}

	const styleId = Number(param.id);
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
}
