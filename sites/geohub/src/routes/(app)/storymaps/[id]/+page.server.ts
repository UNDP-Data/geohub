import type { PageServerLoad } from './$types';
import { loadStorymapById } from '$lib/server/helpers/loadStorymapById';

export const load: PageServerLoad = async (event) => {
	const { params, parent, fetch } = event;
	const { session, socialImage } = await parent();
	const user = session?.user;
	const id = params.id;
	const user_email = user?.email as string;
	const res = await loadStorymapById(id, user_email, socialImage, fetch);
	return res;
};
