import type { PageServerLoad } from './$types';
import { env } from '$env/dynamic/private';

export const load: PageServerLoad = async ({ locals }) => {
	const session = await locals.getSession();
	return {
		session,
		azureUrl: `https://${env.AZURE_STORAGE_ACCOUNT}.blob.core.windows.net`,
		titilerUrl: env.TITILER_ENDPOINT
	};
};
