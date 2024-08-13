import type { LayoutServerLoad } from './$types';
import { env } from '$env/dynamic/private';
import { attribution } from '$lib/config/AppConfig';

export const load: LayoutServerLoad = async () => {
	const attrs = [attribution, `<a target="_top" rel="noopener" href="https://www.ibm.com">IBM</a>`];

	return {
		azureUrl: `https://${env.AZURE_STORAGE_ACCOUNT_UPLOAD}.blob.core.windows.net`,
		titilerUrl: env.TITILER_ENDPOINT,
		maptilerKey: env.MAPTILER_API_KEY,
		attribution: attrs.join(', ')
	};
};
