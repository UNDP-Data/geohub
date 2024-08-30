import type { PageServerLoad } from './$types';
import { loadStorymap } from '../loadStorymap';

export const load: PageServerLoad = async ({ fetch, params, parent }) => {
	const { session, socialImage } = await parent();
	const user = session?.user;
	const id = params.id;
	const user_email = user?.email as string;
	const res = await loadStorymap(id, user_email, socialImage, fetch);
	return res;
};
