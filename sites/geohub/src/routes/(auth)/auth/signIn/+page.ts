import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
	const title = 'Sign In | GeoHub';
	const content = 'Sign In';

	const providers = [
		{ id: 'azure-ad', label: 'UNDP', icon: '/assets/undp-images/undp-logo-white.svg' },
		{ id: 'github', label: 'GitHub', icon: 'fa-brands fa-github fa-xl' }
	];

	return {
		title,
		content,
		providers
	};
};
