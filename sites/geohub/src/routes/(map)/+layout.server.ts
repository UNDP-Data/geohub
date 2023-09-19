import { generateHashKey } from '$lib/server/helpers';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	const session = await locals.getSession();
	if (session?.user?.email) {
		session.user.id = generateHashKey(session.user.email);
	}
	return {
		session
	};
};
