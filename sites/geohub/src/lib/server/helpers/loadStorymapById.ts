import { AccessLevel, Permission } from '$lib/config/AppConfig';
import { getDomainFromEmail } from '$lib/helper';
import type { StoryMapConfig } from '$lib/types';
import { error } from '@sveltejs/kit';
import DatabaseManager from '../DatabaseManager';
import StorymapManager from '../StorymapManager';
import { isSuperuser } from './isSuperuser';

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

	let storymap: StoryMapConfig | undefined;

	const dbm = new DatabaseManager();
	const client = await dbm.start();
	try {
		const sm = new StorymapManager();
		storymap = await sm.getById(client, id, is_superuser, user_email);
		if (!storymap) {
			error(404, { message: `No storymap found.` });
		}

		if (storymap.style) {
			storymap.style = `${url.origin}${storymap.style}`;
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
	} finally {
		dbm.end();
	}

	// const res = await fetch(`/api/storymaps/${id}`);

	// if (!res.ok) {
	// 	if (res.status === 403) {
	// 		error(res.status, { message: 'No permission to access' });
	// 	} else if (res.status === 404) {
	// 		error(res.status, { message: 'No storymap found' });
	// 	} else {
	// 		error(res.status, { message: res.statusText });
	// 	}
	// }

	// const storymap: StoryMapConfig = await res.json();

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
