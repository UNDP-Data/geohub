import { Endpoint, z, type RouteModifier, error as appError } from 'sveltekit-api';
import { error } from '@sveltejs/kit';
import { AddSecurictyModifier } from '$api/securityModifier';
import { styleExists } from './shared';
import { StylePermissionManager, type StylePermission } from '$lib/server/StylePermissionManager';

export const Output = z.custom<StylePermission[]>();

export const Param = z.object({
	id: z.string().describe('Style ID')
});

export const Query = z.object({
	user_email: z.string().email().describe('user email address')
});

const description = `
Delete user permission for a style

- cannot delete signed in user themselves
- only users with owner/write/read permission can delete.
- users with write permission cannot delete owner.
- users with read permission cannot delete owner/write
- if only a user is registered, cannot delete user. at least a user needs to be registered
`;

export const Modifier: RouteModifier = (c) => {
	c.summary = 'Delete user permission for a style';
	c.description = description;
	c.tags = ['style'];
	c = AddSecurictyModifier(c);
	return c;
};

export const Error = {
	404: appError(404, `No style found.`),
	403: appError(403, 'Permission error')
};

export default new Endpoint({ Param, Query, Output, Modifier }).handle(
	async (param, { locals }) => {
		const session = await locals.auth();
		if (!session) error(403, { message: 'Permission error' });

		const user_email = session?.user.email;
		const id = parseInt(param.id);

		const target_email = param.user_email;
		if (!target_email) {
			error(400, { message: `query parameter of user_email is required.` });
		}

		const style = await styleExists(id);
		if (!style) {
			error(404, { message: `No style found.` });
		}

		const dpm = new StylePermissionManager(id, user_email);
		await dpm.delete(target_email);
		const permissions = await dpm.getAll();

		return permissions;
	}
);
