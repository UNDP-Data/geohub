import type { LayoutServerLoad } from './$types';
import { env } from '$env/dynamic/private';

export const load: LayoutServerLoad = async () => {
	return {
		azureUrl: `https://${env.AZURE_STORAGE_ACCOUNT}.blob.core.windows.net`,
		titilerUrl: env.TITILER_ENDPOINT
	};
};
