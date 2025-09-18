import type { PageServerLoad } from './$types';
import { env } from '$env/dynamic/private';
import { attribution } from '$lib/config/AppConfig';

export const load: PageServerLoad = async ({ url }) => {
	const attrs = [attribution, `<a target="_top" rel="noopener" href="https://www.ibm.com">IBM</a>`];

	const azureUrl = `https://${env.AZURE_STORAGE_ACCOUNT_UPLOAD}.blob.core.windows.net`;

	const title = 'Electricity Dashboard | GeoHub';
	const content = 'Electricity dashboard';
	const site_description = `The 'Affordable and clean energy' dashboard helps identify vulnerable areas in the world that have limited or no access to energy.`;

	const adminUrl = `${azureUrl}/hrea/admin/v5`;

	return {
		azureUrl,
		titilerUrl: env.TITILER_ENDPOINT,
		maptilerKey: env.MAPTILER_API_KEY,
		attribution: attrs.join(', '),
		ibmLogo: '/assets/ibm/IBM_logo.svg',
		adminUrl,
		title,
		content,
		site_description,
		socialImage: `${url.origin}/assets/electricity-snapshot.png`
	};
};
