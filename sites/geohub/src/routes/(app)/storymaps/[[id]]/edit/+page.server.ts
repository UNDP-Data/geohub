import type { PageServerLoad } from './$types';
import { AccessLevel } from '$lib/config/AppConfig';
import type { DashboardMapStyle, StoryMapConfig } from '$lib/types';
import { loadStorymapById } from '$lib/server/helpers/loadStorymapById';

export const load: PageServerLoad = async ({ params, parent, fetch, url }) => {
	const { session, socialImage } = await parent();

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
				location: {
					center: (style.style?.center as [number, number]) ?? [0, 0],
					zoom: style.style?.zoom ?? 0,
					bearing: style.style?.bearing ?? 0,
					pitch: style.style?.pitch ?? 0
				},
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
