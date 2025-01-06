import type { HeaderLink } from '@undp-data/svelte-undp-design';
import { env } from '$env/dynamic/private';

export type LineName = 'home' | 'map' | 'support' | 'data' | 'tools';

export const HeaderItems = (linkNames: LineName[]) => {
	const links: { [key: string]: HeaderLink } = {
		home: {
			id: 'header-link-home',
			title: 'Home',
			href: '/'
		},
		map: {
			id: 'header-link-map',
			title: 'Maps',
			href: '/maps'
		},
		support: {
			id: 'header-link-support',
			title: 'Support',
			href: env.GEOHUB_DOCS_ENDPOINT ?? '',
			children: [
				{
					id: 'header-sublink-documentation',
					title: 'Documentation',
					href: env.GEOHUB_DOCS_ENDPOINT ?? '',
					linkType: 'external'
				},
				{
					id: 'header-sublink-github',
					title: 'GitHub repo',
					href: 'https://github.com/UNDP-Data/geohub',
					linkType: 'external'
				},
				{
					id: 'header-sublink-contactus',
					title: 'Contact us',
					href: 'https://data.undp.org/contact-us'
				}
			]
		},
		data: {
			id: 'header-link-data',
			title: 'Data',
			href: '/data'
		},
		tools: {
			id: 'header-link-tool',
			title: 'Solutions',
			children: [
				{
					id: 'header-link-tool-1',
					title: 'Tools',
					href: '/tools'
				},

				{
					id: 'header-link-tool-3',
					title: 'Dashboards',
					href: '/dashboards'
				},
				{
					id: 'header-link-tool-2',
					title: 'Storymaps',
					href: '/storymaps'
				}
			]
		}
	};

	let linkItems = linkNames.map((name) => links[name]);

	linkItems = linkItems.filter((l) => l.href !== '');

	return linkItems;
};
