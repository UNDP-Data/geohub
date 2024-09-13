import type { PageServerLoad } from './$types';
import { loadStorymapById } from '$lib/server/helpers/loadStorymapById';

export const load: PageServerLoad = async ({ params, parent, url }) => {
	const { session, socialImage } = await parent();
	const user = session?.user;
	const id = params.id;
	const user_email = user?.email as string;

	const embed = url.searchParams.get('embed');
	const isEmbed = embed && embed.toLowerCase() === 'true' ? true : false;
	const res = await loadStorymapById(id, user_email, socialImage, url, isEmbed);
	return res;
};
