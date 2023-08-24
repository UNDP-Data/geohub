import type { PageServerLoad } from './$types';
import { getStyleById } from '$lib/server/helpers';
import { redirect } from '@sveltejs/kit';
import type { DashboardMapStyle } from '$lib/types';

export const load: PageServerLoad = async (event) => {
	const { locals, url, params } = event;
	const session = await locals.getSession();
	const user = session?.user;

	const styleId = params.id;
	const style = (await getStyleById(Number(styleId), url, user?.email)) as DashboardMapStyle;
	if (!style) {
		throw redirect(300, `${url.origin}/map`);
	}

	return {
		style
	};
};
