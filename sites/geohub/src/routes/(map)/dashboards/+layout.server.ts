import type { LayoutServerLoad } from './$types';
import { env } from '$env/dynamic/private';
import { attribution } from '$lib/config/AppConfig';

export const load: LayoutServerLoad = async () => {
	const attrs = [attribution, `<a target="_top" rel="noopener" href="https://www.ibm.com">IBM</a>`];

	const azureUrl = `https://${env.AZURE_STORAGE_ACCOUNT_UPLOAD}.blob.core.windows.net`;

	return {
		azureUrl,
		titilerUrl: env.TITILER_ENDPOINT,
		maptilerKey: env.MAPTILER_API_KEY,
		attribution: attrs.join(', '),
		ibmLogo: '/assets/ibm/IBM_logo.svg'
	};
};
