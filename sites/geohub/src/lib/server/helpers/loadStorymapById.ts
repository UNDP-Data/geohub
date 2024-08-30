import { AccessLevel, Permission } from '$lib/config/AppConfig';
import { getDomainFromEmail } from '$lib/helper';
import type { StoryMapConfig } from '$lib/types';
import { error } from '@sveltejs/kit';

export const loadStorymapById = async (
	id: string,
	user_email: string,
	socialImage: string,
	fetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>
) => {
	const res = await fetch(`/api/storymaps/${id}`);

	if (!res.ok) {
		if (res.status === 403) {
			error(res.status, { message: 'No permission to access' });
		} else if (res.status === 404) {
			error(res.status, { message: 'No storymap found' });
		} else {
			error(res.status, { message: res.statusText });
		}
	}

	const storymap: StoryMapConfig = await res.json();

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
