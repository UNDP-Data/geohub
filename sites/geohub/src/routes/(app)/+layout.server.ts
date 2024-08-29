import type { LayoutServerLoad } from './$types';
import { DefaultUserConfig, type UserConfig } from '$lib/config/DefaultUserConfig';

export const load: LayoutServerLoad = async (event) => {
	let config: UserConfig = DefaultUserConfig as UserConfig;
	const response = await event.fetch('/api/settings');
	if (response.ok) {
		config = await response.json();
	}
	return {
		config
	};
};
