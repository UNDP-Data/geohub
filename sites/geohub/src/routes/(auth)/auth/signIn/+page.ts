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
			icon: '/assets/Small_Flag_of_the_United_Nations_ZP.svg.png'
		},
		{
			id: 'github',
			label: 'GitHub account',
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
