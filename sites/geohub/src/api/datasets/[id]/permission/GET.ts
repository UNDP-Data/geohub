import { Endpoint, z, type RouteModifier, error as appError } from 'sveltekit-api';
import { error } from '@sveltejs/kit';
import { AddSecurictyModifier } from '$api/securityModifier';
import { datasetExists } from './shared';
import {
	DatasetPermissionManager,
	type DatasetPermission
} from '$lib/server/DatasetPermissionManager';

export const Output = z.custom<DatasetPermission[]>();

export const Param = z.object({
	id: z.string().describe('Dataset ID')
});

export const Modifier: RouteModifier = (c) => {
	c.summary = 'Get permission info for a dataset';
	c.description = 'Get permission info for a dataset';
	c.tags = ['datasets'];
	c = AddSecurictyModifier(c);
	return c;
};

export const Error = {
	404: appError(404, `No dataset found.`),
	403: appError(403, 'Permission error')
};

export default new Endpoint({ Param, Output, Modifier }).handle(async (param, { locals }) => {
	const session = await locals.auth();
	if (!session) error(403, { message: 'Permission error' });

	const user_email = session?.user.email;

	const id = param.id;

	const exists = await datasetExists(id);
	if (!exists) {
		error(404, { message: `No dataset found.` });
	}

	const dpm = new DatasetPermissionManager(id, user_email);
	const permissions = await dpm.getAll();

	return permissions;
});
