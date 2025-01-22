import type { RequestHandler } from './$types';
import { isSuperuser } from '$lib/server/helpers';
import { AccessLevel, Permission } from '$lib/config/AppConfig';
import StorymapManager from '$lib/server/StorymapManager';
import { StorymapPermissionManager } from '$lib/server/StorymapPermissionManager';
import { getDomainFromEmail } from '$lib/helper';
import type { StyleSpecification } from 'maplibre-gl';

export const GET: RequestHandler = async ({ params, locals, url, fetch }) => {
	const session = await locals.auth();
	const user_email = session?.user.email as string;
	let is_superuser = false;
	if (user_email) {
		is_superuser = await isSuperuser(user_email);
	}

	const id = params.id;

	const sm = new StorymapManager();
	const story = await sm.getById(id, is_superuser, user_email);
	if (!story) {
		return new Response(JSON.stringify({ message: `No storymap found.` }), {
			status: 404
		});
	}

	if (story.style) {
		if (story.location.center && story.location.center[0] === null) {
			const res = await fetch(story.style as string);
			if (res.ok) {
				const style: StyleSpecification = await res.json();
				story.location.center = (style.center as [number, number]) ?? [0, 0];
				story.location.zoom = style.zoom ?? 0;
				story.location.bearing = style.bearing ?? 0;
				story.location.pitch = style.pitch ?? 0;
			} else {
				story.location.center = [0, 0];
				story.location.zoom = 0;
				story.location.bearing = 0;
				story.location.pitch = 0;
			}
		}

		story.style = `${url.origin}${story.style}`;
	}
	story.chapters.forEach((ch) => {
		ch.style = `${url.origin}${ch.style}`;
	});

	story.links = story.links?.map((l) => {
		const _url = new URL(decodeURI(l.href), url.origin);
		const subUrl = _url.searchParams.get('url');
		if (subUrl) {
			_url.searchParams.set('url', new URL(subUrl, url.origin).href);
		}
		l.href = decodeURI(_url.href);
		return l;
	});

	if (!is_superuser) {
		const sp = new StorymapPermissionManager(id, user_email);
		const permission = await sp.getBySignedUser();
		if (!(permission && permission >= Permission.READ)) {
			const domain = user_email ? getDomainFromEmail(user_email) : undefined;
			const access_level: AccessLevel = story.access_level as AccessLevel;
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
				if (!story.created_user?.endsWith(domain as string)) {
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

	let sm = new StorymapManager();

	const story = await sm.getById(id, is_superuser, user_email);
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
	await sm.delete(story.id as string);

	return new Response(undefined, {
		status: 204
	});
};
