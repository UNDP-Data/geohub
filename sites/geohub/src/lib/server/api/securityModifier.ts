import type { RouteModifier } from 'sveltekit-api';

export const AddSecurictyModifier: RouteModifier = (c) => {
	c.security = [
		{
			'Azure AD authentication': [],
			'API access token': [],
			'API access token from header': []
		}
	];
	return c;
};
