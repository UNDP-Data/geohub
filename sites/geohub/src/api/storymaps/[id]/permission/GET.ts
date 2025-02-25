import { Endpoint, z, type RouteModifier, error as appError } from 'sveltekit-api';
import { error } from '@sveltejs/kit';
import { AddSecurictyModifier } from '$api/securityModifier';
import { storymapExists } from './shared';
import {
	StorymapPermissionManager,
	type StorymapPermission
} from '$lib/server/StorymapPermissionManager';

export const Output = z.custom<StorymapPermission[]>();

export const Param = z.object({
	id: z.string().uuid().describe('Storymap UUID')
});

export const Modifier: RouteModifier = (c) => {
	c.summary = 'Get permission info for a storymap';
	c.description = 'Get permission info for a storymap';
	c.tags = ['storymap'];
	c = AddSecurictyModifier(c);
	return c;
};

export const Error = {
	404: appError(404, `No storymap found.`),
	403: appError(403, 'Permission error')
};

export default new Endpoint({ Param, Output, Modifier }).handle(async (param, { locals }) => {
	const session = await locals.auth();
	if (!session) error(403, { message: 'Permission error' });

	const user_email = session?.user.email;
	const id = param.id;

	const style = await storymapExists(id);
	if (!style) {
		error(404, { message: `No storymap found.` });
	}

	const dpm = new StorymapPermissionManager(id, user_email);
	const permissions = await dpm.getAll();

	return permissions;
});
