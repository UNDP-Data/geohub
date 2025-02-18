import { Endpoint, z, type RouteModifier, error as appError } from 'sveltekit-api';
import { error } from '@sveltejs/kit';
import { AddSecurictyModifier } from '$api/securityModifier';
import { styleExists } from './shared';
import { StylePermissionManager, type StylePermission } from '$lib/server/StylePermissionManager';

export const Output = z.custom<StylePermission[]>();

export const Param = z.object({
	id: z.string().describe('Style ID')
});

export const Modifier: RouteModifier = (c) => {
	c.summary = 'Get permission info for a style';
	c.description = 'Get permission info for a style';
	c.tags = ['style'];
	c = AddSecurictyModifier(c);
	return c;
};

export const Error = {
	404: appError(404, `No style found.`),
	403: appError(403, 'Permission error')
};

export default new Endpoint({ Param, Output, Modifier }).handle(async (param, { locals }) => {
	const session = await locals.auth();
	if (!session) error(403, { message: 'Permission error' });

	const user_email = session?.user.email;
	const id = parseInt(param.id);

	const style = await styleExists(id);
	if (!style) {
		error(404, { message: `No style found.` });
	}

	const dpm = new StylePermissionManager(id, user_email);
	const permissions = await dpm.getAll();

	return permissions;
});
