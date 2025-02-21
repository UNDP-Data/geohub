import { Endpoint, z, type RouteModifier, error as appError } from 'sveltekit-api';
import { error } from '@sveltejs/kit';
import { AddSecurictyModifier } from '$api/securityModifier';
import { storymapExists } from './shared';
import {
	StorymapPermissionManager,
	type StorymapPermission
} from '$lib/server/StorymapPermissionManager';
import type { Permission } from '$lib/config/AppConfig';

export const Output = z.custom<StorymapPermission[]>();

export const Param = z.object({
	id: z.string().uuid().describe('Storymap UUID')
});

export const Input = z.object({
	storymap_id: z.string().uuid().describe('Storymap UUID'),
	user_email: z.string().email().describe('user email address'),
	permission: z.custom<Permission>().describe('permission. 1: READ, 2: WRITE, 3: OWNER'),
	createdate: z.string().describe('createdat date')
});

const description = `
Update user permission for a storymap

- signed user cannot update their own permission
- only users with owner/write/read permission can update.
- users with write permission cannot update owner permission to a user.
- users with read permission cannot update owner/write permission to a user.
`;

export const Modifier: RouteModifier = (c) => {
	c.summary = 'Update user permission for a storymap';
	c.description = description;
	c.tags = ['storymap'];
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

		const id = param.id;

		const body = await request.json();
		if (!body.storymap_id) {
			error(400, { message: 'storymap_id property is required' });
		}
		if (id !== body.storymap_id) {
			error(400, { message: 'storymap_id property in body and pathparam is not the same' });
		}
		if (!body.user_email) {
			error(400, { message: 'user_email property is required' });
		}
		if (!body.permission) {
			error(400, { message: 'permission property is required' });
		}
		if (!body.createdat) {
			error(400, { message: 'createdat property is required' });
		}

		const permission: StorymapPermission = {
			storymap_id: body.storymap_id,
			user_email: body.user_email,
			permission: body.permission,
			createdat: body.createdat
		};

		const exists = await storymapExists(id);
		if (!exists) {
			error(404, { message: `No storymap found.` });
		}

		const dpm = new StorymapPermissionManager(id, user_email);
		await dpm.update(permission);
		const permissions = await dpm.getAll();
		return permissions;
	}
);
