import { db } from '$lib/server/db';
import { userSettingsInGeohub } from '$lib/server/schema';
import { Endpoint, z, error as apiError, type RouteModifier } from 'sveltekit-api';
import { DefaultUserConfig, type UserConfig } from '$lib/config/DefaultUserConfig';
import { error } from '@sveltejs/kit';
import { AddSecurictyModifier } from '$api/securityModifier';

export const Output = z.object({
	message: z.string().describe('message string after saving or any error message')
});

export const Input = z
	.custom<UserConfig>()
	.describe('GeoHub user setting object')
	.openapi({ example: JSON.parse(JSON.stringify(DefaultUserConfig)) });

export const Error = {
	403: apiError(403, 'Permission error')
};

export const Modifier: RouteModifier = (c) => {
	c.summary = 'Update GeoHub user settings';
	c.description = `Update GeoHub user settings`;
	c.tags = ['settings'];
	c = AddSecurictyModifier(c);
	return c;
};

export default new Endpoint({ Input, Output, Error, Modifier }).handle(
	async (param, { locals, request }) => {
		const session = await locals.auth();
		if (!session) {
			error(403, { message: 'Permission error' });
		}

		const user_email = session.user.email;
		const settings: UserConfig = await request.json();
		console.log(settings);
		await db
			.insert(userSettingsInGeohub)
			.values({ userEmail: user_email, settings: settings })
			.onConflictDoUpdate({ target: userSettingsInGeohub.userEmail, set: { settings: settings } });

		return { message: 'Settings saved' };
	}
);
