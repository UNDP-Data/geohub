import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
	const title = 'Sign In | GeoHub';
	const content = 'Sign In';

	const providers = [
		{
			id: 'azure-ad-b2c',
			label: 'UNDP B2C',
			description: 'UNDP and all other UN agencies can be authenticated through B2C login',
			icon: '/assets/undp-images/undp-logo-white.svg'
		},
		{
			id: 'github',
			label: 'GitHub',
			description: 'GitHub account can also be used to sign in to GeoHub',
			icon: 'fa-brands fa-github fa-xl'
		}
	];

	return {
		title,
		content,
		providers
	};
};
