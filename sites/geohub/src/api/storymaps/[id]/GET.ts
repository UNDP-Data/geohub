import { Endpoint, z, type RouteModifier, error as appError } from 'sveltekit-api';
import { AddSecurictyModifier } from '$api/securityModifier';
import { isSuperuser } from '$lib/server/helpers/isSuperuser';
import StorymapManager from '$lib/server/StorymapManager';
import { error } from '@sveltejs/kit';
import type { StyleSpecification } from 'maplibre-gl';
import { StorymapPermissionManager } from '$lib/server/StorymapPermissionManager';
import { AccessLevel, Permission } from '$lib/config/AppConfig';
import { getDomainFromEmail } from '$lib/helper';
import type { StoryMapConfig } from '$lib/types';

export const Output = z.custom<StoryMapConfig>().describe('Storymap config object');

export const Param = z.object({
	id: z.string().uuid().describe('Storymap UUID')
});

export const Modifier: RouteModifier = (c) => {
	c.summary = 'Get a storymap object by ID';
	c.description = 'Get a storymap object including all chapters setting in order by storymap ID';
	c.tags = ['storymap'];
	c = AddSecurictyModifier(c);
	return c;
};

export const Error = {
	404: appError(404, `No storymap found.`),
	403: appError(403, 'Permission error')
};

export default new Endpoint({ Param, Output, Modifier }).handle(
	async (param, { locals, url, fetch }) => {
		const session = await locals.auth();
		const user_email = session?.user.email as string;
		let is_superuser = false;
		if (user_email) {
			is_superuser = await isSuperuser(user_email);
		}

		const id = param.id;

		const sm = new StorymapManager();
		const story = await sm.getById(id, is_superuser, user_email);
		if (!story) {
			error(404, { message: `No storymap found.` });
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
			const permission = (await sp.getBySignedUser()) as Permission;
			if (!(permission && permission >= Permission.READ)) {
				const domain = user_email ? getDomainFromEmail(user_email) : undefined;
				const access_level: AccessLevel = story.access_level as AccessLevel;
				if (access_level === AccessLevel.PRIVATE) {
					if (story.created_user !== user_email) {
						error(403, { message: `No permission to access to this storymap.` });
					}
				} else if (access_level === AccessLevel.ORGANIZATION) {
					if (!story.created_user?.endsWith(domain as string)) {
						error(403, { message: `No permission to access to this storymap.` });
					}
				}
			}
		}

		return story;
	}
);
