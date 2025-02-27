import { z, error as apiError, type RouteModifier } from 'sveltekit-api';
import { error, type RequestEvent } from '@sveltejs/kit';
import { deleteSTAC } from '$lib/server/helpers/stac';
import { isSuperuser } from '$lib/server/helpers/isSuperuser';
import { AddSecurictyModifier } from '$api/securityModifier';

export const Param = z.object({
	id: z.string().describe(`STAC server ID`)
});

export const Error = {
	403: apiError(403, 'Permission error'),
	404: apiError(404, 'Not found')
};

export const Modifier: RouteModifier = (c) => {
	c.summary = 'Delete a STAC a API/Catalog from GeoHub';
	c.description = `
**ONLY ALLOW SUPERUSER TO USE THIS API**

Delete a STAC a API/Catalog from GeoHub
	`;
	c = AddSecurictyModifier(c);
	c.tags = ['stac'];
	return c;
};

export default async function (
	param: z.infer<typeof Param>,
	{ locals }: RequestEvent
): Promise<Response> {
	const session = await locals.auth();
	if (!session) {
		error(403, { message: 'Permission error' });
	}

	const user_email = session?.user.email;

	let is_superuser = false;
	if (user_email) {
		is_superuser = await isSuperuser(user_email);
	}
	if (!is_superuser) {
		error(403, { message: 'Permission error' });
	}

	const id = param.id;

	await deleteSTAC(id);

	return new Response(undefined, {
		status: 200,
		statusText: `${id} was deleted successfully`
	});
}
