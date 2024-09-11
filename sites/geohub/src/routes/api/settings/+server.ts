import type { RequestHandler } from '@sveltejs/kit';
import { DefaultUserConfig, type UserConfig } from '$lib/config/DefaultUserConfig';
import { eq } from 'drizzle-orm';
import { userSettingsInGeohub } from '$lib/server/schema';
import { db } from '$lib/server/db';

export const POST: RequestHandler = async ({ request, locals }) => {
	const session = await locals.auth();
	if (!session) {
		return new Response(JSON.stringify({ message: 'Permission error' }), {
			status: 403
		});
	}

	const user_email = session.user.email;
	const settings: JSON = await request.json();

	await db
		.insert(userSettingsInGeohub)
		.values({ userEmail: user_email, settings: settings })
		.onConflictDoUpdate({ target: userSettingsInGeohub.userEmail, set: { settings: settings } });

	return new Response(JSON.stringify({ message: 'Settings saved' }), {});
};

export const GET: RequestHandler = async ({ locals }) => {
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
		return new Response(JSON.stringify(DefaultUserConfig), {});
	} else {
		const data: UserConfig = Object.assign(DefaultUserConfig, settings.settings as UserConfig);
		if (typeof data.DataPageIngestingJoinVectorTiles === 'string') {
			data.DataPageIngestingJoinVectorTiles =
				data.DataPageIngestingJoinVectorTiles === 'true' ? true : false;
		}

		return new Response(JSON.stringify(data), {});
	}
};
