import type { PageServerLoad } from './$types';
import { env } from '$env/dynamic/private';

export const load: PageServerLoad = async () => {
	return {
		azureUrl: `https://${env.AZURE_STORAGE_ACCOUNT}.blob.core.windows.net`,
		titilerUrl: env.TITILER_ENDPOINT
	};
};
