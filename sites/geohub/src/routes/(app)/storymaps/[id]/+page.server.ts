import type { PageServerLoad } from './$types';
import { loadStorymap } from './loadStorymap';

export const load: PageServerLoad = async (event) => {
	const { params, parent, fetch } = event;
	const { session, socialImage } = await parent();
	const user = session?.user;
	const id = params.id;
	const user_email = user?.email as string;
	const res = await loadStorymap(id, user_email, socialImage, fetch);
	return res;
};
