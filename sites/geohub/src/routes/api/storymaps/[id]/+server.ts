import type { RequestHandler } from './$types';
import { isSuperuser } from '$lib/server/helpers';
import DatabaseManager from '$lib/server/DatabaseManager';
import { AccessLevel, Permission } from '$lib/config/AppConfig';
import StorymapManager from '$lib/server/StorymapManager';
import { StorymapPermissionManager } from '$lib/server/StorymapPermissionManager';
import { getDomainFromEmail } from '$lib/helper';
import { error } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ params, locals, url }) => {
	const session = await locals.auth();
	const user_email = session?.user.email;
	let is_superuser = false;
	if (user_email) {
		is_superuser = await isSuperuser(user_email);
	}

	const id = params.id;

	const dbm = new DatabaseManager();
	const client = await dbm.start();
	try {
		const sm = new StorymapManager();
		const story = await sm.getById(client, id, is_superuser, user_email);
		if (!story) {
			return new Response(JSON.stringify({ message: `No storymap found.` }), {
				status: 404
			});
		}

		if (story.style) {
			story.style = `${url.origin}${story.style}`;
		}
		story.chapters.forEach((ch) => {
			ch.style = `${url.origin}${ch.style}`;
		});

		story.links = story.links.map((l) => {
			l.href = new URL(l.href, url.origin).href;
			return l;
		});

		if (!is_superuser) {
			const sp = new StorymapPermissionManager(id, user_email);
			const permission = await sp.getBySignedUser(client);
			if (!(permission && permission >= Permission.READ)) {
				const domain = user_email ? getDomainFromEmail(user_email) : undefined;
				const access_level: AccessLevel = story.access_level;
				if (access_level === AccessLevel.PRIVATE) {
					if (story.created_user !== user_email) {
						return new Response(
							JSON.stringify({ message: `No permission to access to this storymap.` }),
							{
								status: 403
							}
						);
					}
				} else if (access_level === AccessLevel.ORGANIZATION) {
					if (!story.created_user.endsWith(domain)) {
						return new Response(
							JSON.stringify({ message: `No permission to access to this storymap.` }),
							{
								status: 403
							}
						);
					}
				}
			}
		}

		return new Response(JSON.stringify(story));
	} catch (err) {
		error(500, err);
	} finally {
		dbm.end();
	}
};

export const DELETE: RequestHandler = async ({ params, locals }) => {
	const session = await locals.auth();
	if (!session) {
		return new Response(JSON.stringify({ message: 'Permission error' }), {
			status: 403
		});
	}
	const user_email = session?.user.email;
	let is_superuser = false;
	if (user_email) {
		is_superuser = await isSuperuser(user_email);
	}

	const id = params.id;

	const dbm = new DatabaseManager();
	const client = await dbm.transactionStart();
	try {
		let sm = new StorymapManager();

		const story = await sm.getById(client, id, is_superuser, user_email);
		if (!story) {
			return new Response(JSON.stringify({ message: `No storymap found.` }), {
				status: 404
			});
		}

		if (!(story.permission === Permission.OWNER)) {
			return new Response(
				JSON.stringify({ message: `You don't have permission to delete this storymap.` }),
				{
					status: 403
				}
			);
		}

		sm = new StorymapManager(story);
		await sm.delete(client, story.id);

		return new Response(undefined, {
			status: 204
		});
	} catch (err) {
		await dbm.transactionRollback();
		throw err;
	} finally {
		await dbm.transactionEnd();
	}
};
