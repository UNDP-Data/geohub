import type { LayoutServerLoad } from './$types';
import { env } from '$env/dynamic/private';
import type { UserConfig } from '$lib/config/DefaultUserConfig';

export const load: LayoutServerLoad = async (event) => {
	const session = await event.locals.getSession();
	let config: UserConfig;
	const response = await event.fetch('/api/settings');
	if (response.ok) {
		config = await response.json();
	}
	return {
		session,
		config,
		azureUrl: `https://${env.AZURE_STORAGE_ACCOUNT}.blob.core.windows.net`
	};
};
