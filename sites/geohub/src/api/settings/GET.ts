import { db } from '$lib/server/db';
import { userSettingsInGeohub } from '$lib/server/schema';
import { eq } from 'drizzle-orm';
import { Endpoint, z, type RouteModifier } from 'sveltekit-api';
import { DefaultUserConfig, type UserConfig } from '$lib/config/DefaultUserConfig';
import { AddSecurictyModifier } from '$api/securityModifier';

export const Output = z
	.custom<UserConfig>()
	.describe('GeoHub user setting object')
	.openapi({ example: JSON.parse(JSON.stringify(DefaultUserConfig)) });

export const Modifier: RouteModifier = (c) => {
	c.summary = 'Get GeoHub user settings';
	c.description = `Get GeoHub user settings. If unsigned user, it returns default settings`;
	c.tags = ['settings'];
	c = AddSecurictyModifier(c);
	return c;
};

export default new Endpoint({ Output, Modifier })
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	// eslint-disable-next-line no-empty-pattern
	.handle(async ({}, { locals }) => {
		const session = await locals.auth();
		if (!session) {
			return new Response(JSON.stringify(DefaultUserConfig), {});
		}
		const user_email = session.user?.email;

		const settings = await db.query.userSettingsInGeohub.findFirst({
			where: eq(userSettingsInGeohub.userEmail, user_email)
		});
		if (!settings) {
			// no settings found for this user in the database
			return DefaultUserConfig;
		} else {
			const data: UserConfig = Object.assign(
				JSON.parse(JSON.stringify(DefaultUserConfig)),
				settings.settings as UserConfig
			);
			if (typeof data.DataPageIngestingJoinVectorTiles === 'string') {
				data.DataPageIngestingJoinVectorTiles =
					data.DataPageIngestingJoinVectorTiles === 'true' ? true : false;
			}
			return data;
		}
	});
