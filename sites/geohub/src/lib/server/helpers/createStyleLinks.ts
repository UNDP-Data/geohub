import type { DashboardMapStyle, Link } from '$lib/types';
import { env } from '$env/dynamic/private';

export const createStyleLinks = (style: DashboardMapStyle, url: URL) => {
	const isLocalHost = url.origin.indexOf('localhost') > -1;
	const staticApiRoot = isLocalHost
		? `${url.origin}/api/style/${style.id}/static`
		: `${env.GEOHUB_STATIC_IMAGE_API}/style/static`;

	const styleJSON = `${url.origin}/api/style/${style.id}.json`;
	const links: Link[] = [
		{
			rel: 'root',
			type: 'application/json',
			href: `${url.origin}/api`
		},
		{
			rel: 'self',
			type: 'application/json',
			href: `${url.origin}/api/style/${style.id}`
		},
		{
			rel: 'map',
			type: 'text/html',
			href: `${url.origin}/map/${style.id}`
		},
		{
			rel: 'stylejson',
			type: 'application/json',
			href: styleJSON
		},
		{
			rel: 'static-auto',
			type: 'application/json',
			href: `${staticApiRoot}/auto/{width}x{height}.webp${isLocalHost ? '' : `?url=${styleJSON}`}`
		},
		{
			rel: 'static-bbox',
			type: 'application/json',
			href: `${staticApiRoot}/{bbox}/{width}x{height}.webp${isLocalHost ? '' : `?url=${styleJSON}`}`
		},
		{
			rel: 'static-center',
			type: 'application/json',
			href: `${staticApiRoot}/{lon},{lat},{zoom},{bearing},{pitch}/{width}x{height}.webp${
				isLocalHost ? '' : `?url=${styleJSON}`
			}`
		}
	];

	return links;
};
