import type { DashboardMapStyle, StacLink } from '$lib/types';

export const createStyleLinks = (style: DashboardMapStyle, url: URL) => {
	const links: StacLink[] = [
		{
			rel: 'root',
			type: 'application/json',
			href: `${url.origin}${url.pathname}`
		},
		{
			rel: 'self',
			type: 'application/json',
			href: `${url.origin}${url.pathname}`
		},
		{
			rel: 'map',
			type: 'text/html',
			href: `${url.origin}/map/${style.id}`
		},
		{
			rel: 'stylejson',
			type: 'application/json',
			href: `${url.origin}/api/style/${style.id}.json`
		},
		{
			rel: 'static-auto',
			type: 'application/json',
			href: `${url.origin}/api/style/${style.id}/static/auto/{width}x{height}.png`
		},
		{
			rel: 'static-bbox',
			type: 'application/json',
			href: `${url.origin}/api/style/${style.id}/static/{bbox}/{width}x{height}.png`
		},
		{
			rel: 'static-center',
			type: 'application/json',
			href: `${url.origin}/api/style/${style.id}/static/{lon},{lat},{zoom},{bearing},{pitch}/{width}x{height}.png`
		}
	];

	return links;
};
