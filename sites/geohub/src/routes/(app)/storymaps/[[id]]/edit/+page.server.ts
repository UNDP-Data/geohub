import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { AccessLevel } from '$lib/config/AppConfig';
import type { DashboardMapStyle, StoryMapConfig } from '$lib/types';
import { loadStorymapById } from '$lib/server/helpers/loadStorymapById';

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

	const user_email = user?.email as string;
	const res = await loadStorymapById(id, user_email, socialImage, url);

	return {
		...res
	};
};
