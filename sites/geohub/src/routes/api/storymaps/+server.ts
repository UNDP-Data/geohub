import type { RequestHandler } from './$types';
import type { StoryMapConfig, StoryMapChapter } from '$lib/types';
import DatabaseManager from '$lib/server/DatabaseManager';
import { error } from '@sveltejs/kit';
import StorymapManager from '$lib/server/StorymapManager';
import { isSuperuser } from '$lib/server/helpers';
import { Permission } from '$lib/config/AppConfig';

export const POST: RequestHandler = async ({ locals, request }) => {
	const session = await locals.auth();
	if (!session) error(403, { message: 'Permission error' });

	const user_email = session?.user.email;
	let is_superuser = false;
	if (user_email) {
		is_superuser = await isSuperuser(user_email);
	}

	const body: StoryMapConfig = await request.json();

	if (!(body.chapters.length > 0)) {
		error(400, { message: 'at least a chapter is required' });
	}

	const now = new Date().toISOString();
	if (!body.created_user) {
		body.created_user = user_email;
		body.createdat = now;
	}
	body.updated_user = user_email;
	body.updatedat = now;

	body.chapters.forEach((ch) => {
		const chapter = ch as unknown as StoryMapChapter;
		chapter.created_user = body.created_user;
		chapter.createdat = body.createdat;
		chapter.updated_user = body.updated_user;
		chapter.updatedat = body.updatedat;
	});

	const dbm = new DatabaseManager();
	let storymap: StoryMapConfig;
	try {
		const client = await dbm.transactionStart();

		const sm = new StorymapManager(body);

		const story = await sm.getById(client, body.id, is_superuser, user_email);
		// if story id already exists, check user permission
		if (!(story && story.permission >= Permission.WRITE)) {
			return new Response(
				JSON.stringify({ message: `You don't have permission to edit this storymap.` }),
				{
					status: 403
				}
			);
		}

		storymap = await sm.upsert(client);
		storymap = await sm.getById(client, storymap.id, is_superuser, user_email);
	} catch (err) {
		dbm.transactionRollback();
		throw err;
	} finally {
		await dbm.transactionEnd();
	}
	return new Response(JSON.stringify(storymap));
};
