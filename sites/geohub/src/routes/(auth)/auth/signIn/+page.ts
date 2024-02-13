import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
	const title = 'Sign In | GeoHub';
	const content = 'Sign In';

	let providers = [
		{
			id: 'azure-ad-b2c',
			label: `UN Agencies account`,
			description: `UNDP and all other UN agencies can be authenticated through UNDP B2C login service. 
			<br>
			If you encounter <b>Need admin approval</b> error when you sign in, please contact your agency's IT to grant access to GeoHub app.`,
			icon: '/assets/un-logo-white.svg'
		},
		{
			id: 'github',
			label: 'GitHub account',
			description: 'Sign into GeoHub using your GitHub account',
			icon: 'fa-brands fa-github fa-lg'
		}
	];

	const res = await fetch('/auth/providers');
	const authProviders: { [key: string]: unknown } = await res.json();
	const availableNames = Object.keys(authProviders);
	providers = providers.filter((p) => availableNames.includes(p.id));

	return {
		title,
		content,
		providers
	};
};
