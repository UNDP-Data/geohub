import type { LayoutServerLoad } from './$types';
import type { UserConfig } from '$lib/config/DefaultUserConfig';
import { generateHashKey } from '$lib/server/helpers';

export const load: LayoutServerLoad = async (event) => {
	const session = await event.locals.getSession();

	if (session?.user?.email) {
		session.user.id = generateHashKey(session.user.email);
	}
	// console.log(session);
	let config: UserConfig;
	const response = await event.fetch('/api/settings');
	if (response.ok) {
		config = await response.json();
	}
	return {
		session,
		config
	};
};
