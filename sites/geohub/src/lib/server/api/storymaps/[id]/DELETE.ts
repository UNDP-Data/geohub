import { z, type RouteModifier, error as apiError } from 'sveltekit-api';
import { isSuperuser } from '$lib/server/helpers/isSuperuser';
import { AddSecurictyModifier } from '$api/securityModifier';
import { error, type RequestEvent } from '@sveltejs/kit';
import StorymapManager from '$lib/server/StorymapManager';
import { Permission } from '$lib/config/AppConfig';

export const Output = z.null().describe('No content returned').openapi({ example: null });

export const Param = z.object({
	id: z.string().uuid().describe('Storymap UUID')
});

export const Modifier: RouteModifier = (c) => {
	c.summary = 'Delete a storymap object by ID';
	c.description = 'Delete a storymap object by storymap ID';
	c.tags = ['storymap'];
	c = AddSecurictyModifier(c);
	return c;
};

export const Error = {
	404: apiError(404, `No storymap found.`),
	403: apiError(403, 'Permission error')
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

	const id = param.id;

	let sm = new StorymapManager();

	const story = await sm.getById(id, is_superuser, user_email);
	if (!story) {
		error(404, { message: `No storymap found.` });
	}

	if (!(story.permission === Permission.OWNER)) {
		error(403, { message: `You don't have permission to delete this storymap.` });
	}

	sm = new StorymapManager(story);
	await sm.delete(story.id as string);

	return new Response(undefined, {
		status: 204
	});
}
