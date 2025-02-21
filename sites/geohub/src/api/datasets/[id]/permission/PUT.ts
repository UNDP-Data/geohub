import { Endpoint, z, type RouteModifier, error as appError } from 'sveltekit-api';
import { error } from '@sveltejs/kit';
import { AddSecurictyModifier } from '$api/securityModifier';
import { datasetExists } from './shared';
import type { Permission } from '$lib/config/AppConfig';
import {
	DatasetPermissionManager,
	type DatasetPermission
} from '$lib/server/DatasetPermissionManager';

export const Output = z.custom<DatasetPermission[]>();

export const Param = z.object({
	id: z.string().describe('Dataset ID')
});

export const Input = z.object({
	dataset_id: z.string().describe('Dataset ID'),
	user_email: z.string().email().describe('user email address'),
	permission: z.custom<Permission>().describe('permission. 1: READ, 2: WRITE, 3: OWNER'),
	createdate: z.string().describe('createdat date')
});

const description = `
Update user permission for a dataset

- signed user cannot update their own permission
- only users with owner/write/read permission can update.
- users with write permission cannot update owner permission to a user.
- users with read permission cannot update owner/write permission to a user.
`;

export const Modifier: RouteModifier = (c) => {
	c.summary = 'Update user permission for a dataset';
	c.description = description;
	c.tags = ['datasets'];
	c = AddSecurictyModifier(c);
	return c;
};

export const Error = {
	400: appError(400, 'Invalid parameter'),
	404: appError(404, `No dataset found.`),
	403: appError(403, 'Permission error')
};

export default new Endpoint({ Param, Output, Modifier, Error }).handle(
	async (param, { locals, request }) => {
		const session = await locals.auth();
		if (!session) error(403, { message: 'Permission error' });

		const user_email = session?.user.email;
		const id = param.id;

		const body = await request.json();
		if (!body.dataset_id) {
			error(400, { message: 'dataset_id property is required' });
		}
		if (id !== body.dataset_id) {
			error(400, { message: 'dataset_id property in body and pathparam is not the same' });
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

		const dataset_permission: DatasetPermission = {
			dataset_id: body.dataset_id,
			user_email: body.user_email,
			permission: body.permission,
			createdat: body.createdat
		};

		const exists = await datasetExists(id);
		if (!exists) {
			error(404, { message: `No dataset found.` });
		}

		const dpm = new DatasetPermissionManager(id, user_email);
		await dpm.update(dataset_permission);
		const permissions = await dpm.getAll();
		return permissions;
	}
);
