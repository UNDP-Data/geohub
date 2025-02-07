import type { PageServerLoad } from './$types';
import { env } from '$env/dynamic/private';
import { attribution } from '$lib/config/AppConfig';

export const load: PageServerLoad = async ({ url }) => {
	const attrs = [attribution, `<a target="_top" rel="noopener" href="https://www.ibm.com">IBM</a>`];

	const azureUrl = `https://${env.AZURE_STORAGE_ACCOUNT_UPLOAD}.blob.core.windows.net`;

	const title = 'CEEI Dashboard | GeoHub';
	const content = 'CEEI dashboard';
	const site_description = `This dashboard maps the Clean Energy Equity Index (CEEI) for the area. The dashboard allows the user to adjust the data computation to simulate various scenarios for the CEEI value.`;

	return {
		azureUrl,
		maptilerKey: env.MAPTILER_API_KEY,
		attribution: attrs.join(', '),
		ibmLogo: '/assets/ibm/IBM_logo.svg',
		title,
		content,
		site_description,
		socialImage: `${url.origin}/assets/ceei-snapshot.png`
	};
};
