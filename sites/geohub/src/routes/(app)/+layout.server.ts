import type { LayoutServerLoad } from './$types';
import type { UserConfig } from '$lib/config/DefaultUserConfig';

export const load: LayoutServerLoad = async (event) => {
	let config: UserConfig;
	const response = await event.fetch('/api/settings');
	if (response.ok) {
		config = await response.json();
	}
	return {
		config
	};
};
