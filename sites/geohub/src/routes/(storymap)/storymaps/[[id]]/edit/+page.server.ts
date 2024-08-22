import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { getDomainFromEmail } from '$lib/helper';
import { AccessLevel, Permission } from '$lib/config/AppConfig';
import type { DashboardMapStyle, StoryMapConfig } from '$lib/types';

export const load: PageServerLoad = async ({ params, parent, fetch, url }) => {
	const { session, socialImage } = await parent();

	if (!session) {
		error(403, { message: 'No permission to access' });
	}

	const user = session?.user;
	const id = params.id;

	if (!id) {
		const styleId = url.searchParams.get('style');
		const resStyle = await fetch(`/api/style/${styleId}`);
		if (resStyle.ok) {
			const style: DashboardMapStyle = await resStyle.json();
			const storymap: StoryMapConfig = {
				title: style.name,
				style: style.links.find((l) => l.rel === 'stylejson')?.href as string,
				style_id: styleId as unknown as number,
				chapters: [],
				showProgress: true,
				template_id: 'light',
				access_level: AccessLevel.PRIVATE
			};
			return {
				storymap,
				socialImage
			};
		}

		return {
			socialImage: socialImage
		};
	}
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

	const storymap = await res.json();

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
	} else {
		if (!(storymap.permission && storymap.permission > Permission.READ)) {
			error(403, { message: 'Permission error' });
		}
	}

	const staticUrl = storymap.links.find((l) => l.rel === 'ogimage')?.href;
	const socialImageUrl = staticUrl ?? socialImage;

	return {
		storymap,
		socialImage: socialImageUrl
	};
};
