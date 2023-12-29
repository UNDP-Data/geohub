import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
	const title = 'Sign In | GeoHub';
	const content = 'Sign In';

	const providers = [
		{
			id: 'azure-ad-b2c',
			label: `UN Agencies account`,
			description:
				'UNDP and all other UN agencies can be authenticated through UNDP B2C login service',
			icon: '/assets/un-logo-white.svg'
		},
		{
			id: 'github',
			label: 'GitHub account',
			description: 'Sign into GeoHub using your GitHub account',
			icon: 'fa-brands fa-github fa-lg'
		}
	];

	return {
		title,
		content,
		providers
	};
};
