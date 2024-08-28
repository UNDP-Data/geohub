import type { PageServerLoad } from './$types';
import type { StoryMapConfig } from '$lib/types';
import { error } from '@sveltejs/kit';
import { AccessLevel, Permission } from '$lib/config/AppConfig';
import { getDomainFromEmail } from '$lib/helper';

export const load: PageServerLoad = async ({ fetch, params, parent }) => {
	const { session, socialImage } = await parent();
	const user = session?.user;

	const id = params.id;

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

	const accessLevel: AccessLevel = storymap.access_level;
	if (accessLevel === AccessLevel.PRIVATE) {
		if (!(storymap.permission && storymap.permission >= Permission.READ)) {
			error(403, { message: 'Permission error' });
		}
	} else if (accessLevel === AccessLevel.ORGANIZATION) {
		let domain: string;
		if (user?.email) {
			domain = getDomainFromEmail(user?.email);
		}
		if (!(domain && storymap.created_user?.indexOf(domain) > -1)) {
			if (!(storymap.permission && storymap.permission >= Permission.READ)) {
				error(403, { message: 'Permission error' });
			}
		}
	}

	const staticUrl = storymap.links.find((l) => l.rel === 'ogimage')?.href;
	const socialImageUrl = staticUrl ?? socialImage;

	const title = `${storymap.title} | GeoHub`;
	const site_description = `GeoHub storymap for ${storymap.title} credited by ${storymap.byline}`;

	return {
		title,
		site_description,
		storymap,
		socialImage: socialImageUrl
	};
};
