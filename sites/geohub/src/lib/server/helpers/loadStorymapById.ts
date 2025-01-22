import { AccessLevel, Permission } from '$lib/config/AppConfig';
import { getDomainFromEmail } from '$lib/helper';
import type { StoryMapConfig } from '$lib/types';
import { error } from '@sveltejs/kit';
import StorymapManager from '$lib/server/StorymapManager';
import { isSuperuser } from '$lib/server/helpers/isSuperuser';
import type { StyleSpecification } from 'maplibre-gl';

export const loadStorymapById = async (
	id: string,
	user_email: string,
	socialImage: string,
	url: URL,
	embed = false
) => {
	let is_superuser = false;
	if (user_email) {
		is_superuser = await isSuperuser(user_email);
	}

	const sm = new StorymapManager();
	const storymap: StoryMapConfig = (await sm.getById(
		id,
		is_superuser,
		user_email
	)) as unknown as StoryMapConfig;
	if (!storymap) {
		error(404, { message: `No storymap found.` });
	}

	if (storymap.style) {
		storymap.style = `${url.origin}${storymap.style}`;
	}

	if (storymap.location.center && storymap.location.center[0] === null) {
		const res = await fetch(storymap.style as string);
		if (res.ok) {
			const style: StyleSpecification = await res.json();
			storymap.location.center = (style.center as [number, number]) ?? [0, 0];
			storymap.location.zoom = style.zoom ?? 0;
			storymap.location.bearing = style.bearing ?? 0;
			storymap.location.pitch = style.pitch ?? 0;
		} else {
			storymap.location.center = [0, 0];
			storymap.location.zoom = 0;
			storymap.location.bearing = 0;
			storymap.location.pitch = 0;
		}
	}

	storymap.chapters.forEach((ch) => {
		ch.style = `${url.origin}${ch.style}`;
	});

	storymap.links = storymap.links?.map((l) => {
		const _url = new URL(decodeURI(l.href), url.origin);
		const subUrl = _url.searchParams.get('url');
		if (subUrl) {
			_url.searchParams.set('url', new URL(subUrl, url.origin).href);
		}
		l.href = decodeURI(_url.href);
		return l;
	});

	if (!embed) {
		const accessLevel = storymap.access_level;
		if (accessLevel === AccessLevel.PRIVATE) {
			if (!(storymap.permission && storymap.permission >= Permission.READ)) {
				error(403, { message: 'Permission error' });
			}
		} else if (accessLevel === AccessLevel.ORGANIZATION) {
			let domain = '';
			if (user_email) {
				domain = getDomainFromEmail(user_email);
			}
			if (!(domain && storymap.created_user && storymap.created_user.indexOf(domain) > -1)) {
				if (!(storymap.permission && storymap.permission >= Permission.READ)) {
					error(403, { message: 'Permission error' });
				}
			}
		}
	}

	const staticUrl = storymap.links?.find((l) => l.rel === 'ogimage')?.href;
	const socialImageUrl = staticUrl ?? socialImage;

	const title = `${storymap.title} | GeoHub`;
	const site_description = `GeoHub storymap for ${storymap.title}`;

	return {
		title,
		site_description,
		storymap,
		socialImage: socialImageUrl
	};
};
