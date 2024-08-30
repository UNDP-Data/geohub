import type { LayoutServerLoad } from './$types';
import { DefaultUserConfig, type UserConfig } from '$lib/config/DefaultUserConfig';
import { env } from '$env/dynamic/private';

export const load: LayoutServerLoad = async (event) => {
	let config: UserConfig = DefaultUserConfig as UserConfig;
	const response = await event.fetch('/api/settings');
	if (response.ok) {
		config = await response.json();
	}
	return {
		config,
		maptilerKey: env.MAPTILER_API_KEY
	};
};
