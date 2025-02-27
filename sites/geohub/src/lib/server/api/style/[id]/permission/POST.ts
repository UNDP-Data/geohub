import { Endpoint, z, type RouteModifier, error as appError } from 'sveltekit-api';
import { error } from '@sveltejs/kit';
import { AddSecurictyModifier } from '$api/securityModifier';
import { styleExists } from './shared';
import { StylePermissionManager, type StylePermission } from '$lib/server/StylePermissionManager';
import type { Permission } from '$lib/config/AppConfig';

export const Output = z.custom<StylePermission[]>();

export const Param = z.object({
	id: z.string().describe('Style ID')
});

export const Input = z.object({
	style_id: z.string().describe('style ID'),
	user_email: z.string().email().describe('user email address'),
	permission: z.custom<Permission>().describe('permission. 1: READ, 2: WRITE, 3: OWNER')
});

const description = `
Register user permission for a style

- only users with owner/write/read permission can register.
- users with write permission cannot register owner permission to a user.
- users with read permission can register read permission to a user.
`;

export const Modifier: RouteModifier = (c) => {
	c.summary = 'Register user permission for a style';
	c.description = description;
	c.tags = ['style'];
	c = AddSecurictyModifier(c);
	return c;
};

export const Error = {
	400: appError(400, 'Invalid parameter'),
	404: appError(404, `No style found.`),
	403: appError(403, 'Permission error')
};

export default new Endpoint({ Param, Output, Modifier }).handle(
	async (param, { locals, request }) => {
		const session = await locals.auth();
		if (!session) error(403, { message: 'Permission error' });

		const user_email = session?.user.email;
		const id = parseInt(param.id);

		const body = await request.json();
		if (!body.style_id) {
			error(400, { message: 'style_id property is required' });
		}
		if (id !== body.style_id) {
			error(400, { message: 'style_id property in body and pathparam is not the same' });
		}
		if (!body.user_email) {
			error(400, { message: 'user_email property is required' });
		}
		if (!body.permission) {
			error(400, { message: 'permission property is required' });
		}

		const permission: StylePermission = {
			style_id: body.style_id,
			user_email: body.user_email,
			permission: body.permission
		};

		const style = await styleExists(id);
		if (!style) {
			error(404, { message: `No style found.` });
		}

		const dpm = new StylePermissionManager(id, user_email);
		await dpm.register(permission);
		const permissions = await dpm.getAll();
		return permissions;
	}
);
